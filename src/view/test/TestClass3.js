import { WebRTCConnecter } from '../../webrtc/WebRTCConnecter';
export class TestClass3 {
	constructor() {
		this.w = new WebRTCConnecter();
	}
	async makeOffer() {
		return await this.w.getOfferSdp();
	}
	async makeAnswer(sdpInput) {
		const sdp = typeof sdpInput === 'string' ? JSON.parse(sdpInput) : sdpInput;
		console.log(`makeAnswer sdpInput:${sdpInput}`);
		sdp.sdp = sdp.sdp.replace(/\\r\\n/g, '\r\n');
		console.log(sdp);
		return await this.w.answer(sdp.sdp);
	}
	async connect(sdpInput) {
		const sdp = typeof sdpInput === 'string' ? JSON.parse(sdpInput) : sdpInput;
		console.log(`makeAnswer sdpInput:${sdpInput}`);
		sdp.sdp = sdp.sdp.replace(/\\r\\n/g, '\r\n');
		console.log(sdp);
		return await this.w.connect(sdp.sdp);
	}
	setOnMessage(elm) {
		this.w.setOnMessage((msg) => {
			console.log(`setOnMessage msg:${msg}`);
			elm.textContent = msg;
			console.log(msg);
		});
	}
	sendMessage(msg) {
		console.log(`sendMessage msg:${msg}`);
		this.w.send(msg);
	}
}
