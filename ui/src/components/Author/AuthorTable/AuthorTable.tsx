import * as React from 'react';
import { Table, Button, Icon, Popconfirm, message, Input, Form, Modal, DatePicker} from 'antd';
import { Author } from '@redux/authors/types';
import { ColumnProps } from 'antd/lib/table';
import { Pagination } from '@redux/common/table/types';
import { AuthorsTableProps } from '@components/Author/AuthorTable/FilterableAuthorsTable';
import LazyLoad from 'react-lazyload';

const FormItem = Form.Item;
const dateFormat = 'YYYY.MM.DD';

export default class AuthorTable extends React.PureComponent<AuthorsTableProps> {

    state = { 
      _id: "",     
      name: "",
      surname:"",
      dod: "",
      dob: "",
      validateStatusErrorName: undefined,
      validateStatusErrorSurname: undefined,
      validateStatusErrorLifetime: undefined,
      nameError: "",    
      surnameError: "",
      lifetimeError: "",
      visible: false,

    };    
    
    handleCancel = () => this.setState({ previewVisible: false })
    
    handlePreview = () => {
      this.setState({
        previewVisible: true, 
      });
    }

    changeDoB = (date: any,  dateString: any) => {
      this.state.dob = dateString;
    };
    changeDoD = (date: any,  dateString: any) => {
      this.state.dod = dateString;
    };

    editAuthor = (_id: string) => {  

      const {        
        editAuthor
      } = this.props;

      this.setState({        
        name: "",
        surname: "",
        dob: "",
        dod: "",
        validateStatusErrorName: undefined,
        validateStatusErrorSurname: undefined,
        nameError: "",
        surnameError: ""
    }); 

      const err = this.validate();

      if(!err) {
        editAuthor(this.state._id, this.state.name, this.state.surname, this.state.dod, this.state.dob);
        this.state;
        this.state.visible = false;     
        message.success('Edited!');
      } 
    };

   
    private readonly columns: ColumnProps<Author>[] = [ 
      {
        title: 'Name',
        dataIndex: 'name',           
        key: 'name',  
        width: '300px',  
        render: (text, record) => 
        <LazyLoad
          height="25px"          
          debounce={true}
          once>
          <span>
          {record.name }
          </span>
        </LazyLoad>  
      },      
      {
        title: 'Surname',
        dataIndex: 'surname',
        key: 'surname',
        render: (text, record) => 
        <LazyLoad
          height="25px"          
          debounce={true}
          once>
        <span>{record.surname}</span>
        </LazyLoad>
      },
      {
        title: 'Lifetime',
        dataIndex: 'lifetime',
        key: 'lifetime', 
        render: (text, record) => {
          let fieldBirth, fieldDeath;
          if(record.dob === null) {
            fieldBirth = "Date of birth unknown";
          } else {
            fieldBirth = record.dob;
          }

          if(record.dod === null) {
            fieldDeath = "Date of death unknown";
          } else {
            fieldDeath = record.dod;
          }
          return(
            <LazyLoad
            height="25px"          
            debounce={true}
            once>
              <span>
                {fieldBirth + " — " + fieldDeath}
              </span>
          </LazyLoad>);
        }  
      },
      { 
        title: "Delete",                               
        render: (text, record) =>
        <LazyLoad
          height="25px"          
          debounce={true}
          once>
        <div> 
          <Popconfirm title="Are you sure?" 
            onConfirm={() => this.removeAuthor(record.key)}            
            onCancel={() => message.error('Cancel!')}
            okText="Yes"
            cancelText="No">
              <Button
                size="small"
                type="danger">                
                Delete
                <Icon type="warning" /> 
              </Button>              
          </Popconfirm>                              
        </div>
        </LazyLoad>
      },
      {
        title: 'Edit',
        render: (text, record) => 
        <div>
            <Modal
                onOk={() => this.editAuthor(record.key)}
                onCancel={() =>  this.setState({ visible: false })}
                visible={this.state.visible}  
                title="Edit">
              <Form className="login-form">
                <FormItem
                  label="Name"
                  validateStatus={this.state.validateStatusErrorName}
                  help={this.state.nameError}>
                  <Input
                    prefix={<Icon type="bars" />} 
                    placeholder="Edit the name"
                    value={this.state.name}
                    onChange={e => this.change(e)}
                    name="name"
                  />
                </FormItem>
                <FormItem
                  label="Surname"
                  validateStatus={this.state.validateStatusErrorSurname}
                  help={this.state.surnameError}>                    
                  <Input
                    prefix={<Icon type="bars" />}                      
                    placeholder="Edit the surname" 
                    value={this.state.surname}
                    onChange={e => this.change(e)}
                    name="surname"
                  />
                </FormItem>
                <FormItem
                  label="Lifetime"
                  validateStatus={this.state.validateStatusErrorLifetime}
                  help={this.state.lifetimeError}>
                   <DatePicker 
                    format={dateFormat} 
                    style={{marginLeft: 5}}
                    onChange={this.changeDoB}
                    //onChange={(value, dateString) => this.changeDoD(value, dateString)}
                    placeholder={"Date of Birth"}
                  />
                   <DatePicker 
                      format={dateFormat} 
                      style={{marginLeft: 5}}
                      onChange={this.changeDoD}
                     // onChange={(value, dateString) => this.changeDoD(value, dateString)}
                      placeholder={"Date of Death"}
                    />
                </FormItem>                                 
              </Form>
            </Modal>         
            <Button 
              size="small"
              onClick={() => this.startEdit(record)}>
              Edit
              <Icon type="edit" />
            </Button>          
        </div>
      }
    ]
    
    onChange = (checkedList: any) => { 
      this.setState({
        genre: checkedList,
        checkedList,
      });
    }

    validate = () => {      
      let isError = false;
      if(this.state.name.length <= 0 ) {
        isError = true;
        this.setState({
          nameError: "Please, enter the Name",
          validateStatusErrorName: "error"
        });
      }
  
      if(this.state.surname.length <= 0) {
        isError = true;
        this.setState({
          surnameError: "Please, enter the Surname",
          validateStatusErrorSurname: "error"
        });
      } 
      return isError;
    };

    change = (e: any) => {
      this.setState({
          [e.target.name]: e.target.value        
      });
    };   
   
    startEdit = (record: Author) => {      
      this.setState({
        _id: record.key,
        name: record.name,
        surname: record.surname,
        dob: record.dob,
        dod: record.dod,
        visible: true
      });
    };

    removeAuthor = (_id: string) => {
      const {     
        pagination,
        removeAuthor
      } = this.props;  
      removeAuthor(_id, pagination);
      message.success('Deleted!');      
    };
    
    componentDidMount() {     
      const {
        pagination: {
          pageSize,
          current,
        },
        loadAuthors,                
      } = this.props;  
      loadAuthors({ pageSize, current });
    };
  
    handleTableChange = ({ pageSize, current }: Pagination) => {
        this.props.loadAuthors({ pageSize, current });      
    };   

    
  
    render() {
      const {
        loading,
        pagination,
        authors               
      } = this.props;
  
      return (
        <div>    
          <Table          
            bordered
            columns={this.columns}
            dataSource={authors}          
            loading={loading}
            pagination={pagination}
            size='small'
            style={{ width: 1100 }}
            onChange={this.handleTableChange}
          />    
        </div>                
      )
    }
  }