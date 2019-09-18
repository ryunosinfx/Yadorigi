import { Fetcher } from '../util/Fetcher';
import { ENDPOINT, BLANK_PAGE } from './YadorigiSettings';
export class YadorigiSignalingConnector {
	constructor(endPoint = ENDPOINT) {
		this.endPoint = endPoint;
		this.Fetcher = new Fetcher();
	}
	async putSpd(groupName, fileName, hash, payload) {
		const data = { groupName, fileName, hash, payload };
		this.Fetcher.postJsonCors(this.endPoint, data);
	}
	async getSpd(groupName, fileName) {
		const data = { command: 'get', group: groupName, fileName };
		return await this.Fetcher.getTextCors(this.endPoint, data);
	}
	async getLastOne(groupName) {
		const data = { command: 'last', group: groupName };
		return await this.Fetcher.getTextCors(this.endPoint, data);
	}
	async getNextOne(groupName, fileName) {
		const data = { command: 'last', group: groupName, fileName };
		return await this.Fetcher.getTextCors(this.endPoint, data);
	}
	async getSpdByName(fileName) {}
}
