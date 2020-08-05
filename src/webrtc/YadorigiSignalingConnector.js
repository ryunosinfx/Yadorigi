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
	async putSdp(groupNameHash, fileName, hash, payload) {
		console.log('--putSdp--0----------YadorigiSignalingConnector--------------------------------------groupNameHash:' + groupNameHash);
		const data = { group: groupNameHash, fileName, hash, data: payload };
		console.log('--putSdp--1----------YadorigiSignalingConnector--------------------------------------fileName:' + fileName);
		await this.Fetcher.postAsSubmit(this.endPoint, data);
		console.log('--putSdp--2----------YadorigiSignalingConnector--------------------------------------hash:' + hash);
		console.warn('--putSdp--3----------YadorigiSignalingConnector--------------------------------------payload:' + payload);
	}
	async getSdp(groupNameHash, fileName) {
		console.log('--getSdp--0----------YadorigiSignalingConnector--------------------------------------groupNameHash:' + groupNameHash);
		const data = { command: 'get', group: groupNameHash, fileName };
		console.log('--getSdp--1----------YadorigiSignalingConnector--------------------------------------fileName:' + fileName);
		const result = await this.Fetcher.getTextCors(this.endPoint, data);
		console.warn('--getSdp--2----------YadorigiSignalingConnector--------------------------------------result:' + result);
		return result;
	}
	async getLastOne(groupNameHash) {
		console.log('--getLastOne--0----------YadorigiSignalingConnector--------------------------------------groupNameHash:' + groupNameHash);
		const data = { command: 'last', group: groupNameHash };
		console.log('--getLastOne--1----------YadorigiSignalingConnector--------------------------------------groupNameHash:' + groupNameHash);
		const result = await this.Fetcher.getTextCors(this.endPoint, data);
		console.warn('--getLastOne--2----------YadorigiSignalingConnector--------------------------------------result:' + result);
		return result;
	}
	async getNextOne(groupNameHash, fileName) {
		console.log('--getNextOne--0----------YadorigiSignalingConnector--------------------------------------groupNameHash:' + groupNameHash);
		const data = { command: 'last', group: groupNameHash, fileName };
		console.log('--getNextOne--1----------YadorigiSignalingConnector--------------------------------------fileName:' + fileName);
		const result = await this.Fetcher.getTextCors(this.endPoint, data);
		console.warn('--getNextOne--2----------YadorigiSignalingConnector--------------------------------------result:' + result);
		return result;
	}
	async getSdpByName(fileName) {}
}
