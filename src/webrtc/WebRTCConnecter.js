export class WebRTCConnecter {
	constructor() {
		this.WebRTCPeer = new WebRTCPeer();
	}
	async init() {
		this.WebRTCPeer.close();
		return this.WebRTCPeer.makeOffer();
	}
	setOnOpne(callback) {
		this.WebRTCPeer.onOpen = event => {
			callback(event);
		};
	}
	setOnClose(callback) {
		this.WebRTCPeer.onClose = event => {
			callback(event);
		};
	}
	setOnMessage(callback) {
		this.WebRTCPeer.onMessage = msg => {
			callback(msg);
		};
	}
	setOnError(callback) {
		this.WebRTCPeer.onError = error => {
			callback(error);
		};
	}
	send(msg) {
		this.WebRTCPeer.send(msg);
	}
	getSdp() {
		return this.WebRTCPeer.sdp;
	}
	async answer(sdp) {
		return await this.WebRTCPeer.setOfferAndAswer(sdp);
	}
	async connect(sdp) {
		return await this.WebRTCPeer.setAnswer(sdp);
	}
	close() {
		this.WebRTCPeer.close();
	}
}
