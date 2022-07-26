import { WebRTCPeer } from './WebRTCPeer';
import { Hasher } from '../util/Hasher';
export class WebRTCConnecter {
	constructor(logger = console) {
		this.WebRTCPeerOffer = new WebRTCPeer();
		this.WebRTCPeerAnswer = new WebRTCPeer();
		this.WebRTCPeer = null;
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
		this.WebRTCPeerOffer.onOpen = (event) => {
			if (this.WebRTCPeerAnswer.isOpend) {
				this.selectActiveConnection();
			} else {
				this.onOpenCallBack(event);
				this.WebRTCPeer = this.WebRTCPeerOffer;
			}
			this.l.log('--onOpen--1-WebRTCPeerOffer---------WebRTCConnecter--------------------------------------');
			this.WebRTCPeer.onClose = this.onCloseCallBack;
			this.WebRTCPeer.onMessage = this.onMessageCallBack;
			this.WebRTCPeer.onError = this.onErrorCallBack;
			this.isOpend = true;
		};
		this.WebRTCPeerAnswer.onOpen = (event) => {
			if (this.WebRTCPeerOffer.isOpend) {
				this.selectActiveConnection();
			} else {
				this.onOpenCallBack(event);
				this.WebRTCPeer = this.WebRTCPeerAnswer;
			}
			this.l.log('--onOpen--1-WebRTCPeerOffer---------WebRTCPeerAnswer--------------------------------------');
			this.WebRTCPeer.onClose = this.onCloseCallBack;
			this.WebRTCPeer.onMessage = this.onMessageCallBack;
			this.WebRTCPeer.onError = this.onErrorCallBack;
			this.isOpend = true;
		};
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
			callback(event);
		};
	}
	setOnClose(callback) {
		this.onCloseCallBack = (event) => {
			callback(event);
		};
	}
	setOnMessage(callback) {
		this.onMessageCallBack = (msg) => {
			callback(msg);
		};
	}
	setOnError(callback) {
		this.onErrorCallBack = (error) => {
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
		return await this.WebRTCPeerAnswer.setOfferAndAswer(sdp);
	}
	async connect(sdp) {
		const hash = await Hasher.sha512(sdp);
		this.peerMap[hash] = this.WebRTCPeerOffer;
		return await this.WebRTCPeerOffer.setAnswer(sdp);
	}
	close() {
		this.WebRTCPeer.close();
	}
}
