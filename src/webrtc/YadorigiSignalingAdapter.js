import { WebRTCConnecter } from './WebRTCConnecter';
import { Base64Util } from '../util/Base64Util';
import { Hasher } from '../util/Hasher';
import { ProcessUtil } from '../util/ProcessUtil';
import { YadorigiFileProsessor } from './YadorigiFileProsessor';
import { YadorigiSignalingConnector } from './YadorigiSignalingConnector';
import { YadorigiSdpFileRecord } from './YadorigiSdpFileRecord';
// const waitms = 20;
export class YadorigiSignalingAdapter {
	constructor(passphraseText, userId, deviceName, groupName, signalingServerEndpoint, logger = console) {
		this.passphraseText = passphraseText;
		this.userId = userId;
		this.deviceName = deviceName;
		this.groupName = groupName;
		this.WebRTCConnecter = new WebRTCConnecter(logger);
		this.YadorigiFileProsessor = new YadorigiFileProsessor(null, logger);
		this.YadorigiSignalingConnector = new YadorigiSignalingConnector(signalingServerEndpoint, logger);
		this.l = logger;
	}
	async init(onOpenCallBack, onCloseCallBack, onMessageCallBack, onErrorCallBack) {
		this.l.log('--init--0----------YadorigiSignalingAdapter--------------------------------------');
		this.offer = await this.WebRTCConnecter.init();
		this.l.log(`--init--1----------YadorigiSignalingAdapter--------------------------------------this.offer:${this.offer}`);
		this.userIdHash = await Hasher.sha512(this.userId);
		this.l.log('--init--2----------YadorigiSignalingAdapter--------------------------------------');
		this.deviceNameHash = await Hasher.sha512(this.deviceName);
		this.l.log('--init--3----------YadorigiSignalingAdapter--------------------------------------');
		this.groupNameHash = await Hasher.sha512(this.groupName);
		this.l.log('--init--4----------YadorigiSignalingAdapter--------------------------------------');
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
	// buildImage(imageList, sdp) {
	// 	return [];
	// }
	async startConnect(targetDeviceName) {
		this.l.log(`--startConnect--1----------YadorigiSignalingAdapter--------------------------------------targetDeviceName:${targetDeviceName}`);
		const targetDeviceNameHash = await Hasher.sha512(targetDeviceName);
		this.l.log(`--startConnect--2----------YadorigiSignalingAdapter--------------------------------------targetDeviceNameHash:${targetDeviceNameHash}`);
		let count = 0;
		const isPutOffer = true;
		let isOfferPuted = false;
		let isAnswerPutted = false;
		const cache = {};
		while (count < 10) {
			this.l.log(`--startConnect--3----------YadorigiSignalingAdapter--------------------------------------count:${count}`);
			const result = await this.oneLoop(cache, targetDeviceNameHash, isPutOffer, isOfferPuted, isAnswerPutted);
			this.l.log(`--startConnect--4----------YadorigiSignalingAdapter--------------------------------------result:${result}`);
			isOfferPuted = result.isOfferPuted;
			isAnswerPutted = result.isAnswerPutted;
			this.l.log(`--startConnect--5----------YadorigiSignalingAdapter--------------------------------------isOfferPuted:${isOfferPuted}`);
			// alert(count);
			count++;
		}
		alert('end!');
	}
	async oneLoop(cache, targetDeviceNameHash, isPutOffer = false, isOfferPuted = false, isAnswerPutted = false) {
		this.l.log(`##oneLoop--0----------YadorigiSignalingAdapter--------------------------------------targetDeviceNameHash:${targetDeviceNameHash}`);
		const lastOne = await this.getLastOneFSS();
		this.l.log(`##oneLoop--1----------YadorigiSignalingAdapter--GET-LAST-ONE-----isPutOffer:${isPutOffer}/isOfferPuted:${isOfferPuted}-----------------------------lastOne:${lastOne}`);
		if (!lastOne || !lastOne.imageList) {
			this.l.log(`##oneLoop--11----------YadorigiSignalingAdapter--NO-LAST-ONE----------------------------------lastOne:${lastOne}`);
			///一番乗り
			const { offerData, offerSdp } = await this.createOffer();
			cache.offerSdp = offerSdp;
			cache.offerData = offerData;
			await this.putFileFSS(offerData.fileName, offerData.hash, offerData.payload);
			await ProcessUtil.waitRandom();
			this.l.log(`##oneLoop--111----------YadorigiSignalingAdapter---PUT OFFER!----------------------------------lastOne:${lastOne}`);
			return { isOfferPuted: true };
		}
		this.l.log(`##oneLoop--2----------YadorigiSignalingAdapter--------------------------------------isPutOffer:${isPutOffer} /targetDeviceNameHash:${targetDeviceNameHash}`);
		const imageList = lastOne.imageList;
		this.l.log(`##oneLoop--20----------YadorigiSignalingAdapter--------------------------------------imageList:${imageList} `);
		this.l.log(imageList);
		const offerFileName = this.getOfferFileNameLast(imageList, targetDeviceNameHash);
		const answerFileName = this.getAnswerFileNameLast(imageList, targetDeviceNameHash);
		this.l.log(`##oneLoop--201----------YadorigiSignalingAdapter--------------------------------------offerFileName:${offerFileName} answerFileName:${answerFileName} `);
		if (!offerFileName && !answerFileName && isPutOffer && !isOfferPuted) {
			this.l.log(`##oneLoop--21----------YadorigiSignalingAdapter----------------------------------NO OFFER FILE----offerFileName:${offerFileName}/targetDeviceNameHash:${targetDeviceNameHash}`);
			const { offerData, offerSdp } = await this.createOffer(imageList);
			await this.putFileFSS(offerData.fileName, offerData.hash, offerData.payload);
			this.l.log(`##oneLoop--211----------YadorigiSignalingAdapter----------------------------------PUT OFFER!----offerFileName:${offerFileName}/targetDeviceNameHash:${targetDeviceNameHash}`);
			await ProcessUtil.waitRandom();
			cache.offerSdp = offerSdp;
			cache.offerData = offerData;
			return { isOfferPuted: true };
		} else if (offerFileName && !isAnswerPutted && !answerFileName) {
			this.l.log(`##oneLoop--22----------YadorigiSignalingAdapter--------------------------------------offerFileName:${offerFileName} /targetDeviceNameHash:${targetDeviceNameHash}`);
			const offerFile = await this.getSdpFileFSS(offerFileName);
			this.l.log(`##oneLoop--221----------YadorigiSignalingAdapter-------------------------------------offerFile:${offerFile} /targetDeviceNameHash:${targetDeviceNameHash}`);
			this.l.log(offerFile);
			if (offerFile && offerFile.sdp) {
				this.l.log(`##oneLoop--2211----------YadorigiSignalingAdapter--GET-OFFER------------------------------------offerFile.sdp:${offerFile.sdp} /targetDeviceNameHash:${targetDeviceNameHash}`);
				for (let i = 0; i < 100; i++) {
					// Anserを置く有る場合
					const answerFile = await this.createAnswer(offerFile, imageList);
					this.l.log(`##oneLoop--2212----------YadorigiSignalingAdapter--------------------------------------answerFile:${answerFile} /targetDeviceNameHash:${targetDeviceNameHash}`);
					await this.putFileFSS(answerFile.fileName, answerFile.hash, answerFile.payload);
					this.l.log(`##oneLoop--2213----------YadorigiSignalingAdapter--PUT-ANSWER!!!-----------------------------------answerFile:${answerFile} /targetDeviceNameHash:${targetDeviceNameHash}`);
					await ProcessUtil.waitRandom();
					this.l.log(`##oneLoop--2214----------YadorigiSignalingAdapter--AFTER-ANSWER!!!-----------------------------------i:${i} /targetDeviceNameHash:${targetDeviceNameHash}`);
				}
				return { isOfferPuted: false, isAnswerPutted: true };
			}
			this.l.log(`##oneLoop--222----------YadorigiSignalingAdapter----------------------------------NO OFFER FILE----offerFileName:${offerFileName}/targetDeviceNameHash:${targetDeviceNameHash}`);
			const { offerData, offerSdp } = await this.createOffer(imageList);
			await this.putFileFSS(offerData.fileName, offerData.hash, offerData.payload);
			this.l.log(`##oneLoop--223----------YadorigiSignalingAdapter----------------------------------PUT OFFER!----offerFileName:${offerFileName}/targetDeviceNameHash:${targetDeviceNameHash}`);
			await ProcessUtil.waitRandom();
			cache.offerSdp = offerSdp;
			cache.offerData = offerData;
			this.l.log(`##oneLoop--224----------YadorigiSignalingAdapter--NO OFFER FILE--------------------------offerFile:${offerFile} /targetDeviceNameHash:${targetDeviceNameHash}`);
			return { isOfferPuted: true };
		}
		if (isOfferPuted || answerFileName) {
			this.l.log(`##oneLoop--23----------YadorigiSignalingAdapter--------------------------------------isOfferPuted:${isOfferPuted} /targetDeviceNameHash:${targetDeviceNameHash}`);
			if (!answerFileName) {
				this.l.log(`##oneLoop--230----------YadorigiSignalingAdapter--NO-ANSWER-FILE----------------------------------isOfferPuted:${isOfferPuted} /targetDeviceNameHash:${targetDeviceNameHash}`);
				return { isOfferPuted: false, isAnswerPutted };
			}
			this.l.log(`##oneLoop--231----------YadorigiSignalingAdapter--GET-ANSWER-----------------------------------isOfferPuted:${isOfferPuted} /answerFileName:${answerFileName}`);
			const answerFile = await this.getSdpFileFSS(answerFileName, cache.offerSdp);
			this.l.log(`##oneLoop--232----------YadorigiSignalingAdapter--GOT-ANSWER!!-----------------------------------answerFile:${answerFile} /answerFileName:${JSON.stringify(answerFileName)}`);
			if (answerFile && answerFile.sdp) {
				this.l.log(`##oneLoop--233----------YadorigiSignalingAdapter--------------------------------------answerFile.sdp:${answerFile.sdp} /answerFileName:${answerFileName}`);
				await this.connect(answerFile.sdp);
				this.l.log(`##oneLoop--234----------YadorigiSignalingAdapter-CONNECT-START!!!----------------------------------answerFile.sdp:${answerFile.sdp} /answerFileName:${answerFileName}`);
				return { isOfferPuted: false, isAnswerPutted: true };
			}
		}
		this.l.log(`##oneLoop--4----------YadorigiSignalingAdapter--------------------------------------lastOne:${lastOne} /targetDeviceNameHash:${targetDeviceNameHash}`);
		return { isPutOffer: true };
	}
	//////////////////////////////////////////////////////////////////////////////////////////
	getOfferFileNameLast(imageList, targetDeviceNameHash) {
		this.l.log(`--getOfferFileNameLast--0----------YadorigiSignalingAdapter--------------------------------------targetDeviceNameHash:${targetDeviceNameHash}`);
		const result = this.YadorigiFileProsessor.getParsedOfferFileNameList(imageList);
		// this.userId = userId;
		// this.deviceName = deviceName;
		// this.groupName = groupName;
		this.l.log(
			`--getOfferFileNameLast--1s----------YadorigiSignalingAdapter--------------------------------------result:${result}/this.groupNameHash:${this.groupNameHash}/this.userIdHash:${this.userIdHash}`
		);
		this.l.log(result);
		if (Array.isArray(result) && result.length > 0) {
			const list = [].concat(result);
			const offerRegex = YadorigiSdpFileRecord.createOfferFileNameRegex(this.groupNameHash, this.userIdHash, targetDeviceNameHash);
			this.l.log(`--getOfferFileNameLast--2----------YadorigiSignalingAdapter--------------------------------------offerRegex:${offerRegex}`);
			for (const row of list.reverse()) {
				this.l.log(`--getOfferFileNameLast--3----------YadorigiSignalingAdapter--------------------------------------row.fileName:${row.fileName} offerRegex:${offerRegex}`);
				this.l.log(row);
				if (offerRegex.test(row.fileName)) {
					this.l.log(`--getOfferFileNameLast--4----------YadorigiSignalingAdapter--GET-LAST-FILE-NAME---------------------------------row.fileName:${row.fileName}`);
					return row.fileName;
				}
			}
		}
		return null;
	}
	getAnswerFileNameLast(imageList, targetDeviceNameHash) {
		const result = this.YadorigiFileProsessor.getParsedAnswerFileNameList(imageList);
		// this.userId = userId;
		// this.deviceName = deviceName;
		// this.groupName = groupName;
		this.l.log(`--getAnswerFileNameLast--2----------YadorigiSignalingAdapter--------------------------------------result:${JSON.stringify(result)}`);
		if (result && Array.isArray(result) && result.length > 0) {
			const list = [].concat(result);
			const anserRegex = YadorigiSdpFileRecord.createAnswerFileNameRegex(this.groupNameHash, this.userIdHash, targetDeviceNameHash);
			for (const row of list.reverse()) {
				this.l.log(`--getAnswerFileNameLast--3----------YadorigiSignalingAdapter--------------------------------------row.fileName:${row.fileName} anserRegex:${anserRegex}`);
				if (anserRegex.test(row.fileName)) {
					this.l.log(`--getAnswerFileNameLast--4----------YadorigiSignalingAdapter--GET-LAST-FILE-NAME---------------------------------row.fileName:${row.fileName}`);
					return row.fileName;
				}
			}
		}
		return null;
	}
	///////////////////////////////////////////////////////////////////////////
	async getLastOneFSS() {
		this.l.log(`--YadorigiSignalingAdapter--getLastOneFSS this.groupNameHash:${this.groupNameHash}`);
		const dataBase64url = await this.YadorigiSignalingConnector.getLastOne(this.groupNameHash);
		this.l.log(`--YadorigiSignalingAdapter--getLastOneFSS dataBase64url:${dataBase64url}/${typeof dataBase64url}/this.groupNameHash:${this.groupNameHash}`);
		return await this.parseFile(dataBase64url, undefined, undefined, true);
	}
	async getSdpFileFSS(fileName, offerSdp, isGetLast) {
		this.l.log(`--YadorigiSignalingAdapter--getSdpFileFSS fileName:${fileName}/offerSdp:${offerSdp}`);
		const dataBase64url = await this.YadorigiSignalingConnector.getSdp(this.groupNameHash, fileName);
		this.l.log(`--YadorigiSignalingAdapter--getSdpFileFSS dataBase64url:${dataBase64url}/${typeof dataBase64url}`);
		return await this.parseFile(dataBase64url, !offerSdp, offerSdp, isGetLast);
	}
	async putFileFSS(fileName, hash, payload) {
		this.l.log(`--YadorigiSignalingAdapter--putFileFSS fileName:${fileName}`);
		this.l.log(`--YadorigiSignalingAdapter--putFileFSS hash:${hash}`);
		this.l.log(`--YadorigiSignalingAdapter--putFileFSS payload:${payload}`);
		await this.YadorigiSignalingConnector.putSdp(this.groupNameHash, fileName, hash, payload);
	}
	/////////////////////////////////////////////////////////////////////////////
	async createOffer(imageList = []) {
		const offerSdp = this.getSdp();
		const offerData = await this.YadorigiFileProsessor.buildOffer(this.passphraseText, imageList, this.deviceName, offerSdp, this.userId, this.groupName, 30);
		return { offerData, offerSdp };
	}
	async createAnswer(offerData, lastOneImagelist = []) {
		this.l.log(`--createAnswer--0----------YadorigiSignalingAdapter--------------------------------------offerData:${offerData.sdp}`);
		const answerSdp = await this.answer(typeof offerData.sdp === 'object' ? offerData.sdp.sdp : offerData.sdp);
		this.l.log(`--createAnswer--1----------YadorigiSignalingAdapter--------------------------------------offerData:${offerData}`);
		const imageList = this.YadorigiFileProsessor.mergeList(offerData.imageList, lastOneImagelist);
		this.l.log(`--createAnswer--2----------YadorigiSignalingAdapter--------------------------------------imageList:${imageList}`);
		const answerFile = await this.YadorigiFileProsessor.buildAnswer(this.passphraseText, imageList, this.deviceName, answerSdp, this.userId, this.groupName, offerData.sdp, 30);
		this.l.log(`--createAnswer--3----------YadorigiSignalingAdapter--------------------------------------offerData:${offerData}`);
		this.l.log(answerFile);
		return answerFile;
	}
	async parseFile(dataBase64url, isOffer = true, offerSdp, isGetLast) {
		this.l.log(`YadorigiSignalingAdapter parseFile isOffer:${isOffer} /offerSdp:${offerSdp}`);
		if (!dataBase64url || !Base64Util.isBase64Url(dataBase64url)) {
			this.l.log(`YadorigiSignalingAdapter A1 parseFile dataBase64url:${dataBase64url}`);
			return null;
		}
		this.l.log(`YadorigiSignalingAdapter parseFile dataBase64url:${dataBase64url} /${typeof dataBase64url}`);
		const parsed = await this.YadorigiFileProsessor.parse(this.passphraseText, dataBase64url, isOffer, offerSdp);
		this.l.log(`YadorigiSignalingAdapter parseFile parsed:${parsed}`);
		this.l.log(parsed);
		if (parsed && parsed.sdp) {
			this.l.log(`YadorigiSignalingAdapter parseFile parsed.sdp:${parsed.sdp}`);
			return parsed;
		}
		this.l.log(`YadorigiSignalingAdapter parseFile NO SDP!!!!!!!!!!! isGetLast:${isGetLast}`);
		return isGetLast ? parsed : null;
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
