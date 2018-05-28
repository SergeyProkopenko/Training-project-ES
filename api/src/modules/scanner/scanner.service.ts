import * as cheerio from 'cheerio';
import {resolve, URL} from 'url';
import {Component} from '@nestjs/common';
import {SELECTORS, ScannerInstance, FILTERS} from './scanner.instance';
import {CssPath} from './scanner.csspath';
import {FetchOut, Meta, SampleList, SampleOut, SampleResponse, SelectorOut} from './scanner.sample';
import {EuristicMeta} from './scanner.euristic';
import {SampleModel} from "../fetch/fetch.model";

@Component()
export class ScannerService {

    constructor() {

    }

    fetchAll = async (url: string): Promise<FetchOut> => {
        const sortEuristic: EuristicMeta = new EuristicMeta();
        let cssPaths: CssPath[];
        try {
            cssPaths = await this.getPathsByUrl(url, SELECTORS.LINKS);
        } catch (e) {
            return e;
        }

        sortEuristic.url = new URL(url);

        const listPaths: SampleList = SampleList.fromPaths(cssPaths, 0)
            .groupBy('selector')
            .distinct()
            .orderByDesc(sortEuristic)
            .unique()
            .takeSample(1)
            .take(0, 10);

         return {selectors:listPaths.toOut(), meta: {image: "ggg", title: "dfghdfhdhf"}};
    };

    fetchOne = async (url: string, selector: string, before?: SampleModel): Promise<SampleResponse> => {
        const response: SampleResponse = new SampleResponse();
        let cssPaths: CssPath[];
        try {
            cssPaths = await this.getPathsByUrl(url, selector);
        } catch (e) {
            return e;
        }
        const listPaths: SelectorOut[] = SampleList.fromPaths(cssPaths, 0)
            .unique()
            .take(0, 20)
            .toOut();
        const urls: string[] = listPaths.map(x => x.sample.url);
        if (urls.length === 0)
            response.isSelectorEmpty = true;
        let uniqueUrls = urls.filter((value, index, self) => self.indexOf(value) === index);
        if (before !== undefined) {
            const beforeIndex = uniqueUrls.indexOf(before.url);
            if (beforeIndex !== -1) {
                uniqueUrls = uniqueUrls.splice(0, beforeIndex);
            } else {
                response.isSampleUrlNotFound = true;
            }
        }
        response.sampleUrl = listPaths.map(x=>x.sample);
        return response;
    };

    getPathsByUrl = async (url: string, selector: string): Promise<CssPath[]> => {
        let res;
        try {
            res = (await this.download(url)).body;
        }
        catch (e) {
            throw e;
        }
        const cheerioObject: CheerioStatic = this.parse(res);
        const scannerInstance: ScannerInstance = ScannerInstance.fromCheerio(cheerioObject, selector);
        return scannerInstance.resolve(url).filter(FILTERS.INVALID_HREF, {}).getPaths();
    };


    parse = (html: string): CheerioStatic => {
        return cheerio.load(html);
    };

    download = async (url: string): Promise<any> => {
        /*const request = (await needle('get', url));
        const html = request.body;*/
        const jsdom = require('jsdom');
        const jar = jsdom.createCookieJar();
        const domHtml = await (new Promise((resolve, reject) => {
            jsdom.env({
                url,
                cookieJar: jar,
                features: {
                    FetchExternalResources: ['script'],
                    ProcessExternalResources: ['script'],
                    SkipExternalResources: false
                },
                // proxy: 'https://api.enthought.com/',
                done: function (err, window) {
                    if (err) {
                        reject(err);
                    } else {
                        const output = jsdom.serializeDocument(window.document);
                        //  window.close();
                        resolve(output);
                    }
                },
            });
        }));
        return {body: domHtml};
    };
}

export default ScannerService;