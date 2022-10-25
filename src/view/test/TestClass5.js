import { WebRTCConnecter } from '../../webrtc/WebRTCConnecter.js';
import { ProcessUtil } from '../../util/ProcessUtil.js';
import { Fetcher } from '../../util/Fetcher.js';
// const stringLength = 20;
// const now = Date.now();
const OFFER = '_OFFER';
const ANSWER = '_ANSWER';
const SleepMs = 100;
export class TestClass5 {
	constructor(elm, urlInput, prefixInput) {
		this.elm = elm;
		this.urlInput = urlInput;
		this.prefixInput = prefixInput;
		this.log('TestClass4');
		this.init();
		this.Fetcher = new Fetcher({}, this);
		this.cache = {};
		this.listoner = this.getLisntenr();
		this.threads = [];
	}
	init() {
		this.log('INIT START');
		this.w = new WebRTCConnecter();
		this.isAnaswer = true;
		this.isGetFirst = false;
		this.isExcangedCandidates = false;
		// this.listener = this.getLisntenr();
		this.log('setOnRecieve ANSWER');
		// LocalStorageMessanger.setOnRecieve(ANSWER, this.listener, this);
		this.log('INIT END');
	}
	log(text) {
		const msg = this.elm.textContent;
		this.elm.textContent = `${msg}\n${Date.now()} ${typeof text !== 'string' ? JSON.stringify(text) : text}`;
		console.log(text);
	}
	decode(data) {
		try {
			const obj = typeof data === 'string' ? JSON.parse(data) : data;
			// const result = obj && obj.event && obj.event.parameter ? obj.event.parameter.data : null;
			const result = obj && obj.message ? obj.message : null;
			return result;
		} catch (e) {
			console.log(e);
		}
		return null;
	}
	sleep() {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, SleepMs);
		});
	}
	async start() {
		this.isStop = false;
		const prefix = this.prefixInput.value;
		const pxOFFER = prefix + OFFER;
		const pxANSWER = prefix + ANSWER;
		const objOffer = { group: pxOFFER, fileName: `${pxOFFER}.file` };
		const objAnswer = { group: pxANSWER, fileName: `${pxANSWER}.file` };
		while (this.isStop === false) {
			setTimeout(() => {
				if (this.threads.length < 4) {
					this.threads.push(1);
				} else {
					return;
				}
				this.get(objOffer).then((data) => {
					this.threads.pop(1);
					const d = this.decode(data);
					if (!this.cache[data]) {
						this.cache[data] = 1;
						this.listoner(OFFER, { newValue: d });
					}
				});
			}, SleepMs);
			setTimeout(() => {
				if (this.threads.length < 4) {
					this.threads.push(1);
				} else {
					return;
				}
				this.get(objAnswer).then((data) => {
					this.threads.pop(1);
					const d = this.decode(data);
					if (!this.cache[data]) {
						this.cache[data] = 1;
						this.listoner(ANSWER, { newValue: d });
					}
				});
			}, SleepMs);
			await this.sleep();
		}
	}
	async stop() {
		this.isStop = true;
	}
	async openNewWindow() {
		const u = new URL(location.href);
		this.log('openNewWindow 1');
		this.window = window.open(u.href, 'newOne');
		this.log('openNewWindow 2');
		await ProcessUtil.wait(1);
		this.log('openNewWindow 3');
	}
	async offer() {
		this.isAnaswer = false;
		this.log('START3');
		const offer = await this.makeOffer();
		this.log('START4');
		// LocalStorageMessanger.removeOnRecieve();
		this.log('START5 setOnRecieve OFFER');
		// LocalStorageMessanger.setOnRecieve(OFFER, this.listener, this);
		this.log(`START6 send offer:${offer}`);
		const prefix = this.prefixInput.value;
		const pxANSWER = prefix + ANSWER;
		await this.send(pxANSWER, offer);
		// LocalStorageMessanger.send(ANSWER, offer, this);
		this.log('START7');
	}
	async send(prefix, data) {
		const srt = typeof data !== 'string' ? JSON.stringify(data) : data;
		const obj = { group: prefix, fileName: `${prefix}.file`, data: srt };

		await this.testAPIpost(obj);
		await this.testAPIget(obj);
	}

	async exec() {
		const now = Date.now();
		let count = 0;
		while (count < 10) {
			const obj = { group: now, fileName: `${now}.file`, data: `${now}/${count}` };
			await this.testAPIpost(obj);
			await this.testAPIget(obj);
			count++;
		}
	}
	async testAPIpost(obj) {
		const now = Date.now();
		this.log('================testAPIpost=A================');
		const url = this.urlInput.value;
		const data = await this.Fetcher.postToGAS(url, obj);
		this.log(`================testAPIpost=B================${Date.now() - now} data:${data}`);
	}
	async get(obj) {
		const now = Date.now();
		const key = `${now}_${Math.floor(Math.random() * 1000)}`;
		const url = this.urlInput.value;
		const data = await this.Fetcher.getTextGAS(url, obj);
		this.log(`==${key}==============get=B================${Date.now() - now} data:${data}`);
		return data;
	}
	async testAPIget(obj) {
		const now = Date.now();
		const key = `${now}_${Math.floor(Math.random() * 1000)}`;
		this.log(`==${key}==============testAPIget=A================`);
		const url = this.urlInput.value;
		const data = await this.Fetcher.getTextGAS(url, obj);
		this.log(`==${key}===============testAPIget=B================${Date.now() - now} data:${data}`);
		return data;
	}
	getLisntenr() {
		this.log(`getLisntenrA event this.isAnaswer:${this.isAnaswer}/!this.isGetFirst:${!this.isGetFirst}/this.isExcangedCandidates:${this.isExcangedCandidates}`);
		const self = this;
		return async (px, event) => {
			const value = event.newValue;
			self.log('================RECEIVE=A================');
			self.log(`getLisntenrB event px:${px}/${px === ANSWER}/self.isAnaswer:${self.isAnaswer}/!self.isGetFirst:${!self.isGetFirst}/self.isExcangedCandidates:${self.isExcangedCandidates}`);
			self.log(event);
			self.log(`value:${value}`);
			self.log('================RECEIVE=B================');
			if (value === true || value === null || value === 'null') {
				self.log(`================END=================value:${value}`);
				return;
			}
			if (self.isAnaswer) {
				self.log(`A AS ANSWER self.isAnaswer:${self.isAnaswer}`);
				if (px === ANSWER) {
					self.log(`A px:${px}`);
					if (!self.isGetFirst) {
						const func = async (candidates) => {
							// LocalStorageMessanger.send(OFFER, candidates, self);
							await this.send(OFFER, candidates);
						};
						this.setOnCandidates(func);
						const answer = await self.makeAnswer(value);
						self.isGetFirst = true;
						self.log('================answer=A================');
						self.log(answer);
						self.log('================answer=B================');
						// LocalStorageMessanger.send(OFFER, answer, self);
						await this.send(OFFER, answer);
					} else if (!self.isExcangedCandidates) {
						const candidats = await this.setCandidates(JSON.parse(value));
						self.log('================answer candidats=A================');
						self.log(candidats);
						self.isExcangedCandidates = true;
						self.log('================answer candidats=B================');
					}
				}
			} else {
				self.log(`B AS OFFER self.isAnaswer:${self.isAnaswer}`);
				if (px === OFFER) {
					self.log(`B px:${px}/!self.isGetFirst:${!self.isGetFirst}`);
					if (!self.isGetFirst) {
						const candidates = await self.connect(value);
						self.log('================candidates=A================');
						self.log(candidates);
						self.log('================candidates=B================');
						self.isGetFirst = true;
						// LocalStorageMessanger.send(ANSWER, candidates, self);
						await this.send(OFFER, candidates);
						// } else if (!this.isExcangedCandidates) {
						// 	LocalStorageMessanger.send(OFFER, answer);
						// 	this.isExcangedCandidates = true;
					} else if (!self.isExcangedCandidates) {
						const candidats = await this.setCandidates(JSON.parse(value));
						self.log('================offer candidats=A================');
						self.log(candidats);
						self.isExcangedCandidates = true;
						self.log('================offer candidats=B================');
					}
				}
			}
		};
	}
	async makeOffer() {
		const offer = await this.w.getOfferSdp();
		// await ClipboardUtil.copy(offer);
		return offer;
	}
	async makeAnswer(sdpInput) {
		const sdp = typeof sdpInput === 'string' ? JSON.parse(sdpInput) : sdpInput;
		this.log(`makeAnswer sdpInput:${sdpInput}`);
		sdp.sdp = sdp.sdp.replace(/\\r\\n/g, '\r\n');
		this.log(sdp);
		const answer = await this.w.answer(sdp.sdp);
		return answer;
	}
	connect(sdpInput) {
		const func = async (resolve) => {
			const sdp = typeof sdpInput === 'string' ? JSON.parse(sdpInput) : sdpInput;
			this.log(`connect sdpInput:${sdpInput}`);
			sdp.sdp = sdp.sdp.replace(/\\r\\n/g, '\r\n');
			this.log(sdp);
			return await this.w.connect(sdp.sdp, (candidates) => {
				resolve(candidates);
			});
		};
		return new Promise(func);
	}
	setOnCandidates(func) {
		this.w.setOnCandidates(func);
	}
	async setCandidates(candidatesInput) {
		const candidates = candidatesInput;
		this.w.setCandidates(candidates);
	}
	setOnMessage(elm) {
		this.w.setOnMessage((msg) => {
			this.log(`setOnMessage msg:${msg}`);
			elm.textContent = msg;
			console.log(msg);
		});
	}
	sendMessage(msg) {
		this.log(`sendMessage msg:${msg}`);
		this.w.send(msg);
	}
}
