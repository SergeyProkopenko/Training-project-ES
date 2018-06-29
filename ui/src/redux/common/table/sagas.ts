import { take, call, put, fork, cancel, select } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { 
  TableActions, 
  Pagination, 
  LoadDataProps, 
  RemoveDataProps, 
  AddDataProps, 
  EditDataProps
  } from './types';
import { getSearchString, getPagination } from './reducer';
import * as Api from './api';

// worker sagas
function* loadData(params: LoadDataProps): IterableIterator<any> {
  const {
    prefix,
    url,
    currentPage,
    needDelay,
    payloadFunc,
  } = params;

  try {
    if (needDelay) {
      yield call(delay, 500);
    }

    const { docs, total } = yield call(Api.fetchData, url);

    yield put({
      type: `${prefix}/${TableActions.LOAD_DATA_SUCCESS}`,
      payload: {
        data: payloadFunc(docs),
        pagination: {
          current: currentPage,
          total,
        }
      },
    })
  } catch (error) {
    yield put({
      type: `${prefix}/${TableActions.LOAD_DATA_FAILURE}`,
      payload: {
        error: error.message,
      }
    })
  }
}

function* removeData(params: RemoveDataProps): IterableIterator<any> {
  const {
    prefix,
    _id,
    payloadFunc,
  } = params;

  try {
    const searchString = yield select(getSearchString, prefix);
    const { data } = yield call(Api.removeData, _id, searchString);
    const pagination = yield select(getPagination, prefix);
    const newPagination = updatePaginationIfNeeded(pagination, typeof data === 'object' ? data.total : data)
    yield fork(loadData, {
      prefix,
      url: buildUrlForLoadData(newPagination, prefix),
      currentPage: newPagination.current,
      needDelay: false,
      payloadFunc,
    })
  } catch (error) {
    yield put({
      type: `${prefix}/${TableActions.LOAD_DATA_FAILURE}`,
      payload: {
        error: error.message,
      }
    })
  }
}

function* addData(params: AddDataProps): IterableIterator<any> {
  const {
    prefix,
    name,
    author,
    cost,
    payloadFunc,
  } = params;

  try {
    
    const { data } = yield call(Api.addData, name, author, cost);
    const pagination = yield select(getPagination, prefix);
    const newPagination = updatePaginationIfNeeded(pagination, typeof data === 'object' ? data.total : data)
    yield fork(loadData, {
      prefix,
      url: buildUrlForLoadData(newPagination, prefix),
      currentPage: newPagination.current,
      needDelay: false,
      payloadFunc,
    })
  } catch (error) {
    yield put({
      type: `${prefix}/${TableActions.LOAD_DATA_FAILURE}`,
      payload: {
        error: error.message,
      }
    })
  }
}

function* editData(params: EditDataProps): IterableIterator<any> {
  const {
    prefix,
    _id,
    name,
    author,
    cost,
    payloadFunc,
  } = params;

  try {    
    const { data } = yield call(Api.editData, _id, name, author, cost);
    const pagination = yield select(getPagination, prefix);
    const newPagination = updatePaginationIfNeeded(pagination, typeof data === 'object' ? data.total : data)
    yield fork(loadData, {
      prefix,
      url: buildUrlForLoadData(newPagination, prefix),
      currentPage: newPagination.current,
      needDelay: false,
      payloadFunc,
    })
  } catch (error) {
    yield put({
      type: `${prefix}/${TableActions.LOAD_DATA_FAILURE}`,
      payload: {
        error: error.message,
      }
    })
  }
}

// helpers
const buildUrlForLoadData = (params: Pagination | string, prefix: string): string => {
  const fullPrefix = `data/${prefix.slice(2)}`;
  if (typeof params === 'string') {
    return `${fullPrefix}/find?search=${encodeURIComponent(params)}`
  } else {
    const { pageSize, current } = params;
    return `${fullPrefix}?value=&offset=${current > 1 ? pageSize * (current - 1) : 0}&limit=${pageSize}`
  }
}

// watcher sagas
export function* loadDataSaga(prefix: string, getSuccessPayload: Function): IterableIterator<any> {
  while (true) {
    const { payload: { pagination } } = yield take(`${prefix}/${TableActions.LOAD_DATA}`);
    //const searchString = yield select(getSearchString, prefix);
    yield fork(loadData, {
      prefix,
      url: buildUrlForLoadData(pagination, prefix),
      currentPage: pagination.current,
      needDelay: false,
      payloadFunc: getSuccessPayload,
    });
  }
}

export function* searchDataSaga(prefix: string, getSuccessPayload: Function): IterableIterator<any> {
  let task
  while (true) {
    const { payload: { value } } = yield take(`${prefix}/${TableActions.SEARCH_DATA}`);
    if (task) {
      yield cancel(task)
    }
    task = yield fork(loadData, {
      prefix,
      url: buildUrlForLoadData(value, prefix),
      currentPage: 1,
      needDelay: true,
      payloadFunc: getSuccessPayload,
    });
  }
}

export function* removeDataSaga(prefix: string, getSuccessPayload: Function): IterableIterator<any> {
  while (true) {
    const { payload: { _id } } = yield take(`${prefix}/${TableActions.REMOVE_DATA}`);
    yield fork(removeData, {
      prefix,
      _id,
      payloadFunc: getSuccessPayload,
    });
  }
}

export function* addDataSaga(prefix: string, getSuccessPayload: Function): IterableIterator<any> {
  while (true) {
    const { payload: { name, author, cost } } = yield take(`${prefix}/${TableActions.ADD_DATA}`);
    yield fork(addData, {
      prefix,
      name,
      author,
      cost,
      payloadFunc: getSuccessPayload,
    });
  }
}

export function* editDataSaga(prefix: string, getSuccessPayload: Function): IterableIterator<any> {
  while (true) {
    const { payload: { _id, name, author, cost } } = yield take(`${prefix}/${TableActions.EDIT_DATA}`);
    yield fork(editData, {
      prefix,
      _id,
      name,
      author,
      cost,
      payloadFunc: getSuccessPayload,
    });
  }
}


const updatePaginationIfNeeded = (pagination: Pagination, total: number): Pagination => {
  const {
    pageSize,
    current
  } = pagination;

  if (total <= pageSize * (current - 1)) {
    return {
      pageSize,
      current: Math.ceil(total / pageSize),
      total,
    }
  }
  return pagination
}