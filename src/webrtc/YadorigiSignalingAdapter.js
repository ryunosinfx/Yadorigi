import { WebRTCConnecter } from './WebRTCConnecter';
export class YadorigiSignalingAdapter {
	constructor(password, userId, deviceName, groupName) {
		this.password = password;
		this.userId = userId;
		this.deviceName = deviceName;
		this.groupName = groupName;
		this.WebRTCConnecter = new WebRTCConnecter();
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
