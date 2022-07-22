import { Hasher } from '../util/Hasher';
// import { ProcessUtil } from '../util/ProcessUtil';
import { YadorigiFileProsessor } from './YadorigiFileProsessor';
import { YadorigiSignalingConnector } from './YadorigiSignalingConnector';
// import { YadorigiSdpFileRecord } from './YadorigiSdpFileRecord';
import { WebRTCConnecter } from './WebRTCConnecter';
// const waitms = 20;
export class YadorigiLocalSignalingConnector {
	constructor(isHub, passphraseText, userId, key, targetUrl = navigator.userAgent) {
		this.passphraseText = passphraseText;
		this.userId = userId;
		this.key = key;
		this.WebRTCConnectors = {};
		this.YadorigiFileProsessor = new YadorigiFileProsessor(key);
		this.YadorigiSignalingConnector = new YadorigiSignalingConnector();
		this.isHub = isHub;
		this.groupName = location.pathname;
		this.eventMapedFunc = null;
		this.hubName = `${navigator.userAgent}//` + 'HUB';
		this.deviceName = isHub ? this.hubName : targetUrl;
		this.connected = false;
		this.peerMapAtHub = {};
	}
	// TODO
	async init() {
		this.connected = false;
		console.log('--init--0----------YadorigiLocalSignalingConnector--------------------------------------');
		this.offer = await this.WebRTCConnecter.init();
		console.log(`--init--1----------YadorigiLocalSignalingConnector--------------------------------------this.offer:${this.offer}`);
		this.userIdHash = await Hasher.sha512(this.userId);
		console.log('--init--2----------YadorigiLocalSignalingConnector--------------------------------------');
		this.groupNameHash = await Hasher.sha512(this.groupName);
		console.log('--init--3----------YadorigiLocalSignalingConnector--------------------------------------');
		this.deviceNameHash = await Hasher.sha512(this.deviceName);
		this.passphraseHash = await Hasher.sha512(this.passphraseText);
		this.hubPrefix = await Hasher.sha512(`${this.groupNameHash}.${this.userIdHash}.${this.passphraseHash}.HUB`, 1000);
	}
	setOnOpne(callback) {
		if (this.isHub) {
			this.onOpenCallback = callback;
		} else {
			this.WebRTCConnecter.setOnOpne((data) => {
				this.connected = true;
				callback(data);
			});
		}
	}
	setOnClose(callback) {
		if (this.isHub) {
			this.onCloseeCallback = callback;
		} else {
			this.WebRTCConnecter.setOnClose((data) => {
				this.connected = false;
				callback(data);
			});
		}
	}
	setOnMessage(callback) {
		if (this.isHub) {
			this.onMessageCallback = callback;
		} else {
			this.WebRTCConnecter.setOnMessage(callback);
		}
	}
	setOnError(callback) {
		if (this.isHub) {
			this.onErrorCallback = callback;
		} else {
			this.WebRTCConnecter.setOnError(callback);
		}
	}
	send(msg) {
		this.WebRTCConnecter.send(msg);
	}
	broadCast(msg) {
		for (const key in this.peerMapAtHub) {
			const webRTCConnecter = this.peerMapAtHub[key];
			if (webRTCConnecter && webRTCConnecter.isOpend) {
				webRTCConnecter.send(msg);
			}
		}
	}
	close() {
		this.WebRTCConnecter.close();
	}
	// buildImage(imageList, sdp) {
	// 	return [];
	// }
	async startConnect() {
		/**
         * 通信手順は
①ハブのprefix（ユーザID、pathname、パスフレーズ、ハブの添字、これを混ぜてハッシュ）を計算する
②それにタブ毎に識別子（ua+時間+ランダムのハッシュ）をつける
③ハブはprefixでキーを待ち受ける
④返信は、受け取ったキー＋offerのハッシュをキーで
⑤アンサーはそれで待ち受け */
		let count = 0;
		const isPutOffer = true;
		let isOfferPuted = false;
		const targetDeviceNameHash = await Hasher.sha512(this.userId + Date.now());
		while (count < 10) {
			console.log(`--startConnect--3----------YadorigiLocalSignalzer--------------------------------------count:${count}`);
			const result = await this.oneLoop(targetDeviceNameHash, isPutOffer, isOfferPuted);
			console.log(`--startConnect--4----------YadorigiLocalSignalzer--------------------------------------result:${result}`);
			isOfferPuted = result.isOfferPuted;
			console.log(`--startConnect--5----------YadorigiLocalSignalzer--------------------------------------isOfferPuted:${isOfferPuted}`);
			// alert(count);
			if (this.connected) {
				break;
			}
			count++;
		}
		alert('end!');
	}
	async connect(targetDeviceNameHash) {
		if (this.isHub) {
			this.connectAsHub(targetDeviceNameHash);
		} else {
			await this.connectAsPeer(targetDeviceNameHash);
		}
	}
	/////// Hub
	async connectAsHub(targetDeviceNameHash) {
		this.setEventListener(this.createOnSaveEventListenerHub(targetDeviceNameHash));
		//ListenerOnly
	}
	createOnSaveEventListenerHub(targetDeviceNameHash) {
		console.log(`--createOnSaveEventListenerHub--1----------YadorigiLocalSignalzer--------------------------------------targetDeviceNameHash:${targetDeviceNameHash}`);
		if (this.eventMapedFun) {
			return this.eventMapedFun;
		}
		console.log(`--createOnSaveEventListenerHub--2----------YadorigiLocalSignalzer--------------------------------------targetDeviceNameHash:${targetDeviceNameHash}`);
		const func = async (key, newValue, url) => {
			if (key.indexOf(this.hubPrefix) !== 0) {
				return;
			}
			const tokens = key.split('.');
			if (tokens.length !== 2) {
				return;
			}

			const offerFile = JSON.parse(newValue);
			const offer = await this.parseFile(offerFile.payload);
			if (offer && offer.sdp) {
				const deviceNameHash = tokens[1];
				console.log(
					`--createOnSaveEventListenerHub--2211----------YadorigiLocalSignalzer--------------------------------------offerFile.sdp:${offer.sdp} /targetDeviceNameHash:${targetDeviceNameHash}`
				);
				// Anserを置く有る場合
				const answerFile = await this.createAnswer(deviceNameHash, offer);
				console.log(`--createOnSaveEventListenerHub--2212----------YadorigiLocalSignalzer--------------------------------------answerFile:${answerFile} /targetDeviceNameHash:${targetDeviceNameHash}`);
				const responceHash = await Hasher.sha512(this.hubPrefix + deviceNameHash + offerFile.hash, 1000);

				sessionStorage.setItem(responceHash, JSON.stringify(answerFile));
			}
		};
		// getAnswer
		return func;
	}
	/////// Peer
	async connectAsPeer(targetDeviceNameHash) {
		//const fileName = groupNameHash + '.' + userIdHash + '.' + senderDeviceNameHash + '.' + expireTime + '.' + (isOffer ? 'offer' : 'ans');
		this.setEventListener(this.createOnSaveEventListenerPeer(targetDeviceNameHash));
		while (count < 10) {
			const offerSdp = this.getSdp();
			const offer = this.createOffer([], offerSdp);
			this.currentOffer = offer;
			const responceHash = await Hasher.sha512(this.hubPrefix + this.deviceNameHash + offer.hash, 1000);
			sessionStorage.setItem(`${this.hubPrefix}.${targetDeviceNameHash}`, JSON.stringify(offer));
			await new Promise(async (resolve) => {
				this.eventMapedFun = async (key, newValue, url) => {
					if (key === responceHash) {
						return;
					}
					const answerFile = JSON.parse(newValue);
					const answer = await this.parseFile(answerFile.payload, offerSdp);
					if (answer.sdp) {
						this.connected = await this.connect(answer.sdp);
					}
					resolve();
				};
				setTomeout(() => {
					resolve();
				}, 1000 * 30);
				this;
			});
			if (this.connected) {
				break;
			}
		}
	}
	createOnSaveEventListenerPeer(targetDeviceNameHash) {
		console.log(`--createOnSaveEventListenerPeer--1----------YadorigiLocalSignalzer--------------------------------------targetDeviceNameHash:${targetDeviceNameHash}`);
		if (this.eventMapedFun) {
			return this.eventMapedFun;
		}
		console.log(`--createOnSaveEventListenerPeer--2----------YadorigiLocalSignalzer--------------------------------------targetDeviceNameHash:${targetDeviceNameHash}`);
		const func = async (key, newValue, url) => {};
		// getAnswer
		return func;
	}
	///////////////////////////////////////////////////////////////////////////
	setEventListener(callback) {
		if (this.eventMapedFun) {
			return;
		}
		this.eventMapedFun = callback;
		this.eventMaped.window.addEventListener(
			'storage',
			function (evt) {
				const key = evt.key;
				const newValue = evt.newValue;
				const url = evt.url;
				callback(key, newValue, url);
			},
			false
		);
	}
	///////////////////////////////////////////////////////////////////////////
	async createOffer(imageList = [], offerSdp = this.getSdp()) {
		const offerFile = await this.YadorigiFileProsessor.buildOffer(this.passphraseText, imageList, this.deviceName, offerSdp, this.userId, this.groupName, 30);
		return offerFile;
	}
	async createAnswer(targetDeviceNameHash, offerData) {
		// this.peerMapAtHub;
		console.log(`--createAnswer--0----------YadorigiLocalSignalzer--------------------------------------offerData:${offerData.sdp}`);
		const answerSdp = await this.answer(targetDeviceNameHash, typeof offerData.sdp === 'object' ? offerData.sdp.sdp : offerData.sdp);
		console.log(`--createAnswer--1----------YadorigiLocalSignalzer--------------------------------------offerData:${offerData}`);
		const imageList = offerData.imageList;
		console.log(`--createAnswer--2----------YadorigiLocalSignalzer--------------------------------------offerData:${offerData}`);
		const answerFile = await this.YadorigiFileProsessor.buildAnswer(this.passphraseText, imageList, this.deviceName, answerSdp, this.userId, this.groupName, offerData.sdp, 30);
		console.log(`--createAnswer--3----------YadorigiLocalSignalzer--------------------------------------offerData:${offerData}`);
		return answerFile;
	}
	async parseFile(dataBase64url, offerSdp) {
		if (!dataBase64url) {
			return null;
		}
		console.log(`parseFile A dataBase64url:${dataBase64url}`);
		console.log(`parseFile A offerSdp:${offerSdp}`);
		const parsed = await this.YadorigiFileProsessor.parse(this.passphraseText, dataBase64url, !offerSdp, offerSdp);
		console.log(`parseFile B parsed:${parsed}`);
		console.log(parsed);
		if (parsed && parsed.sdp) {
			console.log(`parseFile parsed.sdp:${parsed.sdp}`);
			return parsed;
		}
		return null;
	}

	//////////////////////////////
	getSdp() {
		this.WebRTCConnecter = new WebRTCConnecter();
		return this.WebRTCConnecter.getSdp();
	}
	async answer(targetDeviceNameHash, sdp) {
		const webRTCConnecter = new WebRTCConnecter();
		this.peerMapAtHub[targetDeviceNameHash] = webRTCConnecter;
		webRTCConnecter.setOnOpne((data) => {
			webRTCConnecter.setOnMessage(this.onMessageCallback);
			webRTCConnecter.setOnError(this.onErrorCallback);
			webRTCConnecter.setOnClose(this.onCloseeCallback);
			this.onOpenCallback(data);
		});
		return await webRTCConnecter.answer(sdp);
	}
	// async connect(sdp) {
	// 	return await this.WebRTCConnecter.connect(sdp);
	// }
}
