const te = new TextEncoder('utf-8');
const td = new TextDecoder('utf-8');
const OFFER = '_OFFER';
const ANSWER = '_ANSWER';
const SleepMs = 100;
const WAIT = 'wait';
const WAIT_AUTO_INTERVAL = 1000 * 20;
const HASH_SCRATCH_COUNT = 12201;
const contentType = 'application/x-www-form-urlencoded';
const SALT =
	'メロスは激怒した。必ず、かの邪智暴虐じゃちぼうぎゃくの王を除かなければならぬと決意した。メロスには政治がわからぬ。メロスは、村の牧人である。笛を吹き、羊と遊んで暮して来た。けれども邪悪に対しては、人一倍に敏感であった。';
///////////////////////////
const ef = (e, id = '', logger = null) => {
	console.warn(`${id} ${e.message}`);
	console.warn(e.stack);
	if (logger && logger.log && logger !== console) {
		logger.log(`${id} ${e.message}`);
		logger.log(e.stack);
	}
};
function getEF(id, logger) {
	return (e) => {
		ef(e, id, logger);
	};
}
function sleep(ms = SleepMs) {
	return new Promise((r) => {
		setTimeout(() => {
			r();
		}, ms);
	});
}
function decode(data, id, logger) {
	try {
		const obj = typeof data === 'string' ? JSON.parse(data) : data;
		const result = obj && obj.message ? obj.message : null;
		return result;
	} catch (e) {
		ef(e, id, logger);
	}
	return null;
}
async function mkHash(seeds = [location.origin, navigator.userAgent, Date.now()], stretch = Math.floor(Math.random() * 100) + (Date.now() % 100) + 1) {
	return await Hasher.digest(JSON.stringify(seeds), stretch);
}
async function dummyCallBack(event, group, target) {
	return event + group + target;
}
///////////////////////////
export class ESWebRTCConnecterU {
	#i = null;
	constructor(
		logger = console,
		onReciveCallBack = (hash, msg) => {
			console.log(`hash:${hash},msg:${msg}`);
		}
	) {
		this.#i = new ESWebRTCConnecterUnit(logger, onReciveCallBack);
	}
	async init(url, group, passwd, deviceName) {
		await this.#i.init(url, group, passwd, deviceName);
	}
	setOnOpenFunc(fn = dummyCallBack) {
		this.#i.onOpenFunc = fn;
	}
	setOnCloseFunc(fn = dummyCallBack) {
		this.#i.onCloseFunc = fn;
	}
	async startWaitAutoConnect() {
		await this.#i.startWaitAutoConnect();
	}
	async stopWaitAutoConnect() {
		await this.#i.stopWaitAutoConnect();
	}
	closeAll() {
		this.#i.closeAll();
	}
	close(hash) {
		this.#i.close(hash);
	}
	sendMessage(hash, msg) {
		this.#i.sendMessage(hash, msg);
	}
	broadcastMessage(msg) {
		this.#i.broadcastMessage(msg);
	}
}
///////////////////////////
class ESWebRTCConnecterUnit {
	constructor(
		logger = console,
		onReciveCallBack = (hash, msg) => {
			console.log(`hash:${hash},msg:${msg}`);
		}
	) {
		this.l = logger;
		this.l.log('ESWebRTCConnecterU');
		this.cache = {};
		this.threads = [];
		this.confs = {};
		this.connections = {};
		this.onReciveCallBack = onReciveCallBack;
	}
	async init(url, group, passwd, deviceName, salt = SALT) {
		this.l.log('ESWebRTCConnecterU INIT START');
		this.url = url;
		this.group = group;
		this.passwd = passwd;
		this.deviceName = deviceName;
		this.hash = await mkHash([url, group, passwd, deviceName], HASH_SCRATCH_COUNT);
		this.singHash = await mkHash([url, group, passwd, salt], HASH_SCRATCH_COUNT);
		this.groupHash = await mkHash([url, group, passwd, salt], HASH_SCRATCH_COUNT);
		this.nowHash = await mkHash([Date.now(), url, group, passwd, deviceName, salt], HASH_SCRATCH_COUNT);
		this.signalingHash = await this.encrypt({ hash: this.nowHash, group, deviceName });
		this.l.log(`ESWebRTCConnecterU INIT END this.hash:${this.hash}`);
	}
	async encrypt(obj, key = this.singHash) {
		return await Cryptor.encodeStrAES256GCM(JSON.stringify(obj), key);
	}
	async decrypt(encryptedStr, key = this.singHash) {
		try {
			const decryptStr = await Cryptor.decodeAES256GCMasStr(encryptedStr, key);
			return JSON.parse(decryptStr);
		} catch (e) {
			ef(e, encryptedStr, this.l);
		}
		return null;
	}
	async startWaitAutoConnect() {
		await this.inited;
		this.isStopAuto = false;
		let count = 3;
		this.isWaiting = false;
		let isFirst = true;
		while (this.isStopAuto === false) {
			const groupHash = this.groupHash;
			await sleep(WAIT_AUTO_INTERVAL / 4);
			if (count === 0 || isFirst) {
				await this.sendWait(groupHash);
				isFirst = false;
				count = 3;
			} else {
				count--;
			}
			const list = await this.getWaitList(groupHash);
			if (!Array.isArray(list)) {
				continue;
			}
			this.l.log(list);
			const now = Date.now();
			for (const row of list) {
				if (row.expire < now) {
					continue;
				}
				const v = row.value && typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
				console.log(row);
				if (v.hash !== this.signalingHash && v.hash.indexOf(this.signalingHash) < 0) {
					console.log(`ESWebRTCConnecterU sendWaitNotify group:${groupHash}/${this.group}`);
					await this.onCatchAnother(groupHash, now, v.hash);
					break;
				}
			}
		}
	}
	async onCatchAnother(groupHash, now, targetSignalingHash) {
		const conf = await this.getConf(groupHash, targetSignalingHash);
		if (this.isOpend(conf)) {
			return;
		}
		await this.sendWaitNotify(groupHash, targetSignalingHash);
		const l = await this.getWaitList(groupHash);
		if (!Array.isArray(l) || l.length < 1) {
			return;
		}
		let isHotStamdby = false;
		const newTargetList = [];
		const len = this.signalingHash.length;
		const tlen = targetSignalingHash.length;
		const a = len + tlen;
		for (const row of l) {
			const v = row.value && typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
			if (row.expire < now || v.hash.length < a) {
				continue;
			}
			newTargetList.push(JSON.stringify([row.expire, v.hash]));
		}
		if (newTargetList.length < 1) {
			return;
		}
		newTargetList.sort();
		newTargetList.reverse();
		let isOffer = false;
		let rowCount = 0;
		for (const row of newTargetList) {
			const hash = JSON.parse(row)[1];
			if (hash.indexOf(this.signalingHash) === 1 && hash.indexOf(targetSignalingHash) >= tlen) {
				isOffer = true;
				rowCount++;
			}
			if (hash.indexOf(this.signalingHash) >= len && hash.indexOf(targetSignalingHash) === 1) {
				isOffer = false;
				rowCount++;
			}
			if (rowCount >= 2) {
				break;
			}
		}
		this.startNegosiation(conf).catch(getEF(now, this.l));
		await sleep(100);
		if (isOffer) {
			await sleep(1000);
			this.offer(conf).catch(getEF(now, this.l));
		}
		setTimeout(() => {
			isHotStamdby = false;
			this.isStop = true;
		}, WAIT_AUTO_INTERVAL);
		isHotStamdby = true;
		while (isHotStamdby) {
			await sleep(100);
		}
		this.isStop = false;
	}
	async sendWait(group) {
		await this.post(group, { msg: WAIT, hash: this.signalingHash, expire: Date.now() + WAIT_AUTO_INTERVAL }, WAIT);
	}
	async sendWaitNotify(group, targetSignalingHash) {
		await this.post(group, { msg: WAIT, hash: `/${this.signalingHash}/${targetSignalingHash}`, expire: Date.now() + WAIT_AUTO_INTERVAL }, WAIT);
	}
	async getWaitList(group) {
		const data = await this.load(group, WAIT);
		const obj = data ? JSON.parse(data) : null;
		return obj ? obj.message : null;
	}
	isOpend(conf) {
		const isOpen = conf.w.isOpened();
		this.l.log(`◆◆ESWebRTCConnecterU isOpend conf.w.isOpend:${isOpen}:${conf.target}`);
		return isOpen;
	}
	async startNegosiation(conf) {
		conf.isStop = false;
		setTimeout(ESWebRTCConnecterUtil.getStopFunc(conf), WAIT_AUTO_INTERVAL);
		while (conf.isStop === false && this.isStopAuto === false) {
			setTimeout(() => {
				if (conf.isAnaswer) {
					return;
				} else if (this.threads.length < 4) {
					this.threads.push(1);
				} else {
					return;
				}
				this.load(conf.pxOs).then(async (data) => {
					const cacheKey = await Hasher.digest(conf.pxOs + data);
					this.threads.pop(1);
					const d = decode(data, conf.id, this.l);
					// this.l.log('ESWebRTCConnecterU=ANSWER====data:', data);
					if (d && !conf.cache[cacheKey]) {
						conf.cache[cacheKey] = 1;
						this.listener(conf, OFFER, d);
					}
				});
			}, SleepMs);
			setTimeout(() => {
				if (!conf.isAnaswer) {
					return;
				} else if (this.threads.length < 4) {
					this.threads.push(1);
				} else {
					return;
				}
				this.load(conf.pxAs).then(async (data) => {
					const cacheKey = await Hasher.digest(conf.pxAs + data);
					this.threads.pop(1);
					const d = decode(data, conf.id, this.l);
					// this.l.log('ESWebRTCConnecterU=OFFER====data:', data);
					if (d && !conf.cache[cacheKey]) {
						conf.cache[cacheKey] = 1;
						this.listener(conf, ANSWER, d);
					}
				});
			}, SleepMs);
			await sleep();
		}
		this.resetConf(conf);
	}
	async stopWaitAutoConnect() {
		for (const key in this.confs) {
			this.confs[key].isStop = true;
		}
		this.isStopAuto = true;
		for (const key in this.confs) {
			this.confs[key].isStop = true;
		}
		await sleep(2000);
		for (const key in this.confs) {
			this.resetConf(this.confs[key]);
		}
	}
	async offer(conf) {
		conf.isAnaswer = false;
		const offer = await conf.w.getOfferSdp();
		this.l.log('ESWebRTCConnecterU setOnRecieve OFFER post offer:', offer);
		await this.post(conf.pxAt, await this.encrypt(offer, conf.nowHashKey));
	}
	async post(group, dataObj, cmd = 'g') {
		const now = Date.now();
		const data = await GASAccessor.postToGAS(this.url, { group, cmd, data: typeof dataObj !== 'string' ? JSON.stringify(dataObj) : dataObj });
		this.l.log(`ESWebRTCConnecterU================post=================${group}/${cmd} d:${Date.now() - now} data:`, data);
	}
	async load(group, cmd = 'g') {
		const now = Date.now();
		const key = `${now}_${Math.floor(Math.random() * 1000)}`;
		const data = await GASAccessor.getTextGAS(this.url, { group, cmd });
		this.l.log(`ESWebRTCConnecterU==${key}==============load========${group}/${cmd} ========${Date.now() - now} data:`, data);
		return data;
	}
	async getConKey(group, signalingHash) {
		const obj = await this.decrypt(signalingHash);
		return [JSON.stringify([group, obj.deviceName]), obj];
	}
	async getConf(group, targetSignalingHash) {
		const [k, objT] = await this.getConKey(group, targetSignalingHash);
		const [s] = await this.getConKey(group, this.signalingHash);
		let conf = this.confs[k];
		const targetDeviceName = objT.deviceName;
		if (!conf) {
			conf = {
				targetDeviceName,
				isAnaswer: true,
				isGetFirst: false,
				isExcangedCandidates: false,
				pxAt: k + ANSWER,
				pxOt: k + OFFER,
				pxAs: s + ANSWER,
				pxOs: s + OFFER,
				isStop: false,
				cache: {},
				id: `${Date.now()} ${this.deviceName}`,
			};
			conf.w = new WebRTCConnecter(this.l);
			conf.w.setOnMessage((msg) => {
				this.onReciveCallBack(targetDeviceName, msg);
			});
			conf.w.setOnOpen((event) => {
				this.l.log(`############★###OPEN！###★###############targetDeviceName:${targetDeviceName}`);
				this.onOpenFunc(event, group, targetDeviceName);
				conf.isStop = true;
			});
			conf.w.setOnClose((event) => {
				this.l.log(`############☆###CLOSE###☆###############targetDeviceName:${targetDeviceName}`);
				this.onCloseFunc(event, group, targetDeviceName);
				conf.isStop = false;
			});
			this.confs[k] = conf;
		}
		conf.nowHashKey = objT.nowHash;
		return conf;
	}
	resetConf(conf) {
		conf.isAnaswer = true;
		conf.isGetFirst = false;
		conf.isExcangedCandidates = false;
		conf.isStop = false;
		const ckeys = Object.keys(conf.cache);
		for (const key of ckeys) {
			delete conf.cache[key];
		}
	}
	async listener(conf, px, valueEnclipted) {
		const value = await this.decrypt(valueEnclipted, this.nowHash);
		this.l.log('ESWebRTCConnecterU==============LISTENER==RECEIVE=A================');
		this.l.log(`ESWebRTCConnecterU getLisntenrB event px:${px}/${px === ANSWER}//alue:${value}`);
		this.l.log(
			`ESWebRTCConnecterU==============LISTENER==RECEIVE=B================conf.isAnaswer:${conf.isAnaswer}/!conf.isGetFirst:${!conf.isGetFirst}/conf.isExcangedCandidates:${conf.isExcangedCandidates}`
		);
		if (conf.w.isOpend || conf.isStop || value === true || value === null || value === 'null') {
			this.l.log(`ESWebRTCConnecterU==============LISTENER==END=================value:${value}/conf.isStop:${conf.isStop}`);
			return;
		}
		if (conf.isAnaswer && px === ANSWER) {
			this.l.log(`ESWebRTCConnecterU A AS ANSWER conf.isAnaswer:${conf.isAnaswer} A px:${px} conf.isGetFirst:${conf.isGetFirst}`);
			if (!conf.isGetFirst) {
				const answer = await this.answer(conf, value);
				this.l.log(`ESWebRTCConnecterU==============LISTENER==answer=A================typeof answer :${typeof answer}`);
				this.l.log(answer);
				if (!answer) {
					this.l.log(`ESWebRTCConnecterU==============LISTENER==answer=0================value:${value}`);
				}
				this.l.log('ESWebRTCConnecterU==============LISTENER==answer=B================');
				await this.post(conf.pxOt, await this.encrypt(answer, conf.nowHashKey));
				conf.isGetFirst = true;
				console.warn('★★ANSWER conf.isGetFirst = true;');
			} else if (!conf.isExcangedCandidates) {
				conf.isExcangedCandidates = true;
				const candidats = conf.w.setCandidates(JSON.parse(value), Date.now());
				this.l.log('ESWebRTCConnecterU==============LISTENER==answer candidats=A================');
				this.l.log(candidats);
				this.l.log('ESWebRTCConnecterU==============LISTENER==answer candidats=B================');
			}
		} else if (!conf.isAnaswer && px === OFFER) {
			this.l.log(`ESWebRTCConnecterU B AS OFFER conf.isAnaswer:${conf.isAnaswer}/B px:${px}/!conf.isGetFirst:${!conf.isGetFirst}`);
			if (!conf.isGetFirst) {
				const candidates = await this.connect(conf, value);
				this.l.log('ESWebRTCConnecterU==============LISTENER==make offer candidates=A================');
				this.l.log(candidates);
				this.l.log('ESWebRTCConnecterU==============LISTENER==make offer candidates=B================');
				conf.isGetFirst = true;
				console.warn('★★★OFFER conf.isGetFirst = true;');
				await this.post(conf.pxAt, await this.encrypt(candidates, conf.nowHashKey));
			} else if (!conf.isExcangedCandidates) {
				conf.isExcangedCandidates = true;
				const candidats = value ? conf.w.setCandidates(JSON.parse(value), Date.now()) : null;
				this.l.log('ESWebRTCConnecterU==============LISTENER==set offer candidats=A================');
				this.l.log(candidats);
				this.l.log('ESWebRTCConnecterU==============LISTENER==set offer candidats=B================');
			}
		}
	}
	async answer(conf, offerSdpInput) {
		setTimeout(async () => {
			if (conf.isStop) {
				return;
			}
			const candidates = await conf.w.connectAnswer();
			while (!conf.isGetFirst) {
				await sleep(200);
			}
			await this.post(conf.pxOt, await this.encrypt(candidates, conf.nowHashKey));
		});
		if (conf.isStop) {
			return;
		}
		return await conf.w.answer(ESWebRTCConnecterUtil.parseSdp(offerSdpInput, this.l));
	}
	connect(conf, sdpInput) {
		if (conf.isStop) {
			return;
		}
		const func = async (resolve) => {
			if (conf.isStop) {
				return;
			}
			return await conf.w.connect(ESWebRTCConnecterUtil.parseSdp(sdpInput, this.l), (candidates) => {
				resolve(candidates);
			});
		};
		return new Promise(func);
	}
	/////////////////////////////////////////////////////////////////
	closeAll() {
		for (const key in this.confs) {
			const conf = this.confs[key];
			if (conf && conf.w && conf.w.isOpend) {
				conf.w.close();
				this.resetConf(conf);
			}
		}
	}
	async close(hash) {
		const conf = await this.getConf(this.group, hash);
		if (conf && conf.w && conf.w.isOpend) {
			conf.w.close();
			this.resetConf(conf);
		}
	}
	/////////////////////////////////////////////////////////////////
	async sendMessage(hash, msg) {
		ESWebRTCConnecterUtil.sendOnDC(await this.getConf(this.group, hash), msg, this.l);
	}
	broadcastMessage(msg) {
		for (const key in this.confs) {
			ESWebRTCConnecterUtil.sendOnDC(this.confs[key], msg, this.l);
		}
	}
}
class ESWebRTCConnecterUtil {
	static getStopFunc(conf) {
		return () => {
			conf.isStop = true;
		};
	}
	static sendOnDC(conf, msg, logger = console) {
		logger.log(`ESWebRTCConnecterUtil sendMessage msg:${msg}`);
		if (conf && conf.w && conf.w.isOpend) {
			conf.w.send(msg);
		}
	}
	static parseSdp(sdpInput, logger = console) {
		const sdp = typeof sdpInput === 'string' ? JSON.parse(sdpInput) : sdpInput;
		logger.log(`ESWebRTCConnecterU parseSdp ${typeof sdpInput}/sdpInput:${sdpInput}`);
		if (!sdp.sdp) {
			return null;
		}
		sdp.sdp = sdp.sdp.replace(/\\r\\n/g, '\r\n');
		logger.log(sdp);
		return sdp.sdp;
	}
}
class GASAccessor {
	//////Fetcher Core///////////////////////////////////////////////
	static convertObjToQueryParam(data) {
		return data && typeof data === 'object'
			? Object.keys(data)
					.map((key) => `${key}=${encodeURIComponent(data[key])}`)
					.join('&')
			: data;
	}
	static async getTextGAS(path, data = {}) {
		console.log('GASAccessor----getTextGAS--A------------');
		const r = await fetch(`${path}?${GASAccessor.convertObjToQueryParam(data)}`, {
			method: 'GET',
			redirect: 'follow',
			Accept: 'application/json',
			'Content-Type': contentType,
		});
		return await r.text();
	}
	static async postToGAS(path, data) {
		console.warn('GASAccessor----postToGAS--A------------', data);
		const r = await fetch(`${path}`, {
			method: 'POST',
			redirect: 'follow',
			Accept: 'application/json',
			'Content-Type': contentType,
			body: `${GASAccessor.convertObjToQueryParam(data)}`,
			headers: {
				'Content-Type': contentType,
			},
		});
		return await r.text();
	}
}

