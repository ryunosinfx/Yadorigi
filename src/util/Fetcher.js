import {} from '../view/util/IframeController';
export class Fetcher {
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
	async post(path, data, contentType, isCors) {
		return await this.exec(path, data, true, contentType, isCors);
	}
	async exec(path, data = {}, isPost = false, contentType = 'application/json\'', isCORS = false) {
		const requestData = {
			method: isPost ? 'POST' : 'GET',
			mode: isCORS ? 'no-cors' : 'cors',
			cache: 'no-cache',
			credentials: 'same-origin'
		};
		if (isPost) {
			requestData.body = typeof data === 'object' ? JSON.stringify(data) : data;
		}

		myHeaders = new Headers({
			'Content-Type': contentType,
			'Content-Length': requestData.body ? requestData.body.length.toString() : '0'
		});
		const res = await fetch(path, requestData);
		return res;
	}
	async getBlob(path, data = {}, isPost = false, contentType = 'application/json\'', isCORS = false) {
		const res = await this.exec(path, data, isPost, contentType, isCORS);
		return await res.blob();
	}
	async getJson(path, data = {}, isPost = false, contentType = 'application/json\'', isCORS = false) {
		const res = await this.exec(path, data, isPost, contentType, isCORS);
		return await res.json();
	}
	async getText(path, data = {}, isPost = false, contentType = 'application/json\'', isCORS = false) {
		const res = await this.exec(path, data, isPost, contentType, isCORS);
		return await res.text();
	}
}
