import { DummyResponse } from './DummyResponse';
import { DummyContentService } from '../mocs/DummyContentService';
import { DummyGsEvent } from './DummyGsEvent';
import gs from '../../src/gs/YadorigiWebRTCSignalingServer';
export class DummyFetcher {
	constructor(headerKeys) {
		this.headerKeys = headerKeys;
	}
	async psotAsSubmit(path, data, isCors) {
		let submitData = data;
		if (data && typeof data === 'object') {
			submitData = Object.keys(data)
				.map(key => key + '=' + encodeURIComponent(data[key]))
				.join('&');
		}
		return await this.exec(path, submitData, true, 'application/x-www-form-urlencoded', isCors);
	}
	async postJsonCors(path, data) {
		return this.post(path, data, 'application/json', true);
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
		if (isPost) {
			requestData.body = typeof data === 'object' ? JSON.stringify(data) : data;
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
		const result = await promise;

		const res = new DummyResponse(result);
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
	async getTextCors(path, data = {}, isPost = false, contentType = 'application/json') {
		return await this.getText(path, path, isPost);
	}
	async getText(path, data = {}, isPost = false, contentType = 'application/json', isCORS = false) {
		const res = await this.exec(path, data, isPost, contentType, isCORS);
		return await res.text();
	}
	createEvent() {}
}