class WebRTCConnecter {
	constructor(
		logger = console,
		stunServer = [
			{
				urls: 'stun:stun.l.google.com:19302',
			},
		]
	) {
		this.WebRTCPeerOffer = new WebRTCPeer('OFFER', stunServer);
		this.WebRTCPeerAnswer = new WebRTCPeer('ANSWER', stunServer);
		this.WebRTCPeer = null;
		this.onOpenCallBack = () => {};
		this.onCloseCallBack = () => {};
		this.onMessageCallBack = () => {};
		this.onErrorCallBack = () => {};
		this.isOpend = false;
		this.l = logger;
		this.inited = this.init();
	}
	async init() {
		this.l.log('-WebRTCConnecter-init--0----------WebRTCConnecter--------------------------------------');
		this.close();
		const self = this;
		this.WebRTCPeerOffer.onOpen = (event) => {
			self.onOpenCallBack(event);
			self.WebRTCPeer = self.WebRTCPeerOffer;
			self.l.log('-WebRTCConnecter-onOpen--1-WebRTCPeerOffer---------WebRTCConnecter--------------------------------------');
			self.WebRTCPeer.onClose = self.onCloseCallBack;
			self.WebRTCPeer.onMessage = self.onMessageCallBack;
			self.WebRTCPeer.onError = self.onErrorCallBack;
			self.isOpend = true;
		};
		this.WebRTCPeerAnswer.onOpen = (event) => {
			self.onOpenCallBack(event);
			self.WebRTCPeer = self.WebRTCPeerAnswer;
			self.l.log('-WebRTCConnecter-onOpen--1-WebRTCPeerAnswer---------WebRTCPeerAnswer--------------------------------------');
			self.WebRTCPeer.onClose = self.onCloseCallBack;
			self.WebRTCPeer.onMessage = self.onMessageCallBack;
			self.WebRTCPeer.onError = self.onErrorCallBack;
			self.isOpend = true;
		};
		this.l.log(`-WebRTCConnecter-init--3----------WebRTCConnecter--------------------------------------WebRTCPeerOffer:${this.WebRTCPeerOffer.name}`);
		this.l.log(`-WebRTCConnecter-init--4----------WebRTCConnecter--------------------------------------WebRTCPeerAnswer:${this.WebRTCPeerAnswer.name}`);
		return true;
	}

