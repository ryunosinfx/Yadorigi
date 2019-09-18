import { WebRTCConnecter } from './WebRTCConnecter';
import { YadorigiFileProsessor } from './YadorigiFileProsessor';
import { YadorigiSignalingConnector } from './YadorigiSignalingConnector';
import { isAbsolute } from 'path';
import { isArray } from 'util';
export class YadorigiSignalingAdapter {
	constructor(passphraseText, userId, deviceName, groupName) {
		this.passphraseText = passphraseText;
		this.userId = userId;
		this.deviceName = deviceName;
		this.groupName = groupName;
		this.WebRTCConnecter = new WebRTCConnecter();
		this.YadorigiFileProsessor = new YadorigiFileProsessor();
		this.YadorigiSignalingConnector = new YadorigiSignalingConnector();
	}
	async init() {
		this.offer = await this.WebRTCConnecter.init();
	}
	setOnOpne(callback) {
		this.WebRTCConnecter.setOnOpne(callback);
	}
	setOnClose(callback) {
		this.WebRTCConnecter.setOnClose(callback);
	}
	setOnMessage(callback) {
		this.WebRTCConnecter.setOnMessage(callback);
	}
	setOnError(callback) {
		this.WebRTCConnecter.setOnError(callback);
	}
	send(msg) {
		this.WebRTCConnecter.send(msg);
	}
	close() {
		this.WebRTCConnecter.close();
	}
	buildImage(imageList, spd) {
		return [];
	}
	async startConnect(targetDeviceName) {
		//getFileList
		const lastOne = await this.getLastOne();
		if (!lastOne || !lastOne.imageList) {
			return null;
		}
		const imageList = lastOne.imageList;

		const targetFileName = this.YadorigiFileProsessor.createFileNameOffer(this.groupName, this.userId, targetDeviceName);
		const offerData = await this.getSdpFile(targetFileName);
		if (offerData && offerData.spd) {
			const answer = await this.answer(offerData.spd);
			const imageList = offerData.imageList;
			const answerFile = await this.YadorigiFileProsessor.build(this.passphraseText, imageList, this.deviceName, answer, this.userId, this.groupName, 30);
		}
	}
	getOfferFileNameLast(imageList) {
		const result = this.YadorigiFileProsessor.getParsedOfferFileNameList(imageList);
		return result && Array, isArray(result) && result.length > 0 ? result.pop() : null;
	}
	async getLastOne() {
		const dataBase64url = await this.YadorigiSignalingConnector.getLastOne(this.groupName);
		return await this.firlParse(dataBase64url);
	}
	async getSdpFile(fileName) {
		const dataBase64url = fileName ? await this.YadorigiSignalingConnector.getSpd(this.groupName, fileName) : await this.YadorigiSignalingConnector.getLastOne(this.groupName);
		return await this.firlParse(dataBase64url);
	}
	async firlParse(dataBase64url) {
		if (!dataBase64url) {
			return null;
		}
		const parsed = await this.YadorigiFileProsessor.parse(this.passphraseText, dataBase64url);
		if (parsed.sdp) {
			return parsed;
		}
	}

	loadImage() {}
	//////////////////////////////
	getSdp() {
		return this.WebRTCConnecter.getSdp();
	}
	async answer(sdp) {
		return await this.WebRTCConnecter.answer(sdp);
	}
	async connect(sdp) {
		return await this.WebRTCConnecter.connect(sdp);
	}
}
