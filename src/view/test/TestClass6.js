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
		this.threads = [];
	}
	async init() {
		this.log('INIT START');
		this.w = new WebRTCConnecter();
		this.isAnaswer = true;
		this.isGetFirst = false;
		this.isExcangedCandidates = false;
		this.hash = await this.mkHash();
		this.log(`INIT END this.hash:${this.hash}`);
	}
	async mkHash(seeds = [location.origin, navigator.userAgent, Date.now()], stretch = Math.floor(Math.random() * 100) + (Date.now() % 100) + 1) {
		return await this.digest(JSON.stringify(seeds), stretch);
	}
	log(text) {
		this.elm.textContent = `${this.elm.textContent}\n${Date.now()} ${typeof text !== 'string' ? JSON.stringify(text) : text}`;
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
		const ef = (e) => {
			console.log(e.message);
			console.log(e.stack);
		};
		while (this.isStopAuto === false && this.isStop === false) {
			const group = this.groupInput.value;
			this.gropuHash = await this.digest(group);
			await this.sleep(WAIT_AUTO_INTERVAL / 4);
			if (count % 4 === 0) {
				await this.sendWait(group);
			}
			count++;
			const list = await this.getWaitList(group);
			if (list) {
				this.log(list);
				const now = Date.now();
				let isHotStamdby = false;
				if (!Array.isArray(list)) {
					continue;
				}
				for (const row of list) {
					if (row.expire < now) {
						continue;
					}
					const v = row.value && typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
					console.log(row);
					if (v.hash !== this.hash && v.hash.indexOf(this.hash) < 0) {
						console.log(`sendWaitNotify group:${group}`);
						await this.sendWaitNotify(group, v.hash);
						isHotStamdby = true;
						break;
					}
				}
				const list2 = await this.getWaitList(group);
				if (!Array.isArray(list2)) {
					continue;
				}
				const list3 = [];
				for (const row of list2) {
					if (row.expire < now) {
						continue;
					}
					const v = row.value && typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
					list3.push(JSON.stringify([row.expire, v.hash]));
				}
				list3.sort();
				list3.reverse();
				let isOffer = false;
				let rowCount = 0;
				for (const row of list3) {
					const cols = JSON.parse(row);
					const hash = cols[1];
					if (hash.indexOf(this.hash) === 1) {
						isOffer = true;
						rowCount++;
					}
					if (hash.indexOf(this.hash) >= this.hash.length) {
						isOffer = false;
						rowCount++;
					}
					if (rowCount >= 2) {
						break;
					}
				}
				if (isHotStamdby) {
					this.start().catch(ef);
					await this.sleep(100);
					if (isOffer) {
						await this.sleep(1000);
						this.offer().catch(ef);
					}
					setTimeout(() => {
						isHotStamdby = false;
						this.isStop = true;
					}, WAIT_AUTO_INTERVAL);
					while (isHotStamdby) {
						await this.sleep(100);
					}
					this.isStop = false;
				}
			}
		}
	}
	async sendWait(group) {
		await this.send(group, { msg: WAIT, hash: this.hash, expire: Date.now() + WAIT_AUTO_INTERVAL }, WAIT);
	}
	async sendWaitNotify(group, tagetHash) {
		await this.send(group, { msg: WAIT, hash: `/${this.hash}/${tagetHash}`, expire: Date.now() + WAIT_AUTO_INTERVAL }, WAIT);
	}
	async getWaitList(group) {
		const data = await this.loas(group, WAIT);
		const obj = data ? JSON.parse(data) : null;
		return obj ? obj.message : null;
	}
	async start() {
		this.isStop = false;
		const prefix = this.groupInput.value;
		const pxOFFER = prefix + OFFER;
		const pxANSWER = prefix + ANSWER;
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
				this.load(pxOFFER).then((data) => {
					this.threads.pop(1);
					const d = this.decode(data);
					if (d && !this.cache[data]) {
						this.cache[data] = 1;
						this.listoner(OFFER, d);
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
				this.load(pxANSWER).then((data) => {
					this.threads.pop(1);
					const d = this.decode(data);
					if (d && !this.cache[data]) {
						this.cache[data] = 1;
						this.listoner(ANSWER, d);
					}
				});
			}, SleepMs);
			await this.sleep();
		}
	}
	async stop() {
		this.isStop = true;
		this.isStopAuto = true;
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
		const now = Date.now();
		const data = await this.postToGAS(this.urlInput.value, { group, cmd, data: typeof dataObj !== 'string' ? JSON.stringify(dataObj) : dataObj });
		this.log(`================send=================${group}/${cmd} d:${Date.now() - now} data:${data}`);
	}
	async load(group, cmd = 'g') {
		const now = Date.now();
		const key = `${now}_${Math.floor(Math.random() * 1000)}`;
		const data = await this.getTextGAS(this.urlInput.value, { group, cmd });
		this.log(`==${key}==============load=B========${group}/${cmd} this.isAnaswer:${this.isAnaswer}========${Date.now() - now} data:${data}`);
		return data;
	}
	async listoner(px, value) {
		const prefix = this.groupInput.value;
		const pxOFFER = prefix + OFFER;
		const pxANSWER = prefix + ANSWER;
		this.log('==============LISTENER==RECEIVE=A================');
		this.log(`getLisntenrB event px:${px}/${px === ANSWER}/this.isAnaswer:${this.isAnaswer}/!this.isGetFirst:${!this.isGetFirst}/this.isExcangedCandidates:${this.isExcangedCandidates}`);
		this.log(`value:${value}`);
		this.log('==============LISTENER==RECEIVE=B================');
		if (value === true || value === null || value === 'null') {
			this.log(`==============LISTENER==END=================value:${value}`);
			return;
		}
		if (this.isAnaswer) {
			this.log(`A AS ANSWER this.isAnaswer:${this.isAnaswer}`);
			if (px === ANSWER) {
				this.log(`A px:${px}`);
				if (!this.isGetFirst) {
					this.setOnCandidates(async (candidates) => {
						await this.send(pxOFFER, candidates);
					});
					const answer = await this.makeAnswer(value);
					this.isGetFirst = true;
					this.log('==============LISTENER==answer=A================');
					this.log(answer);
					this.log('==============LISTENER==answer=B================');
					await this.send(pxOFFER, answer);
				} else if (!this.isExcangedCandidates) {
					const candidats = await this.setCandidates(JSON.parse(value));
					this.log('==============LISTENER==answer candidats=A================');
					this.log(candidats);
					this.isExcangedCandidates = true;
					this.log('==============LISTENER==answer candidats=B================');
				}
			}
		} else {
			this.log(`B AS OFFER this.isAnaswer:${this.isAnaswer}`);
			if (px === OFFER) {
				this.log(`B px:${px}/!this.isGetFirst:${!this.isGetFirst}`);
				if (!this.isGetFirst) {
					const candidates = await this.connect(value);
					this.log('==============LISTENER==candidates=A================');
					this.log(candidates);
					this.log('==============LISTENER==candidates=B================');
					this.isGetFirst = true;
					await this.send(pxANSWER, candidates);
				} else if (!this.isExcangedCandidates) {
					const candidats = await this.setCandidates(JSON.parse(value));
					this.log('==============LISTENER==offer candidats=A================');
					this.log(candidats);
					this.isExcangedCandidates = true;
					this.log('==============LISTENER==offer candidats=B================');
				}
			}
		}
	}
	async makeOffer() {
		return await this.w.getOfferSdp();
	}
	async makeAnswer(sdpInput) {
		const sdp = typeof sdpInput === 'string' ? JSON.parse(sdpInput) : sdpInput;
		this.log(`makeAnswer sdpInput:${sdpInput}`);
		sdp.sdp = sdp.sdp.replace(/\\r\\n/g, '\r\n');
		this.log(sdp);
		return await this.w.answer(sdp.sdp);
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
		this.w.setCandidates(candidatesInput);
	}
	setOnMessage(elm) {
		this.w.setOnMessage((msg) => {
			this.log(`setOnMessage msg:${msg}`);
			elm.textContent = msg;
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
	convertObjToQueryParam(data) {
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
