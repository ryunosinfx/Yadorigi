import { WebRTCConnecter } from '../../webrtc/WebRTCConnecter.js';
import { ClipboardUtil } from '../../util/ClipboardUtil.js';
const stringLength = 20;
export class TestClass3 {
	constructor() {
		this.w = new WebRTCConnecter();
		this.isAnaswer = false;
	}
	async makeOffer() {
		const offer = await this.w.getOfferSdp();
		await ClipboardUtil.copy(offer);
		return offer;
	}
	async makeAnswer(sdpInput) {
		const sdp = typeof sdpInput === 'string' ? (sdpInput.length < stringLength ? JSON.parse(await ClipboardUtil.past()) : JSON.parse(sdpInput)) : sdpInput;
		console.log(`makeAnswer sdpInput:${sdpInput}`);
		sdp.sdp = sdp.sdp.replace(/\\r\\n/g, '\r\n');
		console.log(sdp);
		const answer = await this.w.answer(sdp.sdp);
		await ClipboardUtil.copy(answer);
		return answer;
	}
	async connect(sdpInput) {
		const sdp = typeof sdpInput === 'string' ? (sdpInput.length < stringLength ? JSON.parse(await ClipboardUtil.past()) : JSON.parse(sdpInput)) : sdpInput;
		console.log(`makeAnswer sdpInput:${sdpInput}`);
		sdp.sdp = sdp.sdp.replace(/\\r\\n/g, '\r\n');
		console.log(sdp);
		return await this.w.connect(sdp.sdp);
	}
	setOnCandidates(elm) {
		this.w.setOnCandidates((candidates) => {
			const msg = JSON.stringify(candidates);
			console.log(`setOnCandidates msg:${msg}`);
			elm.textContent = msg;
			console.log(msg);
		});
	}
	async setCandidates(candidatesInput) {
		const candidates = candidatesInput.length < stringLength ? JSON.parse(await ClipboardUtil.past()) : candidatesInput;
		this.w.setCandidates(candidates);
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