	async getOfferSdp() {
		return (await this.inited) ? await this.WebRTCPeerOffer.makeOffer() : '';
	}
	setOnOpen(callback) {
		this.onOpenCallBack = (event) => {
			console.warn(`-WebRTCConnecter-onOpenCallBack--1------------------------------------------------event:${event}`);
			callback(event);
		};
	}
	setOnClose(callback) {
		this.onCloseCallBack = (event) => {
			console.warn(`-WebRTCConnecter-onCloseCallBack--1------------------------------------------------event:${event}`);
			callback(event);
		};
	}
	setOnMessage(callback) {
		this.onMessageCallBack = (msg) => {
			console.warn(`-WebRTCConnecter-onMessageCallBack--1------------------------------------------------msg:${msg}`);
			callback(msg);
		};
	}
	setOnError(callback) {
		this.onErrorCallBack = (error) => {
			console.warn(`-WebRTCConnecter-onErrorCallBack--1------------------------------------------------error:${error}`);
			callback(error);
		};
	}
	send(msg) {
		return this.WebRTCPeer.send(msg);
	}
	async answer(sdp) {
		if (!sdp) {
			return null;
		} else if (await this.inited) {
			return await this.WebRTCPeerAnswer.setOfferAndAswer(sdp);
		}
	}
	async connect(sdp, func) {
		if (!sdp) {
			return null;
		}
		const result = await this.WebRTCPeerOffer.setAnswer(sdp).catch(getEF(Date.now(), this.l));
		this.WebRTCPeer = this.WebRTCPeerOffer;
		if (result && func) {
			this.setOnCandidates(func);
		}
		return result;
	}
	connectAnswer() {
		return new Promise((resolve) => {
			this.WebRTCPeer = this.WebRTCPeerAnswer;
			this.setOnCandidates(async (candidates) => {
				await sleep(500);
				resolve(candidates);
			});
		});
	}
	async setOnCandidates(func) {
		let count = 1;
		while (count < 100 && !this.isOpend) {
			await sleep(20 * count);
			count += 1;
			if (!this.WebRTCPeer) {
				continue;
			}
			const candidates = this.WebRTCPeer.getCandidates();
			console.log(`WebRTCConnecter setOnCandidates count:${count}/candidates:${candidates}`);
			if (Array.isArray(candidates) && candidates.length > 0) {
				func(candidates);
				break;
			}
		}
	}
	setCandidates(candidatesInput) {
		const candidates = typeof candidatesInput === 'object' ? candidatesInput : JSON.parse(candidatesInput);
		return !Array.isArray(candidates) ? `setCandidates candidates:${candidates}` : this.WebRTCPeer.setCandidates(candidates);
	}
	close() {
		this.WebRTCPeerOffer.close();
		this.WebRTCPeerAnswer.close();
	}
	isOpened() {
		return this.WebRTCPeer ? this.WebRTCPeer.isOpened() : false;
	}
}
const addOption = { optional: [{ DtlsSrtpKeyAgreement: true }, { RtpDataChannels: true }] };
class WebRTCPeer {
	constructor(name, stunServers, logger = null) {
		this.name = name;
		this.peer = null;
		this.candidates = [];
		this.config = { iceServers: stunServers };
		this.l = logger;
		this.id = `${Date.now()} ${this.name}`;
		this.queue = [];
		this.isOpenDc = false;
	}
	prepareNewConnection(isWithDataChannel) {
		return new Promise((resolve, reject) => {
			console.warn('-WebRTCPeer-prepareNewConnection--0----------WebRTCPeer--------------------------------------');
			const peer = new RTCPeerConnection(this.config, addOption);
			console.warn('-WebRTCPeer-prepareNewConnection--1----------WebRTCPeer--------------------------------------');
			peer.ontrack = (evt) => {
				console.log(`-WebRTCPeer- peer.ontrack()vevt:${evt}`);
			};
			// peer.onaddstream = evt => {
			// 	console.log('-- peer.onaddstream()vevt:' + evt);
			// };
			peer.onremovestream = (evt) => {
				console.log(`-WebRTCPeer- peer.onremovestream()vevt:${evt}`);
			};
			peer.onicecandidate = (evt) => {
				if (evt.candidate) {
					// console.log(evt.candidate);
					this.candidates.push(evt.candidate);
				} else {
					console.log(`-WebRTCPeer--onicecandidate--- empty ice event peer.localDescription:${peer.localDescription}`);
				}
			};

			peer.onnegotiationneeded = async () => {
				try {
					console.log(`-WebRTCPeer1--onnegotiationneeded--------WebRTCPeer----createOffer() succsess in promise name:${this.name}`);
					const offer = await peer.createOffer();
					console.log(`-WebRTCPeer2--onnegotiationneeded--------WebRTCPeer----createOffer() succsess in promise;iceConnectionState;${peer.iceConnectionState}`);
					await peer.setLocalDescription(offer);
					console.log(`-WebRTCPeer3--onnegotiationneeded--------WebRTCPeer----setLocalDescription() succsess in promise;iceConnectionState${peer.iceConnectionState}`);
					resolve(peer);
				} catch (e) {
					reject(e);
					console.error(`WebRTCPeer setLocalDescription(offer) ERROR: ${e}`);
					ef(e, this.id, this.l);
				}
			};

			peer.oniceconnectionstatechange = () => {
				console.log(`WebRTCPeer ICE connection Status has changed to ${peer.iceConnectionState}`);
				switch (peer.iceConnectionState) {
					case 'closed':
					case 'failed':
						if (this.peer && this.isOpend) {
							this.close();
						}
						break;
					case 'disconnected':
						break;
				}
			};
			peer.ondatachannel = (evt) => {
				console.warn(`-WebRTCPeer-ondatachannel--1----------WebRTCPeer--------------------------------------evt:${evt}`);
				this.dataChannelSetup(evt.channel);
				console.warn(`-WebRTCPeer-ondatachannel--2----------WebRTCPeer--------------------------------------evt:${evt}`);
			};
			console.warn(`-WebRTCPeer-prepareNewConnection--2----------WebRTCPeer--------------------------------------isWithDataChannel:${isWithDataChannel}`);
			if (isWithDataChannel) {
				const dc = peer.createDataChannel(`chat${Date.now()}`);
				this.dataChannelSetup(dc);
			}
		});
	}
	onOpen(event) {
		console.log(`WebRTCPeer.onOpen is not Overrided name:${this.name}`);
		console.log(event);
	}
	onError(error) {
		console.log(`WebRTCPeer.onError is not Overrided name:${this.name}`);
		console.log(error);
	}
	onMessage(msg) {
		console.log(`WebRTCPeer.onMessage is not Overrided name:${this.name}`);
		console.log(msg);
	}
	onClose() {
		console.log(`WebRTCPeer.onClose is not Overrided name:${this.name}`);
		console.log('close');
	}
	dataChannelSetup(dc) {
		if (this.dataChannel && dc.id !== this.dataChannel.id && this.isOpenDc) {
			console.log(`WebRTCPeer The Data Channel be Closed. readyState:${this.dataChannel.readyState} /${dc.id} !== ${this.dataChannel.id}`);
			// this.dataChannel.close();
			// this.dataChannel = null;
		}
		dc.onerror = (error) => {
			console.error('WebRTCPeer Data Channel Error:', error);
			this.onError(error);
		};
		dc.onmessage = (event) => {
			console.log('WebRTCPeer Got Data Channel Message:', event.data);
			this.onMessage(event.data);
		};
		dc.onopen = (event) => {
			console.warn(event);
			if (!this.isOpenDc) {
				dc.send(`WebRTCPeer dataChannel Hello World! OPEN SUCCESS! dc.id:${dc.id}`);
				this.onOpen(event);
				this.isOpenDc = true;
			}
		};
		dc.onclose = () => {
			console.log('WebRTCPeer The Data Channel is Closed');
			this.onClose();
			dc.isOpen = false;
		};
		this.dataChannel = dc;
	}
	async makeOffer() {
		console.log('-WebRTCPeer-makeOffer--1----------WebRTCPeer--------------------------------------');
		this.peer = await this.prepareNewConnection(true);
		console.log('-WebRTCPeer-makeOffer--2----------WebRTCPeer--------------------------------------');
		return this.peer.localDescription;
	}
	async makeAnswer() {
		console.log('WebRTCPeer makeAnswer sending Answer. Creating remote session description...');
		if (!this.peer) {
			console.error('WebRTCPeer makeAnswer peerConnection NOT exist!');
			return;
		}
		try {
			const answer = await this.peer.createAnswer();
			console.log('WebRTCPeer makeAnswer createAnswer() succsess in promise');
			await this.peer.setLocalDescription(answer);
			console.log(`WebRTCPeer makeAnswer setLocalDescription() succsess in promise${this.peer.localDescription}`);
			return this.peer.localDescription;
		} catch (e) {
			console.error('WebRTCPeer makeAnswer ERROR: ', e);
			ef(e, this.id, this.l);
		}
	}
	async setOfferAndAswer(sdp) {
		console.warn(`WebRTCPeer setOfferAndAswer sdp ${sdp}`);
		console.warn(sdp);
		try {
			while (this.candidates.length < 1) {
				const offer = new RTCSessionDescription({
					type: 'offer',
					sdp: sdp,
				});
				if (this.peer) {
					console.error('WebRTCPeer setOfferAndAswer peerConnection alreay exist!');
				}
				this.peer = await this.prepareNewConnection(true);
				console.warn(`WebRTCPeer setOfferAndAswer this.peer ${this.peer}`);
				await this.peer.setRemoteDescription(offer);
				console.warn(`WebRTCPeer setOfferAndAswer offer ${offer}`);
				console.log(`WebRTCPeer setOfferAndAswer setRemoteDescription(answer) succsess in promise name:${this.name}`);
				const ans = await this.makeAnswer();
				console.warn(`WebRTCPeer setOfferAndAswer ans ${ans}`);
				if (this.candidates.length < 1 || ans) {
					return ans;
				}
				await sleep(Math.floor(Math.random() * 1000) + 1000);
			}
		} catch (e) {
			console.error('WebRTCPeer setRemoteDescription(offer) ERROR: ', e);
			ef(e, this.id, this.l);
		}
		return null;
	}
	async setAnswer(sdp) {
		const answer = new RTCSessionDescription({
			type: 'answer',
			sdp: typeof sdp === 'object' ? JSON.parse(sdp) : sdp,
		});
		if (!this.peer) {
			throw 'WebRTCPeer peerConnection NOT exist!';
		}
		await this.peer.setRemoteDescription(answer);
		console.log('WebRTCPeer setRemoteDescription(answer) succsess in promise');
		return true;
	}
	isOpened() {
		const dc = this.dataChannel;
		if (!dc) {
			return false;
		}
		let isOpend = false;
		switch (dc.readyState) {
			case 'connecting':
				isOpend = Date.now() - this.lastSend < 20000;
				break;
			case 'open':
				isOpend = true;
				this.lastSend = Date.now();
				break;
			case 'closing':
			case 'closed':
				isOpend = false;
				break;
		}
		return isOpend;
	}
	send(msg) {
		const dc = this.dataChannel;
		if (!dc) {
			return false;
		}
		switch (dc.readyState) {
			case 'connecting':
				console.log(`Connection not open; queueing: ${msg}`);
				this.queue.push(msg);
				break;
			case 'open':
				this.sendOnQueue();
				dc.send(msg);
				this.lastSend = Date.now();
				break;
			case 'closing':
				console.log(`Attempted to send message while closing: ${msg}`);
				this.queue.push(msg);
				break;
			case 'closed':
				console.warn('Error! Attempt to send while connection closed.');
				this.queue.push(msg);
				this.close();
				break;
		}
		return dc.readyState;
	}
	sendOnQueue() {
		const l = this.queue.length;
		for (let i = 0; i < l; i++) {
			this.dataChannel.send(this.queue.shift());
		}
	}
	close() {
		if (this.peer || this.dataChannel) {
			if (this.peer && this.peer.iceConnectionState !== 'closed') {
				this.peer.close();
				this.peer = null;
			}
			if (this.dataChannel && this.dataChannel.readyState !== 'closed') {
				this.dataChannel.close();
				this.dataChannel = null;
			}
			console.log('WebRTCPeer peerConnection is closed.');
		}
	}
	getCandidates() {
		return this.candidates;
	}
	setCandidates(candidates) {
		for (const candidate of candidates) {
			console.log('WebRTCPeer setCandidates candidate', candidate);
			this.peer.addIceCandidate(candidate).catch((e) => {
				ef(e, this.id, this.l);
			});
		}
		return 'setCandidates OK';
	}
}
//////Hash Core///////////////////////////////////////////////
export class Hasher {
	static async digest(message, stretchCount = 1, algo = 'SHA-256', isAB = false) {
		let result = te.encode(message);
		for (let i = 0; i < stretchCount; i++) {
			result = await window.crypto.subtle.digest(algo, result);
		}
		return isAB ? result : B64U.ab2Base64Url(result);
	}
}
class B64U {
	static stringToU8A(str) {
		return te.encode(str);
	}
	static u8aToString(u8a) {
		return td.decode(new Uint8Array(u8a.buffer));
	}
	static ab2Base64(abInput) {
		const ab = abInput.buffer ? abInput.buffer : abInput;
		return window.btoa(B64U.uint8Array2BinaryString(new Uint8Array(ab)));
	}
	static ab2Base64Url(abInput) {
		return B64U.toBase64Url(B64U.ab2Base64(abInput));
	}
	static base64ToAB(base64) {
		const bs = window.atob(base64);
		return B64U.binaryString2Uint8Array(bs);
	}
	static base64UrlToAB(base64url) {
		return B64U.base64ToAB(B64U.toBase64(base64url));
	}
	static toBase64Url(base64) {
		return base64 ? base64.split('+').join('-').split('/').join('_').split('=').join('') : base64;
	}
	static toBase64(base64Url) {
		const len = base64Url.length;
		const count = len % 4 > 0 ? 4 - (len % 4) : 0;
		let resultBase64 = base64Url.split('-').join('+').split('_').join('/');
		for (let i = 0; i < count; i++) {
			resultBase64 += '=';
		}
		return resultBase64;
	}
	static uint8Array2BinaryString(u8a) {
		const retList = [];
		for (const e of u8a) {
			retList.push(String.fromCharCode(e));
		}
		return retList.join('');
	}
	static binaryString2Uint8Array(binaryString) {
		const rawLength = binaryString.length;
		const array = new Uint8Array(new ArrayBuffer(rawLength));
		for (let i = 0; i < rawLength; i++) {
			array[i] = binaryString.charCodeAt(i);
		}
		return array;
	}
}
class Cryptor {
	static async getKey(passphraseText, salt) {
		console.log(`Cryptor getKey salt:${salt}/passphraseText:${passphraseText}`);
		const passphrase = B64U.stringToU8A(passphraseText).buffer;
		const digest = await Hasher.digest(passphrase, 100, 'SHA-256', true);
		console.log(`Cryptor getKey digest:${digest}`);
		const keyMaterial = await crypto.subtle.importKey('raw', digest, { name: 'PBKDF2' }, false, ['deriveKey']);
		console.log(`Cryptor getKey keyMaterial:${keyMaterial}`);
		const key = await crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt,
				iterations: 100000,
				hash: 'SHA-256',
			},
			keyMaterial,
			{ name: 'AES-GCM', length: 256 },
			false,
			['encrypt', 'decrypt']
		);
		console.log(`key:${key}`);
		return [key, salt];
	}
	static getSalt(saltInput, isAB) {
		return saltInput ? (isAB ? new Uint8Array(saltInput) : B64U.stringToU8A(saltInput)) : crypto.getRandomValues(new Uint8Array(16));
	}
	static async importKeyAESGCM(keyArrayBuffer, usages = ['encrypt', 'decrypt']) {
		return await crypto.subtle.importKey('raw', keyArrayBuffer, { name: 'AES-GCM' }, true, usages);
	}
	static getFixedField() {
		return crypto.getRandomValues(new Uint8Array(12)); // 96bitをUint8Arrayで表すため、96 / 8 = 12が桁数となる。
	}
	static getInvocationField() {
		return crypto.getRandomValues(new Uint32Array(1));
	}
	static secureMathRandom() {
		return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295; // 0から1の間の範囲に調整するためにUInt32の最大値(2^32 -1)で割る
	}
	static async encodeStrAES256GCM(inputStr, passphraseTextOrKey) {
		return await Cryptor.encodeAES256GCM(B64U.stringToU8A(inputStr), passphraseTextOrKey);
	}
	static async encodeAES256GCM(inputU8a, passphraseTextOrKey, saltInput = null, isAB) {
		const salt = Cryptor.getSalt(saltInput, isAB);
		const key = await Cryptor.loadKey(passphraseTextOrKey, salt);
		const fixedPart = Cryptor.getFixedField();
		const invocationPart = Cryptor.getInvocationField();
		const iv = Uint8Array.from([...fixedPart, ...new Uint8Array(invocationPart.buffer)]);
		console.log(`encodeAES256GCM 0 inputU8a:${inputU8a}`, iv);
		const encryptedDataAB = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, inputU8a.buffer);
		console.log(`encodeAES256GCM 1 encryptedDataAB:${encryptedDataAB}`);
		console.log(`encodeAES256GCM 2 iv${B64U.ab2Base64Url(iv)}/${iv.byteLength}`);
		console.log(`encodeAES256GCM 3 salt${B64U.ab2Base64Url(salt)}/${salt.byteLength}`);
		console.log(`encodeAES256GCM 5 encryptedDataAB:${B64U.ab2Base64Url(encryptedDataAB)}`);
		return [
			B64U.ab2Base64Url(encryptedDataAB), // 暗号化されたデータには、必ず初期ベクトルの変動部とパスワードのsaltを添付して返す。
			B64U.ab2Base64Url(iv.buffer),
			B64U.ab2Base64Url(salt.buffer),
		].join(',');
	}
	static async decodeAES256GCMasStr(encryptedResultStr, passphraseTextOrKey) {
		return B64U.u8aToString(await Cryptor.decodeAES256GCM(encryptedResultStr, passphraseTextOrKey));
	}
	static async loadKey(passphraseTextOrKey, salt) {
		console.log(`loadKey passphraseTextOrKey:${passphraseTextOrKey}/ salt:${salt}`);
		const saltU8A = typeof salt === 'string' ? new Uint8Array(B64U.base64UrlToAB(salt)) : salt;
		const [key] = typeof passphraseTextOrKey === 'string' ? await Cryptor.getKey(passphraseTextOrKey, saltU8A) : { passphraseTextOrKey };
		return key;
	}
	static async decodeAES256GCM(encryptedResultStr, passphraseTextOrKey) {
		const [encryptedDataBase64Url, invocationPart, salt] = encryptedResultStr.split(',');
		console.log(`encryptedDataBase64Url.length:${encryptedDataBase64Url.length}/${encryptedDataBase64Url}`);
		console.log(`decodeAES256GCM 1 salt:${salt}`);
		const iv = new Uint8Array(B64U.base64UrlToAB(invocationPart));
		console.log(`decodeAES256GCM 2 iv:${iv}`, iv);
		const encryptedData = B64U.base64UrlToAB(encryptedDataBase64Url);
		console.log(`decodeAES256GCM 3 encryptedData:${encryptedData}`);
		const key = await Cryptor.loadKey(passphraseTextOrKey, salt);
		console.log(`decodeAES256GCM 4 key:${key}`);
		let decryptedData = null;
		try {
			decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedData);
		} catch (e) {
			ef(e);
			return null;
		}
		console.log(`decodeAES256GCM 7 decryptedData:${decryptedData}/${B64U.ab2Base64Url(decryptedData)}`);
		console.log(`decodeAES256GCM 8 decryptedData:${decryptedData}/${B64U.u8aToString(new Uint8Array(decryptedData))}`);
		return new Uint8Array(decryptedData);
	}
}
