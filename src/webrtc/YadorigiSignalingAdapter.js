import { WebRTCConnecter } from './WebRTCConnecter';
import { Hasher } from '../util/Hasher';
import { ProcessUtil } from '../util/ProcessUtil';
import { YadorigiFileProsessor } from './YadorigiFileProsessor';
import { YadorigiSignalingConnector } from './YadorigiSignalingConnector';
import { YadorigiSdpFileRecord } from './YadorigiSdpFileRecord';
const waitms = 20;
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
		console.log('--init--0----------YadorigiSignalingAdapter--------------------------------------');
		this.offer = await this.WebRTCConnecter.init();
		console.log('--init--1----------YadorigiSignalingAdapter--------------------------------------this.offer:' + this.offer);
		this.userIdHash = await Hasher.sha512(this.userId);
		console.log('--init--2----------YadorigiSignalingAdapter--------------------------------------');
		this.deviceNameHash = await Hasher.sha512(this.deviceName);
		console.log('--init--3----------YadorigiSignalingAdapter--------------------------------------');
		this.groupNameHash = await Hasher.sha512(this.groupName);
		console.log('--init--4----------YadorigiSignalingAdapter--------------------------------------');
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
		console.log('--startConnect--1----------YadorigiSignalingAdapter--------------------------------------targetDeviceName:' + targetDeviceName);
		const targetDeviceNameHash = await Hasher.sha512(targetDeviceName);
		console.log('--startConnect--2----------YadorigiSignalingAdapter--------------------------------------targetDeviceNameHash:' + targetDeviceNameHash);
		let count = 0;
		let isPutOffer = true;
		let isOfferPuted = false;
		while (count < 100) {
			console.log('--startConnect--3----------YadorigiSignalingAdapter--------------------------------------count:' + count);
			const result = await this.oneLoop(targetDeviceNameHash, isPutOffer, isOfferPuted);
			console.log('--startConnect--4----------YadorigiSignalingAdapter--------------------------------------result:' + result);

			isOfferPuted = result.isOfferPuted;
			console.log('--startConnect--5----------YadorigiSignalingAdapter--------------------------------------isOfferPuted:' + isOfferPuted);
		}
	}
	async oneLoop(targetDeviceNameHash, isPutOffer = false, isOfferPuted = false) {
		const lastOne = await this.getLastOneFSS();
		if (!lastOne || !lastOne.imageList) {
			///一番乗り
			const offerData = await this.createOffer();
			await this.putFileFSS(offerData.fileName, offerData.hash, offerData.payload);
			await ProcessUtil.wait(waitms);
			return { isOfferPuted: true };
		}
		const imageList = lastOne.imageList;
		const offerFileName = this.getOfferFileNameLast(imageList, targetDeviceNameHash);
		if (!offerFileName && isPutOffer) {
			const offerData = await this.createOffer();
			await this.putFileFSS(offerData.fileName, offerData.hash, offerData.payload);
			await ProcessUtil.wait(waitms);
			return { isOfferPuted: true };
		} else if (offerFileName) {
			const offerFile = this.getSdpFileFSS(offerFileName);
			if (offerFile && offerFile.spd) {
				// Anserを置く有る場合
				const answerFile = await this.createAnswer(offerFile);
				await this.putFileFSS(answerFile.fileName, answerFile.hash, answerFile.payload);
				await ProcessUtil.wait(waitms);
				return { isOfferPuted: false, isAnswerPutted: true };
			}
			return { isOfferPuted: false };
		} else if (isOfferPuted) {
			const answerFileName = this.getAnswerFileNameLast(imageList, targetDeviceNameHash);
			const answerFile = await this.getSdpFileFSS(answerFileName);
			if (answerFile && answerFile.spd) {
				await this.connect(answerFile.spd);
				return { isOfferPuted: false, isAnswerPutted: true };
			}
		}
		return { isPutOffer: true };
	}
	//////////////////////////////////////////////////////////////////////////////////////////
	getOfferFileNameLast(imageList, targetDeviceNameHash) {
		const result = this.YadorigiFileProsessor.getParsedOfferFileNameList(imageList);
		// this.userId = userId;
		// this.deviceName = deviceName;
		// this.groupName = groupName;
		if (result && Array.isArray(result) && result.length > 0) {
			const offerRegex = YadorigiSdpFileRecord.createOfferFileNameRegex(this.groupNameHash, this.userIdHash, targetDeviceNameHash);
			for (let row of result.reverse()) {
				if (offerRegex.test(row.fileName)) {
					return row.fileName;
				}
			}
		} else {
			return null;
		}
	}
	getAnswerFileNameLast(imageList, targetDeviceNameHash) {
		const result = this.YadorigiFileProsessor.getParsedOfferFileNameList(imageList);
		// this.userId = userId;
		// this.deviceName = deviceName;
		// this.groupName = groupName;
		if (result && Array.isArray(result) && result.length > 0) {
			const offerRegex = YadorigiSdpFileRecord.createAnswerFileNameRegex(this.groupNameHash, this.userIdHash, targetDeviceNameHash);
			for (let row of result.reverse()) {
				if (offerRegex.test(row.fileName)) {
					return row;
				}
			}
		} else {
			return null;
		}
	}
	///////////////////////////////////////////////////////////////////////////
	async getLastOneFSS() {
		const dataBase64url = await this.YadorigiSignalingConnector.getLastOne(this.groupNameHash);
		return await this.firlParse(dataBase64url);
	}
	async getSdpFileFSS(fileName) {
		const dataBase64url = await this.YadorigiSignalingConnector.getSpd(this.groupNameHash, fileName);
		return await this.firlParse(dataBase64url);
	}
	async putFileFSS(fileName, hash, payload) {
		await this.YadorigiSignalingConnector.putSpd(this.groupNameHash, fileName, hash, payload);
	}
	/////////////////////////////////////////////////////////////////////////////
	async createOffer() {
		const offerSdp = this.getSdp();
		const imageList = offerData.imageList;
		const offerFile = await this.YadorigiFileProsessor.buildOffer(this.passphraseText, imageList, this.deviceName, offerSdp, this.userId, this.groupName, 30);
		return offerFile;
	}
	async createAnswer(offerData) {
		const answerSdp = await this.answer(offerData.spd);
		const imageList = offerData.imageList;
		const answerFile = await this.YadorigiFileProsessor.buildAnswer(this.passphraseText, imageList, this.deviceName, answerSdp, this.userId, this.groupName, offerData.spd, 30);
		return answerFile;
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
