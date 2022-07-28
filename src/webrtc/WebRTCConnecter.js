import { WebRTCPeer } from './WebRTCPeer';
import { Hasher } from '../util/Hasher';
import { ProcessUtil } from '../util/ProcessUtil';
export class WebRTCConnecter {
	constructor(logger = console) {
		this.WebRTCPeerOffer = new WebRTCPeer('OFFER');
		this.WebRTCPeerAnswer = new WebRTCPeer('ANSWER');
		this.WebRTCPeer = null;
		this.WebRTCPeerCurrent = null;
		this.peerMap = {};
		this.onOpenCallBack = () => {};
		this.onCloseCallBack = () => {};
		this.onMessageCallBack = () => {};
		this.onErrorCallBack = () => {};
		//OfferはAnswerを受け取った時点で分かる
		//AnswerはOfferを受け取った時点で分かる。
		this.isOpend = false;
		this.l = logger;
	}
	async init() {
		this.l.log('--init--0----------WebRTCConnecter--------------------------------------');
		this.WebRTCPeerOffer.close();
		this.WebRTCPeerAnswer.close();
		this.l.log('--init--1----------WebRTCConnecter--------------------------------------');
		const result = await this.WebRTCPeerOffer.makeOffer();
		this.l.log(`--init--2----------WebRTCConnecter--------------------------------------result:${result}`);
		const self = this;
		const onOpenAtOffer = (event) => {
			if (self.WebRTCPeerAnswer.isOpend) {
				self.selectActiveConnection();
			} else {
				self.onOpenCallBack(event);
				self.WebRTCPeer = self.WebRTCPeerOffer;
			}
			self.l.log('--onOpen--1-WebRTCPeerOffer---------WebRTCConnecter--------------------------------------');
			self.WebRTCPeer.onClose = self.onCloseCallBack;
			self.WebRTCPeer.onMessage = self.onMessageCallBack;
			self.WebRTCPeer.onError = self.onErrorCallBack;
			self.isOpend = true;
		};
		const onOpenAtAnswer = (event) => {
			if (self.WebRTCPeerOffer.isOpend) {
				self.selectActiveConnection();
			} else {
				self.onOpenCallBack(event);
				self.WebRTCPeer = self.WebRTCPeerAnswer;
			}
			self.l.log('--onOpen--1-WebRTCPeerAnswer---------WebRTCPeerAnswer--------------------------------------');
			self.WebRTCPeer.onClose = self.onCloseCallBack;
			self.WebRTCPeer.onMessage = self.onMessageCallBack;
			self.WebRTCPeer.onError = self.onErrorCallBack;
			self.isOpend = true;
		};
		this.WebRTCPeerAnswer.onOpen = onOpenAtAnswer;
		this.WebRTCPeerOffer.onOpen = onOpenAtOffer;
		return result;
	}

	async getOfferSdp() {
		if (await this.init()) {
			return this.getSdp();
		}
		return '';
	}
	selectActiveConnection() {
		const hashList = [];
		for (const hash in this.peerMap) {
			hashList.push(hash);
		}
		if (hashList.length > 1) {
			hashList.sort();
			const closeTarget = hashList.pop();
			const mainTarget = hashList.pop();
			this.WebRTCPeer = this.peerMap[mainTarget];

			this.WebRTCPeer.onClose = this.onCloseCallBack;
			const peerClose = this.peerMap[closeTarget];
			peerClose.onClose = () => {};
			peerClose.close();
		}
	}
	setOnOpne(callback) {
		this.onOpenCallBack = (event) => {
			console.warn(`--onOpenCallBack--1----------WebRTCConnecter--------------------------------------event:${event}`);
			callback(event);
		};
	}
	setOnClose(callback) {
		this.onCloseCallBack = (event) => {
			console.warn(`--onCloseCallBack--1----------WebRTCConnecter--------------------------------------event:${event}`);
			callback(event);
		};
	}
	setOnMessage(callback) {
		this.onMessageCallBack = (msg) => {
			console.warn(`--onMessageCallBack--1----------WebRTCConnecter--------------------------------------event:${event}`);
			callback(msg);
		};
	}
	setOnError(callback) {
		this.onErrorCallBack = (error) => {
			console.warn(`--onErrorCallBack--1----------WebRTCConnecter--------------------------------------event:${event}`);
			callback(error);
		};
	}
	send(msg) {
		this.WebRTCPeer.send(msg);
	}
	getSdp() {
		return this.WebRTCPeer ? this.WebRTCPeer.sdp : this.WebRTCPeerOffer.sdp;
	}
	async answer(sdp) {
		const hash = await Hasher.sha512(sdp);
		this.peerMap[hash] = this.WebRTCPeerAnswer;
		this.WebRTCPeerCurrent = this.WebRTCPeerAnswer;
		return await this.WebRTCPeerAnswer.setOfferAndAswer(sdp);
	}
	async connect(sdp) {
		const hash = await Hasher.sha512(sdp);
		this.peerMap[hash] = this.WebRTCPeerOffer;
		this.WebRTCPeerCurrent = this.WebRTCPeerOffer;
		return await this.WebRTCPeerOffer.setAnswer(sdp);
	}
	async setOnCandidates(func) {
		let count = 0;
		while (count < 100) {
			await ProcessUtil.wait(20 * count);
			const candidates = this.WebRTCPeerCurrent.getCandidates();
			console.log(`setOnCandidates count:${count}/candidates:${candidates}`);
			if (Array.isArray(candidates) && candidates.length > 0) {
				func(candidates);
				break;
			}
			count += 1;
		}
	}
	async setCandidates(candidatesInput) {
		const candidates = typeof candidatesInput === 'object' ? candidatesInput : JSON.parse(candidatesInput);
		this.WebRTCPeerCurrent.setCandidates(candidates);
	}
	close() {
		this.WebRTCPeer.close();
	}
}
