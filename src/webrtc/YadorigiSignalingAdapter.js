import { WebRTCConnecter } from './WebRTCConnecter';
import { Base64Util } from '../util/Base64Util';
import { Hasher } from '../util/Hasher';
import { ProcessUtil } from '../util/ProcessUtil';
import { YadorigiFileProsessor } from './YadorigiFileProsessor';
import { YadorigiSignalingConnector } from './YadorigiSignalingConnector';
import { YadorigiSdpFileRecord } from './YadorigiSdpFileRecord';
const waitms = 20;
export class YadorigiSignalingAdapter {
	constructor(passphraseText, userId, deviceName, groupName, signalingServerEndpoint) {
		this.passphraseText = passphraseText;
		this.userId = userId;
		this.deviceName = deviceName;
		this.groupName = groupName;
		this.WebRTCConnecter = new WebRTCConnecter();
		this.YadorigiFileProsessor = new YadorigiFileProsessor();
		this.YadorigiSignalingConnector = new YadorigiSignalingConnector(signalingServerEndpoint);
	}
	async init(onOpenCallBack, onCloseCallBack, onMessageCallBack, onErrorCallBack) {
		console.log('--init--0----------YadorigiSignalingAdapter--------------------------------------');
		this.offer = await this.WebRTCConnecter.init();
		console.log('--init--1----------YadorigiSignalingAdapter--------------------------------------this.offer:' + this.offer);
		this.userIdHash = await Hasher.sha512(this.userId);
		console.log('--init--2----------YadorigiSignalingAdapter--------------------------------------');
		this.deviceNameHash = await Hasher.sha512(this.deviceName);
		console.log('--init--3----------YadorigiSignalingAdapter--------------------------------------');
		this.groupNameHash = await Hasher.sha512(this.groupName);
		console.log('--init--4----------YadorigiSignalingAdapter--------------------------------------');
		if (onOpenCallBack) {
			this.setOnOpen(onOpenCallBack);
		}
		if (onCloseCallBack) {
			this.setOnClose(onCloseCallBack);
		}
		if (onMessageCallBack) {
			this.setOnMessage(onMessageCallBack);
		}
		if (onErrorCallBack) {
			this.setOnError(onErrorCallBack);
		}
	}
	setOnOpen(callback) {
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
	buildImage(imageList, sdp) {
		return [];
	}
	async startConnect(targetDeviceName) {
		console.log('--startConnect--1----------YadorigiSignalingAdapter--------------------------------------targetDeviceName:' + targetDeviceName);
		const targetDeviceNameHash = await Hasher.sha512(targetDeviceName);
		console.log('--startConnect--2----------YadorigiSignalingAdapter--------------------------------------targetDeviceNameHash:' + targetDeviceNameHash);
		let count = 0;
		let isPutOffer = true;
		let isOfferPuted = false;
		while (count < 10) {
			console.log('--startConnect--3----------YadorigiSignalingAdapter--------------------------------------count:' + count);
			const result = await this.oneLoop(targetDeviceNameHash, isPutOffer, isOfferPuted);
			console.log('--startConnect--4----------YadorigiSignalingAdapter--------------------------------------result:' + result);
			isOfferPuted = result.isOfferPuted;
			console.log('--startConnect--5----------YadorigiSignalingAdapter--------------------------------------isOfferPuted:' + isOfferPuted);
			// alert(count);
			count++;
		}
		alert('end!');
	}
	async oneLoop(targetDeviceNameHash, isPutOffer = false, isOfferPuted = false) {
		console.log('--oneLoop--0----------YadorigiSignalingAdapter--------------------------------------targetDeviceNameHash:' + targetDeviceNameHash);
		const lastOne = await this.getLastOneFSS();
		console.log('--oneLoop--1----------YadorigiSignalingAdapter--------------------------------------lastOne:' + lastOne);
		if (!lastOne || !lastOne.imageList) {
			console.log('--oneLoop--11----------YadorigiSignalingAdapter--------------------------------------lastOne:' + lastOne);
			///一番乗り
			const offerData = await this.createOffer();
			await this.putFileFSS(offerData.fileName, offerData.hash, offerData.payload);
			await ProcessUtil.waitRandom();
			return { isOfferPuted: true };
		}
		console.log('--oneLoop--2----------YadorigiSignalingAdapter--------------------------------------isPutOffer:' + isPutOffer + ' /targetDeviceNameHash:' + targetDeviceNameHash);
		const imageList = lastOne.imageList;
		const offerFileName = this.getOfferFileNameLast(imageList, targetDeviceNameHash);
		if (!offerFileName && isPutOffer) {
			console.log(
				'--oneLoop--21----------YadorigiSignalingAdapter----------------------------------NO OFFER FILE----offerFileName:' + offerFileName + ' /targetDeviceNameHash:' + targetDeviceNameHash
			);
			const offerData = await this.createOffer(imageList);
			await this.putFileFSS(offerData.fileName, offerData.hash, offerData.payload);
			await ProcessUtil.waitRandom();
			return { isOfferPuted: true };
		} else if (offerFileName) {
			console.log('--oneLoop--22----------YadorigiSignalingAdapter--------------------------------------offerFileName:' + offerFileName + ' /targetDeviceNameHash:' + targetDeviceNameHash);
			const offerFile = await this.getSdpFileFSS(offerFileName);
			console.log('--oneLoop--221----------YadorigiSignalingAdapter--------------------------------------offerFile:' + offerFile + ' /targetDeviceNameHash:' + targetDeviceNameHash);
			console.log(offerFile);
			if (offerFile && offerFile.sdp) {
				console.log('--oneLoop--2211----------YadorigiSignalingAdapter--------------------------------------offerFile.sdp:' + offerFile.sdp + ' /targetDeviceNameHash:' + targetDeviceNameHash);
				// Anserを置く有る場合
				const answerFile = await this.createAnswer(offerFile);
				console.log('--oneLoop--2212----------YadorigiSignalingAdapter--------------------------------------answerFile:' + answerFile + ' /targetDeviceNameHash:' + targetDeviceNameHash);
				await this.putFileFSS(answerFile.fileName, answerFile.hash, answerFile.payload);
				console.log('--oneLoop--2213----------YadorigiSignalingAdapter--------------------------------------answerFile:' + answerFile + ' /targetDeviceNameHash:' + targetDeviceNameHash);
				await ProcessUtil.waitRandom();
				return { isOfferPuted: false, isAnswerPutted: true };
			}
			console.log('--oneLoop--222----------YadorigiSignalingAdapter--------------------------------------offerFile:' + offerFile + ' /targetDeviceNameHash:' + targetDeviceNameHash);
			return { isOfferPuted: false };
		} else if (isOfferPuted) {
			console.log('--oneLoop--23----------YadorigiSignalingAdapter--------------------------------------lastOne:' + lastOne + ' /targetDeviceNameHash:' + targetDeviceNameHash);
			const answerFileName = this.getAnswerFileNameLast(imageList, targetDeviceNameHash);
			const answerFile = await this.getSdpFileFSS(answerFileName);
			if (answerFile && answerFile.sdp) {
				await this.connect(answerFile.sdp);
				return { isOfferPuted: false, isAnswerPutted: true };
			}
		}
		console.log('--oneLoop--4----------YadorigiSignalingAdapter--------------------------------------lastOne:' + lastOne + ' /targetDeviceNameHash:' + targetDeviceNameHash);
		return { isPutOffer: true };
	}
	//////////////////////////////////////////////////////////////////////////////////////////
	getOfferFileNameLast(imageList, targetDeviceNameHash) {
		console.log('--getOfferFileNameLast--0----------YadorigiSignalingAdapter--------------------------------------targetDeviceNameHash:' + targetDeviceNameHash);
		const result = this.YadorigiFileProsessor.getParsedOfferFileNameList(imageList);
		// this.userId = userId;
		// this.deviceName = deviceName;
		// this.groupName = groupName;
		console.log('--getOfferFileNameLast--1s----------YadorigiSignalingAdapter--------------------------------------result:' + result);
		console.log(result);
		if (result && Array.isArray(result) && result.length > 0) {
			const offerRegex = YadorigiSdpFileRecord.createOfferFileNameRegex(this.groupNameHash, this.userIdHash, targetDeviceNameHash);
			console.log('--getOfferFileNameLast--2----------YadorigiSignalingAdapter--------------------------------------offerRegex:' + offerRegex);
			for (let row of result.reverse()) {
				console.log('--getOfferFileNameLast--3----------YadorigiSignalingAdapter--------------------------------------row.fileName:' + row.fileName);
				console.log(row);
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
		console.log('--YadorigiSignalingAdapter--getLastOneFSS dataBase64url:' + dataBase64url + '/' + typeof dataBase64url + '/this.groupNameHash:' + this.groupNameHash);
		return await this.parseFile(dataBase64url);
	}
	async getSdpFileFSS(fileName) {
		console.log('--YadorigiSignalingAdapter--getSdpFileFSS fileName:' + fileName + '/');
		const dataBase64url = await this.YadorigiSignalingConnector.getSdp(this.groupNameHash, fileName);
		console.log('--YadorigiSignalingAdapter--getSdpFileFSS dataBase64url:' + dataBase64url + '/' + typeof dataBase64url);
		return await this.parseFile(dataBase64url);
	}
	async putFileFSS(fileName, hash, payload) {
		console.log('--YadorigiSignalingAdapter--putFileFSS fileName:' + fileName);
		console.log('--YadorigiSignalingAdapter--putFileFSS hash:' + hash);
		console.log('--YadorigiSignalingAdapter--putFileFSS payload:' + payload);
		await this.YadorigiSignalingConnector.putSdp(this.groupNameHash, fileName, hash, payload);
	}
	/////////////////////////////////////////////////////////////////////////////
	async createOffer(imageList = []) {
		const offerSdp = this.getSdp();
		const offerFile = await this.YadorigiFileProsessor.buildOffer(this.passphraseText, imageList, this.deviceName, offerSdp, this.userId, this.groupName, 30);
		return offerFile;
	}
	async createAnswer(offerData) {
		console.log('--createAnswer--0----------YadorigiSignalingAdapter--------------------------------------offerData:' + offerData.sdp);
		const answerSdp = await this.answer(typeof offerData.sdp === 'object' ? offerData.sdp.sdp : offerData.sdp);
		console.log('--createAnswer--1----------YadorigiSignalingAdapter--------------------------------------offerData:' + offerData);
		const imageList = offerData.imageList;
		console.log('--createAnswer--2----------YadorigiSignalingAdapter--------------------------------------offerData:' + offerData);
		const answerFile = await this.YadorigiFileProsessor.buildAnswer(this.passphraseText, imageList, this.deviceName, answerSdp, this.userId, this.groupName, offerData.sdp, 30);
		console.log('--createAnswer--3----------YadorigiSignalingAdapter--------------------------------------offerData:' + offerData);
		return answerFile;
	}
	async parseFile(dataBase64url) {
		if (!dataBase64url || !Base64Util.isBase64Url(dataBase64url)) {
			return null;
		}
		console.log('parseFile dataBase64url:' + dataBase64url);
		const parsed = await this.YadorigiFileProsessor.parse(this.passphraseText, dataBase64url);
		if (parsed && parsed.sdp) {
			console.log('parseFile parsed.sdp:' + parsed.sdp);
			return parsed;
		}
		return null;
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
