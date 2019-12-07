import {} from '../view/util/IframeController';
import { UrlUtil } from './UrlUtil';
export class Fetcher {
	constructor(headerKeys) {
		this.headerKeys = headerKeys;
	}
	async postAsSubmit(path, data, isCors = true) {
		const submitData = this.convertObjToQueryParam(data);
		return await this.exec(path, submitData, true, 'application/x-www-form-urlencoded', isCors);
	}
	async postJsonCors(path, data) {
		return await this.post(path, data, 'application/json', true);
	}

	async post(path, data, contentType, isCors) {
		return await this.exec(path, data, true, contentType, isCors);
	}
	async exec(path, data = {}, isPost = false, contentType = 'application/json', isCORS = false) {
		const requestData = {
			method: isPost ? 'POST' : 'GET',
			mode: isCORS ? 'no-cors' : 'cors',
			cache: 'no-cache',
			credentials: 'same-origin'
		};
		const isObj = typeof data === 'object';
		if (isPost) {
			requestData.body = isObj ? JSON.stringify(data) : data;
		} else if (contentType === 'application/json') {
			const json = isObj ? JSON.stringify(data) : data;
			path += '?q=' + encodeURIComponent(json);
		} else if (isObj) {
			path += '?' + this.convertObjToQueryParam(data);
		} else {
			path += '?q=' + encodeURIComponent(data);
		}

		myHeaders = new Headers({
			'Content-Type': contentType,
			'Content-Length': requestData.body ? requestData.body.length.toString() : '0'
		});
		const res = await fetch(path, requestData);
		return res;
	}
	async getBlob(path, data = {}, isPost = false, contentType = 'application/json', isCORS = false) {
		const res = await this.exec(path, data, isPost, contentType, isCORS);
		return await res.blob();
	}
	async getJson(path, data = {}, isPost = false, contentType = 'application/json', isCORS = false) {
		const res = await this.exec(path, data, isPost, contentType, isCORS);
		return await res.json();
	}
	async getTextCors(path, data = {}, isPost = false, contentType = 'application/x-www-form-urlencoded') {
		return await this.getText(path, data, isPost, contentType, true);
	}
	async getText(path, data = {}, isPost = false, contentType = 'application/json', isCORS = false) {
		const res = await this.exec(path, data, isPost, contentType, isCORS);
		return await res.text();
	}
}
