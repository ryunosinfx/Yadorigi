import { Fetcher } from '../util/Fetcher';
import { ENDPOINT, BLANK_PAGE } from './YadorigiSettings';
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
		this.l.log(`--putSdp--0----------YadorigiSignalingConnector--------------------------------------groupNameHash:${groupNameHash}`);
		const data = { group: groupNameHash, fileName, hash, data: payload };
		this.l.log(`--putSdp--1----------YadorigiSignalingConnector--------------------------------------fileName:${fileName}`);
		await this.Fetcher.postAsSubmit(this.endPoint, data);
		this.l.log(`--putSdp--2----------YadorigiSignalingConnector--------------------------------------hash:${hash}`);
		this.l.warn(`--putSdp--3----------YadorigiSignalingConnector--------------------------------------payload:${payload}`);
	}
	async getSdp(groupNameHash, fileName) {
		this.l.log(`--getSdp--0----------YadorigiSignalingConnector--------------------------------------groupNameHash:${groupNameHash}`);
		const data = { command: 'get', group: groupNameHash, fileName };
		this.l.log(`--getSdp--1----------YadorigiSignalingConnector--------------------------------------fileName:${fileName}`);
		const result = await this.Fetcher.getTextCors(this.endPoint, data);
		this.l.warn(`--getSdp--2----------YadorigiSignalingConnector--------------------------------------result:${result}`);
		return result;
	}
	async getLastOne(groupNameHash) {
		this.l.log(`--getLastOne--0----------YadorigiSignalingConnector--------------------------------------groupNameHash:${groupNameHash}`);
		const data = { command: 'last', group: groupNameHash };
		this.l.log(`--getLastOne--1----------YadorigiSignalingConnector--------------------------------------this.endPoint:${this.endPoint}`);
		const result = await this.Fetcher.getTextCors(this.endPoint, data);
		this.l.warn(`--getLastOne--2----------YadorigiSignalingConnector--------------------------------------result:${result}`);
		return result;
	}
	async getNextOne(groupNameHash, fileName) {
		this.l.log(`--getNextOne--0----------YadorigiSignalingConnector--------------------------------------groupNameHash:${groupNameHash}`);
		const data = { command: 'last', group: groupNameHash, fileName };
		this.l.log(`--getNextOne--1----------YadorigiSignalingConnector--------------------------------------fileName:${fileName}`);
		const result = await this.Fetcher.getTextCors(this.endPoint, data);
		this.l.warn(`--getNextOne--2----------YadorigiSignalingConnector--------------------------------------result:${result}`);
		return result;
	}
	async getSdpByName(fileName) {
		this.l.log(`${fileName} / ${BLANK_PAGE}`);
	}
}
