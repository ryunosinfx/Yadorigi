import {} from '../view/util/IframeController.js';
import { UrlUtil } from './UrlUtil.js';
export class Fetcher {
	constructor(headerKeys, logger = console) {
		this.headerKeys = headerKeys;
		this.l = logger;
	}
	async postAsSubmit(path, data, isCors = true) {
		const submitData = UrlUtil.convertObjToQueryParam(data);
		return await this.exec(path, submitData, true, 'application/x-www-form-urlencoded', isCors);
	}
	async postJsonCors(path, data) {
		return await this.post(path, data, 'application/json', true);
	}
	async postJson(path, data) {
		return await this.post(path, data, 'application/json', null);
	}

	async post(path, data, contentType, isCors) {
		return await this.exec(path, data, true, contentType, isCors);
	}
	async exec(path, data = {}, isPost = false, contentType = 'application/json', isCORS = false) {
		const requestData = {
			method: isPost ? 'POST' : 'GET',
			headers: {
				'Content-Type': contentType,
			},
		};

		if (isCORS !== null) {
			requestData.mode = isCORS ? 'cors' : 'no-cors';
			requestData.credentials = 'omit';
			requestData.cache = 'no-cache';
			requestData.redirect = 'follow';
			requestData.referrer = 'no-referrer';
		} else if (isPost) {
			requestData['Content-Type'] = 'application/x-www-form-urlencoded';
			requestData.mode = 'no-cors';
		}
		const isObj = typeof data === 'object';
		if (isPost) {
			requestData.body = isCORS !== null ? UrlUtil.convertObjToQueryParam(data) : isObj ? JSON.stringify(data) : data;
		} else if (contentType === 'application/json') {
			const json = isObj ? JSON.stringify(data) : data;
			path += `?q=${encodeURIComponent(json)}`;
		} else if (isObj) {
			path += `?${UrlUtil.convertObjToQueryParam(data)}`;
		} else {
			path += `?q=${encodeURIComponent(data)}`;
		}
		this.l.log(path);
		this.l.log(requestData);
		return await fetch(path, requestData);
	}
	async getBlob(path, data = {}, isPost = false, contentType = 'application/json', isCORS = false) {
		const res = await this.exec(path, data, isPost, contentType, isCORS);
		return await res.blob();
	}
	async getJson(path, data = {}, isPost = false, contentType = 'application/json', isCORS = false) {
		const res = await this.exec(path, data, isPost, contentType, isCORS);
		return await res.json();
	}
	async getTextCors(path, data = {}, isPost = false, contentType = 'application/x-www-form-urlencoded; charset=utf-8') {
		return await this.getText(path, data, isPost, contentType, true);
	}
	async getTextGAS(path, data = {}, isPost = false, contentType = 'application/x-www-form-urlencoded', isCORS = null) {
		console.log('----getTextGAS--A------------');
		const r = await this.exec(path, data, isPost, contentType, isCORS);
		console.log('----getTextGAS--B------------');
		const res = await r;
		console.log('----getTextGAS--C------------');
		console.log(res);
		console.log('----getTextGAS--D------------');
		console.log(res.headers);
		console.log('----getTextGAS--E------------');
		return await res.text();
	}
	async getText(path, data = {}, isPost = false, contentType = 'application/json', isCORS = false) {
		const res = await this.exec(path, data, isPost, contentType, isCORS);
		return await res.text();
	}
}
