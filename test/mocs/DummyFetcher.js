import { DummyResponse } from './DummyResponse';
import { DummyContentService } from '../mocs/DummyContentService';
import { DummyGsEvent } from './DummyGsEvent';
import { UrlUtil } from '../../src/util/UrlUtil';
import gs from '../../src/gs/YadorigiWebRTCSignalingServer';
export class DummyFetcher {
	constructor(headerKeys) {
		this.headerKeys = headerKeys;
	}
	async postAsSubmit(path, data, isCors) {
		return await this.exec(path, data, true, 'application/x-www-form-urlencoded', isCors);
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
			requestData.body = data;
		} else if (contentType === 'application/json') {
			const json = isObj ? JSON.stringify(data) : data;
			path += '?q=' + encodeURIComponent(json);
		} else if (isObj) {
			requestData.body = data;
		} else {
			path += '?q=' + encodeURIComponent(data);
		}

		// myHeaders = new Headers({
		// 	'Content-Type': contentType,
		// 	'Content-Length': requestData.body ? requestData.body.length.toString() : '0'
		// });
		// const event = new DummyGsEvent(requestData.body);
		const server = new gs.YadorigiWebRTCSignalingServer();
		const event = DummyContentService.createGsEvent(requestData.body, server);
		if (isPost) {
			server.doPost(event);
		} else {
			server.doGet(event);
		}
		const promise = event.getPromise();
		console.log('DummyFetcher exec promise:' + promise);
		const result = await promise;

		const res = new DummyResponse(result);
		return res;
	}
	async getBlob(path, data = {}, isPost = false, contentType = 'application/json', isCORS = false) {
		const res = await this.exec(path, data, isPost, contentType, isCORS);
		return await res.blob();
	}
	async getJson(path, data = {}, isPost = false, contentType = 'application/json', isCORS = false) {
		console.log('DummyFetcher getJson A path:' + path);
		const res = await this.exec(path, data, isPost, contentType, isCORS);
		const result = await res.json();
		console.log('DummyFetcher getJson B result:' + result);
		return result;
	}
	async getTextCors(path, data = {}, isPost = false, contentType = 'application/x-www-form-urlencoded') {
		console.log('DummyFetcher getTextCors A path:' + path);
		const result = await this.getText(path, data, isPost, contentType);
		console.log('DummyFetcher getTextCors B result:' + result);
		return result;
	}
	async getText(path, data = {}, isPost = false, contentType = 'application/json', isCORS = false) {
		console.log('DummyFetcher getText A path:' + path);
		const res = await this.exec(path, data, isPost, contentType, isCORS);
		const result = await res.text();
		console.log('DummyFetcher getText B result:' + result);
		return result;
	}
	createEvent() {}
}
