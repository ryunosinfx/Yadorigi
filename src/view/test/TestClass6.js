import { WebRTCConnecter } from '../../webrtc/WebRTCConnecter.js';
export const te = new TextEncoder('utf-8');
const OFFER = '_OFFER';
const ANSWER = '_ANSWER';
const SleepMs = 100;
const WAIT = 'wait';
const WAIT_AUTO_INTERVAL = 1000 * 20;
const contentType = 'application/x-www-form-urlencoded';

export class TestClass6 {
	constructor(elm, urlInput, groupInput) {
		this.elm = elm;
		this.urlInput = urlInput;
		this.groupInput = groupInput;
		this.log('TestClass6');
		this.inited = this.init();
		this.cache = {};
		this.listoner = this.getLisntenr();
		this.threads = [];
	}
	async init() {
		this.log('INIT START');
		this.w = new WebRTCConnecter();
		this.isAnaswer = true;
		this.isGetFirst = false;
		this.isExcangedCandidates = false;
		this.hash = await this.mkHash();
		this.log('INIT END');
	}
	async mkHash(seeds = [location.origin, navigator.userAgent, Date.now()], stretch = Math.floor(Math.random() * 100) + (Date.now() % 100) + 1) {
		return await this.digest(JSON.stringify(seeds, stretch));
	}
	log(text) {
		const msg = this.elm.textContent;
		this.elm.textContent = `${msg}\n${Date.now()} ${typeof text !== 'string' ? JSON.stringify(text) : text}`;
		console.log(text);
	}
	clear() {
		this.elm.textContent = '';
	}
	decode(data) {
		try {
			const obj = typeof data === 'string' ? JSON.parse(data) : data;
			const result = obj && obj.message ? obj.message : null;
			return result;
		} catch (e) {
			console.log(e);
		}
		return null;
	}
	sleep(ms = SleepMs) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
	}
	async startAuto() {
		await this.inited;
		this.isStopAuto = false;
		let count = 0;
		this.isWaiting = false;
		this.isStop = false;
		while (this.isStopAuto === false && this.isStop === false) {
			const group = this.groupInput.value;
			this.gropuHash = await this.digest(group);
			await this.sleep(WAIT_AUTO_INTERVAL / 4);
			if (count % 4 === 0) {
				await this.sendWait(group);
			}
			count++;
			const data = await this.get(group);
			if (data) {
				console.log(`data:${data}`);
				const list = JSON.parse(data);
				const now = Date.now();
				let isOffer = false;
				let isHotStamdby = false;
				if (!Array.isArray(list)) {
					continue;
				}
				for (const row of list) {
					if (row.expire > now) {
						continue;
					}
					if (row.hash !== this.hash && row.hash.indexOf(this.hash) < 0) {
						console.log();
						await this.sendWaitNotify(group, row.hash);
						isHotStamdby = true;
						break;
					}
				}
				const data2 = await this.get(group);
				const list2 = JSON.parse(data2);
				if (!Array.isArray(list2)) {
					continue;
				}
				const list3 = [];
				for (const row of list2) {
					if (row.expire > now) {
						continue;
					}
					list3.push(JSON.stringify([row.expire, row.hash]));
				}
				list3.sort();
				list3.reverse();
				for (const row of list3) {
					const cols = JSON.parse(row);
					const hash = cols[1];
					if (hash.indexOf(this.hash) === 1) {
						isOffer = true;
						break;
					}
					if (hash.indexOf(this.hash) >= this.hash.length) {
						isOffer = false;
						break;
					}
				}
				if (isHotStamdby) {
					this.start();
					await this.sleep(100);
					if (isOffer) {
						this.offer();
					}
					setTimeout(() => {
						isHotStamdby = false;
					}, WAIT_AUTO_INTERVAL);
					while (isHotStamdby) {
						await this.sleep(100);
					}
				}
			}
		}
	}
	async sendWait(group) {
		await this.send(group, WAIT, { msg: WAIT, hash: this.hash, expire: Date.now() + WAIT_AUTO_INTERVAL });
	}
	async sendWaitNotify(group, tagetHash) {
		await this.send(group, WAIT, { msg: WAIT, hash: `/${this.hash}/${tagetHash}`, expire: Date.now() + WAIT_AUTO_INTERVAL });
	}
	async start() {
		this.isStop = false;
		const prefix = this.groupInput.value;
		const pxOFFER = prefix + OFFER;
		const pxANSWER = prefix + ANSWER;
		const objOffer = { group: pxOFFER, cmd: `${pxOFFER}.cmd` };
		const objAnswer = { group: pxANSWER, cmd: `${pxANSWER}.cmd` };
		this.w.setOnOpne(() => {
			this.isStop = true;
		});
		while (this.isStop === false) {
			setTimeout(() => {
				if (this.isAnaswer) {
					return;
				}
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
				if (!this.isAnaswer) {
					return;
				}
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
		this.window = window.open(new URL(location.href).href, 'newOne');
		await this.sleep(1000);
	}
	async offer() {
		this.isAnaswer = false;
		this.log('START1');
		const offer = await this.makeOffer();
		this.log(`START2 setOnRecieve OFFER send offer:${offer}`);
		const prefix = this.groupInput.value;
		const pxANSWER = prefix + ANSWER;
		await this.send(pxANSWER, offer);
		this.log('START3');
	}
	async send(group, dataObj, cmd = 'g') {
		const data = typeof dataObj !== 'string' ? JSON.stringify(dataObj) : dataObj;
		await this.post({ group, cmd, data });
	}
	async post(obj) {
		const now = Date.now();
		const data = await this.postToGAS(this.urlInput.value, obj);
		this.log(`================post=================${obj.group}/${obj.cmd} d:${Date.now() - now} data:${data}`);
	}
	async get(obj) {
		const now = Date.now();
		const key = `${now}_${Math.floor(Math.random() * 1000)}`;
		const data = await this.getTextGAS(this.urlInput.value, obj);
		this.log(`==${key}==============get=B========${obj.group}/${obj.cmd} this.isAnaswer:${this.isAnaswer}========${Date.now() - now} data:${data}`);
		return data;
	}
	getLisntenr() {
		this.log(`getLisntenrA event this.isAnaswer:${this.isAnaswer}/!this.isGetFirst:${!this.isGetFirst}/this.isExcangedCandidates:${this.isExcangedCandidates}`);
		const self = this;
		return async (px, event) => {
			const value = event.newValue;
			const prefix = this.groupInput.value;
			const pxOFFER = prefix + OFFER;
			const pxANSWER = prefix + ANSWER;
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
						this.setOnCandidates(async (candidates) => {
							await this.send(pxOFFER, candidates);
						});
						const answer = await self.makeAnswer(value);
						self.isGetFirst = true;
						self.log('================answer=A================');
						self.log(answer);
						self.log('================answer=B================');
						await this.send(pxOFFER, answer);
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
						await this.send(pxANSWER, candidates);
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
		return await this.w.getOfferSdp();
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
	//////Hash Core///////////////////////////////////////////////
	async digest(message, stretchCount = 1, algo = 'SHA-256') {
		let result = te.encode(message);
		for (let i = 0; i < stretchCount; i++) {
			result = await window.crypto.subtle.digest(algo, result);
		}
		return this.ab2Base64Url(result);
	}
	ab2Base64Url(abInput) {
		const ab = abInput.buffer ? abInput.buffer : abInput;
		const base64 = window.btoa(this.arrayBuffer2BinaryString(new Uint8ClampedArray(ab)));
		return base64 ? base64.split('+').join('-').split('/').join('_').split('=').join('') : base64;
	}
	arrayBuffer2BinaryString(u8a) {
		const retList = [];
		for (const e of u8a) {
			retList.push(String.fromCharCode(e));
		}
		return retList.join('');
	}
	//////Fetcher Core///////////////////////////////////////////////
	static convertObjToQueryParam(data) {
		return data && typeof data === 'object'
			? Object.keys(data)
					.map((key) => `${key}=${encodeURIComponent(data[key])}`)
					.join('&')
			: data;
	}
	async getTextGAS(path, data = {}) {
		console.log('----getTextGAS--A------------');
		const r = await fetch(`${path}?${this.convertObjToQueryParam(data)}`, {
			method: 'GET',
			redirect: 'follow',
			Accept: 'application/json',
			'Content-Type': contentType,
		});
		return await r.text();
	}
	async postToGAS(path, data) {
		console.log('----postToGAS--A------------');
		const r = await fetch(`${path}`, {
			method: 'POST',
			redirect: 'follow',
			Accept: 'application/json',
			'Content-Type': contentType,
			body: `${this.convertObjToQueryParam(data)}`,
			headers: {
				'Content-Type': contentType,
			},
		});
		return await r.text();
	}
}
