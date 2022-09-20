import { Fetcher } from '../util/Fetcher.js';
import { ENDPOINT, BLANK_PAGE } from './YadorigiSettings.js';
export class YadorigiSignalingConnector {
	constructor(endPoint = ENDPOINT, logger = console) {
		this.endPoint = endPoint;
		this.Fetcher = new Fetcher(null, logger);
		this.l = logger;
	}
	/**
	 *
	 * @param {*} groupNameHash this is hash of groupName
	 * @param {*} fileName build by hashs
	 * @param {*} hash payload hash
	 * @param {*} payload
	 */
	async putSdp(groupNameHash, fileName, hash, payload) {
		this.l.log(`--putSdp--1----------YadorigiSignalingConnector-PUT-SPD-START------------------------groupNameHash:${groupNameHash}/fileName:${fileName}`);
		await this.Fetcher.postAsSubmit(this.endPoint, { group: groupNameHash, fileName, hash, data: payload });
		this.l.warn(`--putSdp--2----------YadorigiSignalingConnector-PUT-SPD-DONE------------------------hash:${hash}/payload:${payload}`);
	}
	async getSdp(groupNameHash, fileName) {
		this.l.log(`--getSdp--1----------YadorigiSignalingConnector--GET-SDP-START-----------------------groupNameHash:${groupNameHash}/fileName:${fileName}`);
		const result = await this.Fetcher.getTextCors(this.endPoint, { command: 'get', group: groupNameHash, fileName });
		this.l.warn(`--getSdp--2----------YadorigiSignalingConnector--GET-SDP-DONE-----------------------result:${result}`);
		return result;
	}
	async getLastOne(groupNameHash) {
		this.l.log(`--getLastOne--1----------YadorigiSignalingConnector--GET-LAST-ONE-START--------------groupNameHash:${groupNameHash}/this.endPoint:${this.endPoint}`);
		const result = await this.Fetcher.getTextCors(this.endPoint, { command: 'last', group: groupNameHash });
		this.l.warn(`--getLastOne--2----------YadorigiSignalingConnector--GET-LAST-ONE-DONE--------------result:${result}`);
		return result;
	}
	async getNextOne(groupNameHash, fileName) {
		this.l.log(`--getNextOne--0----------YadorigiSignalingConnector--GET-NEXT-ONE-START--------------groupNameHash:${groupNameHash}/fileName:${fileName}`);
		const result = await this.Fetcher.getTextCors(this.endPoint, { command: 'last', group: groupNameHash, fileName });
		this.l.warn(`--getNextOne--2----------YadorigiSignalingConnector--GET-NEXT-ONE-DONE--------------result:${result}`);
		return result;
	}
	async getSdpByName(fileName) {
		this.l.log(`${fileName} / ${BLANK_PAGE}`);
	}
}
