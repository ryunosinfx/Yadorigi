import { Fetcher } from '../util/Fetcher';
import { ENDPOINT, BLANK_PAGE } from './YadorigiSettings';
export class YadorigiSignalingConnector {
	constructor(endPoint = ENDPOINT) {
		this.endPoint = endPoint;
		this.Fetcher = new Fetcher();
	}
	/**
	 *
	 * @param {*} groupNameHash this is hash of groupName
	 * @param {*} fileName build by hashs
	 * @param {*} hash payload hash
	 * @param {*} payload
	 */
	async putSpd(groupNameHash, fileName, hash, payload) {
		console.log('--putSpd--0----------YadorigiSignalingConnector--------------------------------------groupNameHash:' + groupNameHash);
		const data = { groupName: groupNameHash, fileName, hash, payload };
		console.log('--putSpd--1----------YadorigiSignalingConnector--------------------------------------fileName:' + fileName);
		this.Fetcher.postJsonCors(this.endPoint, data);
		console.log('--putSpd--2----------YadorigiSignalingConnector--------------------------------------hash:' + hash);
	}
	async getSpd(groupNameHash, fileName) {
		console.log('--getSpd--0----------YadorigiSignalingConnector--------------------------------------groupNameHash:' + groupNameHash);
		const data = { command: 'get', group: groupNameHash, fileName };
		console.log('--getSpd--1----------YadorigiSignalingConnector--------------------------------------fileName:' + fileName);
		const result = await this.Fetcher.getTextCors(this.endPoint, data);
		console.log('--getSpd--2----------YadorigiSignalingConnector--------------------------------------result:' + result);
		return result;
	}
	async getLastOne(groupNameHash) {
		console.log('--getLastOne--0----------YadorigiSignalingConnector--------------------------------------groupNameHash:' + groupNameHash);
		const data = { command: 'last', group: groupNameHash };
		console.log('--getLastOne--1----------YadorigiSignalingConnector--------------------------------------groupNameHash:' + groupNameHash);
		const result = await this.Fetcher.getTextCors(this.endPoint, data);
		console.log('--getLastOne--2----------YadorigiSignalingConnector--------------------------------------result:' + result);
		return result;
	}
	async getNextOne(groupNameHash, fileName) {
		console.log('--getNextOne--0----------YadorigiSignalingConnector--------------------------------------groupNameHash:' + groupNameHash);
		const data = { command: 'last', group: groupNameHash, fileName };
		console.log('--getNextOne--1----------YadorigiSignalingConnector--------------------------------------fileName:' + fileName);
		const result = await this.Fetcher.getTextCors(this.endPoint, data);
		console.log('--getNextOne--2----------YadorigiSignalingConnector--------------------------------------result:' + result);
		return result;
	}
	async getSpdByName(fileName) {}
}
