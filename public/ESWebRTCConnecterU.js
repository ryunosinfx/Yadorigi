const te = new TextEncoder('utf-8');
const td = new TextDecoder('utf-8');
const OFFER = '_OFFER';
const ANSWER = '_ANSWER';
const SleepMs = 100;
const WAIT = 'wait';
const WAIT_AUTO_INTERVAL = 1000 * 20;
const WAIT_AUTO_INTERVAL_2 = 1000 * 20 + Math.random() * 5000;
const HASH_SCRATCH_COUNT = 12201;
const NULL_ARR = [null];
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
		onReciveCallBack = (targetDeviceName, msg) => {
			console.log(`targetDeviceName:${targetDeviceName},msg:${msg}`);
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
	close(targetSignalingHash) {
		this.#i.close(targetSignalingHash);
	}
	sendBigMessage(targetSignalingHash, name, type, ab) {
		this.#i.sendBigMessage(targetSignalingHash, name, type, ab);
	}
	broadcastBigMessage(msg) {
		this.#i.broadcastMessage(msg);
	}
	sendMessage(targetSignalingHash, msg) {
		this.#i.sendMessage(targetSignalingHash, msg);
	}
	broadcastMessage(msg) {
		this.#i.broadcastMessage(msg);
	}
	request(targetSignalingHash, msg) {
		this.#i.request(targetSignalingHash, msg);
	}
	setOnRequest(
		cb = async (key, type, data) => {
			console.log(`key:${data}/type:${type}`, data);
			return data;
		}
	) {
		this.#i.setOnRequest(cb);
	}
}
///////////////////////////
class ESWebRTCConnecterUnit {
	constructor(
		logger = console,
		onReciveCallBack = (targetDeviceName, msg) => {
			console.log(`targetDeviceName:${targetDeviceName},msg:${msg}`);
		}
	) {
		this.l = logger;
		this.l.log('ESWebRTCConnecterU');
		this.cache = {};
		this.threads = [];
		this.confs = {};
		this.connections = {};
		this.onReciveCallBack = onReciveCallBack;
		this.ESBigSendDataAdoptor = new ESBigSendDataAdoptor(onReciveCallBack);
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
		this.l.log(`ESWebRTCConnecterU INIT END this.hash:${this.hash} deviceName:${deviceName}`);
		this.requestMap = new Map();
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
			await sleep(WAIT_AUTO_INTERVAL / 5);
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
				const diff = now - row.expire;
				if (diff > 10000) {
					console.log(`■ESWebRTCConnecterU startWaitAutoConnect continue diff:${diff}`, row);
					continue;
				}
				const v = row.value && typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
				console.log(`■ESWebRTCConnecterU startWaitAutoConnect diff:${diff} ${v.hash !== this.signalingHash}/${v.hash.indexOf(this.signalingHash)}`, v);
				if (v.hash !== this.signalingHash && v.hash.indexOf(this.signalingHash) !== 0) {
					console.log(`■ESWebRTCConnecterU startWaitAutoConnect sendWaitNotify group:${groupHash}/${this.group}`);
					await this.onCatchAnother(groupHash, now, v.hash, this.group); //v.hash===targetSignalingHash
					break;
				}
			}
		}
	}
	async onCatchAnother(groupHash, now, targetSignalingHash, group) {
		const conf = await this.getConf(groupHash, targetSignalingHash, group);
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
			await sleep(Math.floor(Math.random() * 500) + 750);
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
		await this.post(group, { msg: WAIT, hash: this.signalingHash, expire: Date.now() + WAIT_AUTO_INTERVAL_2 + WAIT_AUTO_INTERVAL / 5 }, WAIT);
	}
	async sendWaitNotify(group, targetSignalingHash) {
		await this.post(group, { msg: WAIT, hash: `/${this.signalingHash}/${targetSignalingHash}`, expire: Date.now() + WAIT_AUTO_INTERVAL_2 + WAIT_AUTO_INTERVAL / 5 }, WAIT);
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
		await sleep(Math.floor(Math.random() * 1000) + 2500);
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
	async getConKey(groupHash, signalingHash) {
		const obj = await this.decrypt(signalingHash);
		return [JSON.stringify([groupHash, obj.deviceName]), obj];
	}
	async getConf(groupHash, targetSignalingHash, group) {
		const [k, objT] = await this.getConKey(groupHash, targetSignalingHash);
		const [s] = await this.getConKey(groupHash, this.signalingHash);
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
			conf.w.setOnMessage(async (msg) => {
				console.log('conf.w.setOnMessage((msg):', msg);
				const dU8A = this.ESBigSendDataAdoptor.getBigSendDataResFormat(targetDeviceName, msg);
				if (dU8A) {
					console.log('conf.w.setOnMessage((msg):to onReciveBigDataResponse', msg);
					await this.onReciveBigDataResponse(conf, targetDeviceName, dU8A);
				} else if (await this.ESBigSendDataAdoptor.isBigSendData(msg, targetDeviceName)) {
					console.log('conf.w.setOnMessage((msg):to onReciveBigData', msg);
					await this.onReciveBigData(conf, targetDeviceName, msg, targetSignalingHash);
				} else {
					console.log('conf.w.setOnMessage((msg):to onReciveCallBack', msg);
					this.onReciveCallBack(targetDeviceName, msg);
				}
			});
			conf.w.setOnOpen((event) => {
				this.l.log(`############★###OPEN！###★###############targetDeviceName:${targetDeviceName}`, objT);
				this.onOpenFunc(event, group, targetSignalingHash, targetDeviceName);
				conf.isStop = true;
			});
			conf.w.setOnClose((event) => {
				this.l.log(`############☆###CLOSE###☆###############targetDeviceName:${targetDeviceName}`);
				this.onCloseFunc(event, group, targetSignalingHash, targetDeviceName);
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
		this.l.log(
			`ESWebRTCConnecterU==============LISTENER==RECEIVE=A================px:${px}/${px === ANSWER}//value:${value}/conf.isAnaswer:${
				conf.isAnaswer
			}/!conf.isGetFirst:${!conf.isGetFirst}/conf.isExcangedCandidates:${conf.isExcangedCandidates}`
		);
		if (conf.w.isOpend || conf.isStop || value === true || value === null || value === 'null') {
			this.l.log(`ESWebRTCConnecterU==============LISTENER==END=================value:${value}/conf.isStop:${conf.isStop}`);
			return;
		}
		if (conf.isAnaswer && px === ANSWER) {
			this.l.log(`ESWebRTCConnecterU A AS ANSWER conf.isAnaswer:${conf.isAnaswer} A px:${px} conf.isGetFirst:${conf.isGetFirst}`);
			if (!conf.isGetFirst) {
				const answer = await this.answer(conf, value);
				this.l.log(`ESWebRTCConnecterU==============LISTENER==answer=A================typeof answer :${typeof answer}`, answer);
				await this.post(conf.pxOt, await this.encrypt(answer, conf.nowHashKey));
				conf.isGetFirst = true;
				console.warn('★★ANSWER conf.isGetFirst = true;');
			} else if (!conf.isExcangedCandidates) {
				conf.isExcangedCandidates = true;
				const candidats = conf.w.setCandidates(typeof value === 'string' ? JSON.parse(value) : value, Date.now());
				this.l.log('ESWebRTCConnecterU==============LISTENER==answer candidats=A================', candidats);
			}
		} else if (!conf.isAnaswer && px === OFFER) {
			this.l.log(`ESWebRTCConnecterU B AS OFFER conf.isAnaswer:${conf.isAnaswer}/B px:${px}/!conf.isGetFirst:${!conf.isGetFirst}`);
			if (!conf.isGetFirst) {
				const candidates = await this.connect(conf, value);
				this.l.log('ESWebRTCConnecterU==============LISTENER==make offer candidates=A================', candidates);
				conf.isGetFirst = true;
				console.warn('★★★OFFER conf.isGetFirst = true;');
				await this.post(conf.pxAt, await this.encrypt(candidates, conf.nowHashKey));
			} else if (!conf.isExcangedCandidates) {
				conf.isExcangedCandidates = true;
				const candidats = value ? conf.w.setCandidates(typeof value === 'string' ? JSON.parse(value) : value, Date.now()) : null;
				this.l.log('ESWebRTCConnecterU==============LISTENER==set offer candidats=A================', candidats);
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
				await sleep(Math.floor(Math.random() * 200) + 50);
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
	async close(targetSignalingHash) {
		const conf = await this.getConf(this.groupHash, targetSignalingHash, this.group);
		if (conf && conf.w && conf.w.isOpend) {
			conf.w.close();
			this.resetConf(conf);
		}
	}
	/////////////////////////////////////////////////////////////////
	async sendBigMessage(targetSignalingHash, name, type, ab) {
		return await this.ESBigSendDataAdoptor.sendBidData(await this.getConf(this.groupHash, targetSignalingHash, this.group), name, type, ab, this.l);
	}
	async broadcastBigMessage(name, type, ab) {
		const promises = [];
		for (const key in this.confs) {
			promises.push(this.ESBigSendDataAdoptor.sendBidData(this.confs[key], name, type, ab, this.l));
		}
		return Promise.all(promises);
	}
	/////////////////////////////////////////////////////////////////
	async sendMessage(targetSignalingHash, msg) {
		ESWebRTCConnecterUtil.sendOnDC(await this.getConf(this.groupHash, targetSignalingHash, this.group), msg, this.l);
	}
	broadcastMessage(msg) {
		for (const key in this.confs) {
			ESWebRTCConnecterUtil.sendOnDC(this.confs[key], msg, this.l);
		}
	}
	async onReciveBigData(conf, targetDeviceName, msg, targetSignalingHash) {
		const { files, isComple } = await this.ESBigSendDataAdoptor.recieveBigSendData(conf, msg);
		if (isComple) {
			for (const file of files) {
				if (this.ESBigSendDataAdoptor.isRequest(file)) {
					return await this.onRequestData(targetDeviceName, file, targetSignalingHash);
				}
				if (this.ESBigSendDataAdoptor.isResponse(file)) {
					return await this.onRespons(targetDeviceName, file);
				}
			}
			this.onReciveCallBack(targetDeviceName, files);
		}
		return [];
	}
	async onRequestData(targetDeviceName, file, targetSignalingHash) {
		const types = file.type.split('/');
		const PQ = types.shift();
		const hash = types.pop();
		const typeMain = types.join('/');
		const { key, type, result } = await this.onRequest(targetDeviceName, file.name, typeMain, file.data);
		const newType = [PQ, type, hash].join('/');
		return await this.sendBigMessage(targetSignalingHash, key, this.ESBigSendDataAdoptor.convertTypeToResopnce(newType), result);
	}
	async onReciveBigDataResponse(conf, targetDeviceName, dU8A) {
		if (this.ESBigSendDataAdoptor.isComplBigSendDataRes(dU8A)) {
			return await this.ESBigSendDataAdoptor.recieveBigSendDataCompl(dU8A);
		} else if (this.ESBigSendDataAdoptor.isBigSendDataResponse(dU8A)) {
			return await this.ESBigSendDataAdoptor.recieveBigSendDataRes(dU8A);
		}
		return null;
	}
	/////////////////////////////////////////////////////////////////
	request(targetSignalingHash, key, msg) {
		const func = async (resolve) => {
			const ab = typeof msg === 'string' ? B64U.stringToU8A(msg) : msg.byteLength ? msg : msg.buffer ? msg.buffer : B64U.stringToU8A(JSON.stringify(msg));
			const hash = await Hasher.digest(Date.now() + Math.random() + targetSignalingHash + key + SALT);
			const type = `${ESBigSendUtil.REQUEST_HEADER + (msg.byteLength ? 'arraybuffer' : msg.buffer ? 'typedarray' : typeof msg)}/${hash}`; // PorQ/type/hash
			this.requestMap.set(hash, resolve);
			setTimeout(() => {
				this.requestMap.delete(hash);
				resolve(ESBigSendUtil.TIME_OUT);
			}, ESBigSendUtil.MAX_WAIT_MS);
			return await this.ESBigSendDataAdoptor.sendBidData(await this.getConf(this.groupHash, targetSignalingHash, this.group), key, type, ab, this.l);
		};
		return new Promise(func);
	}
	onRespons(targetDeviceName, file) {
		const types = file.type.split('/');
		// const PQ = types.shift();
		const hash = types.pop();
		const resolve = this.requestMap.get(hash);
		const typeMain = types.join('/');
		resolve(targetDeviceName, file.name, typeMain, file.data);
	}
	async setOnRequest(
		cb = async (key, type, data) => {
			console.log(`key:${data}/type:${type}`, data);
			return data;
		}
	) {
		this.onRequest = cb;
	}
}
class ESBigSendDataAdoptor {
	constructor(onComplCB) {
		this.sendMap = new Map();
		this.recieveMap = new Map();
		this.onComplCB = onComplCB;
	}
	isRequest(file) {
		return file && file.type && file.type.indexOf(ESBigSendUtil.isRequest) === 0 && file.type.split('/').length >= 3 && B64U.isBase64(file.type.split('/').pop());
	}
	isResponse(file) {
		return file && file.type && file.type.indexOf(ESBigSendUtil.isResponse) === 0 && file.type.split('/').length >= 3 && B64U.isBase64(file.type.split('/').pop());
	}
	convertTypeToResopnce(type) {
		return type ? (type.indexOf(ESBigSendUtil.isResponse) === 0 ? type.replace(ESBigSendUtil.isRequest, ESBigSendUtil.isResponse) : type) : type;
	}

	async isBigSendData(data, deviceName) {
		console.log(`isBigSendData A deviceName:${deviceName}`, data);
		const MIN = ESBigSendUtil.MIN;
		if (typeof data === 'string' || !data.byteLength || data.byteLength < MIN || !data.buffer || (data.buffer && data.buffer.byteLength < MIN)) {
			return false; // 1,256/8=32byte,data
		}
		const dnU8A = B64U.stringToU8A(deviceName);
		console.log(`isBigSendData B deviceName:${deviceName}`, dnU8A);
		const f1 = dnU8A[0];
		const dU8A = Array.isArray(data) ? (data.byteLength && data.byteLength > 0 ? new Uint8Array(data) : data.buffer ? new Uint8Array(data.buffer) : NULL_ARR) : NULL_ARR;
		console.log(`isBigSendData C data.byteLength:${data.byteLength}`, dU8A);
		if (f1 !== dU8A[0]) {
			return false;
		}
		const hashU8A = dU8A.subarray(1, 33);
		const dataU8A = dU8A.subarray(34); //index,signAll,data
		return B64U.ab2Base64(hashU8A) === (await Hasher.digest(dataU8A));
	}
	async sendBidData(conf, name, type, ab, logger = console) {
		logger.log(`ESBigSendDataAdoptor sendBidData sendMessage msg:${ab}`);
		if (!conf || !conf.w || !conf.w.isOpend) {
			return;
		}
		const w = conf.w;
		const deviceName = conf.targetDeviceName;
		const dataU8A = new Uint8Array(ab);
		const { dasendDataAb, signatureU8A, count, f1 } = await ESBigSendUtil.makeBigSendDataMeta(dataU8A, deviceName, type, name);
		const signatureB64 = B64U.ab2Base64(signatureU8A.buffer);
		const sendQueue = new Map();
		this.sendMap.set(signatureB64, { sendQueue, type, name, byteLength: ab.byteLength, status: ESBigSendUtil });
		const promises = [];
		const result = await this.snedTransactional(w, f1, -1, dasendDataAb);
		if (result === ESBigSendUtil.COMPLE) {
			return true;
		}
		let offset = 0;
		for (let i = 0; i < count; i++) {
			const end = i === count - 1 ? ab.byteLength : offset + ESBigSendUtil.SIZE;
			const partU8A = dataU8A.subarray(offset, end);
			promises.push(this.sendTranApart(w, partU8A, f1, signatureU8A, i, sendQueue));
			offset = offset += ESBigSendUtil.SIZE;
		}
		await Promise.all(promises);
	}
	async sendTranApart(w, partU8A, f1, signatureU8A, index, sendQueue) {
		const i = new Int32Array(1).fill(index);
		const resHashB64 = B64U.ab2Base64(await ESBigSendUtil.makeResAb(f1, partU8A, i.buffer, signatureU8A));
		const sendAb = await ESBigSendUtil.makeBigSendData(partU8A, f1, signatureU8A, index);
		let isSendSuccsess = false;
		let isComple = false;
		while (isSendSuccsess === false) {
			const result = await this.snedTransactional(w, sendAb, resHashB64, sendQueue, index);
			if (result === ESBigSendUtil.COMPLE) {
				isSendSuccsess = true;
				isComple = true;
			}
			if (result === ESBigSendUtil.OK) {
				isSendSuccsess = true;
			}
		}
		return isComple;
	}
	snedTransactional(w, ab, resHashB64 = '', sendQueue = new Map(), index) {
		const timer = sendQueue.has(resHashB64) ? sendQueue.get(resHashB64).timer : null;
		clearTimeout(timer);
		return new Promise((resolve) => {
			const timer = setTimeout(() => {
				resolve(ESBigSendUtil.TIME_OUT);
			}, ESBigSendUtil.WAIT_MS);
			sendQueue.set(resHashB64, { index, timer });
			w.send(ab);
		});
	}
	getBigSendDataResFormat(data, deviceName) {
		const MIN = ESBigSendUtil.MIN;
		if (typeof data === 'string' || !data.byteLength || data.byteLength < MIN || !data.buffer || (data.buffer && data.buffer.byteLength < MIN)) {
			return false; // 1,256/8=32byte,data(index4byte,data)
		}
		const dnU8A = B64U.stringToU8A(deviceName);
		const f1 = dnU8A[0];
		const dU8A = Array.isArray(data) && !data.byteLength && data.byteLength > 0 ? new Uint8Array(data) : new Uint8Array(data.buffer);
		if (f1 !== dU8A[0]) {
			return false;
		}
		// const hashB64 = B64U.ab2Base64(dU8A.subarray(1, 33).buffer);
		const index = new Int32Array(dU8A.subarray(33, 37).buffer)[0];
		const signatureB64 = B64U.ab2Base64(dU8A.subarray(37, 69).buffer);
		const metaInf = this.sendMap.get(signatureB64);
		return metaInf && metaInf.sendQueue && metaInf.byteLength <= index && index >= -1 ? dU8A : null;
	}
	isBigSendDataResponse(dU8A) {
		const hashB64 = B64U.ab2Base64(dU8A.subarray(1, 33).buffer);
		const index = new Int32Array(dU8A.subarray(33, 37).buffer)[0];
		const signatureB64 = B64U.ab2Base64(dU8A.subarray(37, 69).buffer);
		const metaInf = this.sendMap.get(signatureB64);
		return metaInf && metaInf.sendQueue && metaInf.sendQueue.get(hashB64) === index;
	}
	isComplBigSendDataRes(dU8A) {
		const signatureB64 = B64U.ab2Base64(dU8A.subarray(37, 69).buffer);
		const index = new Int32Array(dU8A.subarray(33, 37).buffer)[0];
		const status = dU8A[dU8A.length - 1];
		const metaInf = this.sendMap.get(signatureB64);
		return metaInf.byteLength === index && ESBigSendUtil.STATUS[status] === ESBigSendUtil.COMPLE;
	}
	async recieveBigSendData(conf, dataAb) {
		if (!conf || !conf.w || !conf.w.isOpend) {
			return;
		}
		const w = conf.w;
		const dataU8A = new Uint8Array(dataAb);
		const dataBodyU8A = dataU8A.subarray(34); //index,signAll,data
		const index = new Int32Array(dataBodyU8A.subarray(0, 4).buffer)[0]; //index,signAll,data
		const signatureB64 = B64U.ab2Base64(dataBodyU8A.subarray(4, 36).buffer); //index,signAll,data
		const dU8A = dataBodyU8A.subarray(36); //index,signAll,data
		let map = this.recieveMap.get(signatureB64);
		if (!map) {
			map = { m: [{ type: null, name: null }], signature: null, byteLength: null, count: null, counter: null, data: {}, full: null, compleU64: null };
			this.recieveMap.set(signatureB64, map);
		}
		if (index === -1) {
			const meta = JSON.parse(B64U.u8aToString(dU8A));
			let isRegisterd = false;
			for (const m of map.m) {
				if (m.name === meta.name && m.type === meta.type) {
					isRegisterd = true;
					break;
				}
			}
			if (!isRegisterd) {
				map.m.push({ name: meta.name, type: meta.type });
				map.signature = meta.signature;
				map.byteLength = meta.byteLength;
				map.count = meta.count;
				const compCount = new Uint8Array(Math.ceil(meta.count / 8));
				map.counter = compCount;
				const compKey = new Uint8Array(compCount);
				compKey.fill(255);
				compKey[compCount - 1] = meta.count % 8;
				map.compleU64 = B64U.ab2Base64(compKey);
			}
		} else {
			const counterIndex = Math.floor(index / 8);
			map.counter[counterIndex] = map.counter[counterIndex] | (1 << index % 8);
			map.data[index] = dU8A;
		}
		const isComple = map.compleU64 === B64U.ab2Base64(map.counter);
		const res = await ESBigSendUtil.makeBigSendDataResponse(dataAb);
		w.send(res);
		if (isComple) {
			const { united, isValid } = ESBigSendUtil.unitData(map);
			const res = await ESBigSendUtil.makeBigSendDataResponse(dataAb, map.count + 1, isValid ? ESBigSendUtil.COMPLE : ESBigSendUtil.NG);
			w.send(res);
			if (isValid) {
				const files = [];
				for (const m of map.m) {
					files.push({ name: m.name, type: m.type, data: united });
				}
				return { files, isComple };
			}
		}
		return { res, isComple };
	}
	async recieveBigSendDataRes(dU8A) {
		const lastIndex = dU8A.length - 1;
		const status = ESBigSendUtil.STATUS[dU8A[lastIndex]];
		dU8A[lastIndex] = ESBigSendUtil.STATUS.indexOf(ESBigSendUtil.OK);
		const hresHshB64 = B64U.ab2Base64(dU8A);
		const signatureB64 = B64U.ab2Base64(dU8A.subarray(37, 69).buffer);
		const metaInf = this.sendMap.get(signatureB64);
		const resolve = metaInf && metaInf.sendQueue && metaInf.sendQueue.get(hresHshB64);
		if (typeof resolve === 'function') {
			resolve(status);
			return true;
		}
		return false;
	}
	async recieveBigSendDataCompl(dU8A) {
		const signatureB64 = B64U.ab2Base64(dU8A.subarray(37, 69).buffer);
		const metaInf = this.sendMap.get(signatureB64);
		if (metaInf.sendQueue) {
			for (const [key, value] of metaInf.sendQueue) {
				if (typeof value === 'function') {
					value(ESBigSendUtil.COMPLE);
				}
				metaInf.sendQueue.delete(key);
			}
		}
	}
	//////////////////////////////////////////////////
}
class ESBigSendUtil {
	static SIZE = 8000;
	static MIN = 1 + 32 + 4 + 32 + 1;
	static WAIT_MS = 30000;
	static MAX_WAIT_MS = 60000;
	static REQUEST_HEADER = 'Q/';
	static RESPONSE_HEADER = 'P/';
	static OK = 'OK';
	static NG = 'NG';
	static COMPLE = 'COMPLE';
	static SENDING = 'SENDING';
	static TIME_OUT = 'TIME_OUT';
	static STATUS = [ESBigSendUtil.TIME_OUT, ESBigSendUtil.OK, ESBigSendUtil.NG, ESBigSendUtil.COMPLE, ESBigSendUtil.SENDING];
	static async makeBigSendDataMeta(dataU8A, deviceName, type, name) {
		const dnU8A = B64U.stringToU8A(deviceName);
		const f1 = new Uint8Array(1).fill(dnU8A[0]);
		const byteLength = dataU8A.buffer.byteLength;
		const count = Math.ceil(byteLength / ESBigSendUtil.SIZE);
		const I1 = new Int32Array(1).fill(-1);
		const signature = await Hasher.digest(dataU8A); //BASE64
		const json = JSON.stringify({ type, name, signature, byteLength, count });
		const signatureU8A = new Uint8Array(B64U.base64ToAB(signature));
		const dataU8a = B64U.joinU8as([new Uint8Array(I1.buffer), signatureU8A, B64U.stringToU8A(json)]);
		const signAb = await Hasher.digest(dataU8a, 1, undefined, true);
		return { dasendDataAb: B64U.joinU8as([f1, new Uint8Array(signAb), dataU8a]).buffer, signatureU8A, count, f1 }; //d,signature,[index,signAll,data]
	}
	static async makeBigSendData(sendDataU8A, f1, signatureU8A, index) {
		const I1 = new Int32Array(1).fill(index);
		const dataU8a = B64U.joinU8as([new Uint8Array(I1.buffer), signatureU8A, sendDataU8A]);
		const signAb = await Hasher.digest(dataU8a, 1, undefined, true);
		return B64U.joinU8as([f1, new Uint8Array(signAb), dataU8a]).buffer; //d,signature,[index,signAll,data]
	}
	static async makeBigSendDataResponse(data, index = -1, flg = ESBigSendUtil.OK) {
		const dU8A = Array.isArray(data) && !data.byteLength && data.byteLength > 0 ? new Uint8Array(data) : new Uint8Array(data.buffer);
		const f1 = new Uint8Array(1);
		f1[0] = dU8A[0];
		const indexU8A = index > 0 ? new Uint8Array(new Int32Array(1).fill(index).buffer) : dU8A.subarray(33, 37);
		const signatureU8A = dU8A.subarray(37, 69);
		const flag = new Uint8Array(1).fill(ESBigSendUtil.STATUS.indexOf(flg));
		return await ESBigSendUtil.makeResAb(f1, dU8A, indexU8A.buffer, signatureU8A, flag);
	}
	static async makeResAb(f1, dU8A, indexAb, signatureU8A, flag = new Uint8Array(1).fill(ESBigSendUtil.STATUS.indexOf(ESBigSendUtil.OK))) {
		const hashU8A = new Uint8Array(await Hasher.digest(dU8A, 1, undefined, true)); //ab
		return B64U.joinU8as([f1, hashU8A, new Uint8Array(indexAb), signatureU8A, flag]);
	}
	static async unitData(map) {
		if (map.full) {
			return { united: map.full, isValid: true };
		}
		const keys = Object.keys(map);
		keys.sort();
		const united = new Uint8Array(map.byteLength);
		const dataU8a = map.data;
		let offset = 0;
		for (const index of keys) {
			const u8a = dataU8a[index];
			united.set(u8a, offset);
			delete dataU8a[index];
			offset += u8a.byteLength;
		}
		keys.splice(0, keys.length);
		const isValid = (await Hasher.digest(united)) === map.signature;
		map.full = isValid ? united : null;
		return { united, isValid };
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
				await sleep(Math.floor(Math.random() * 400) + 200);
				resolve(candidates);
			});
		});
	}
	async setOnCandidates(func) {
		let count = 1;
		while (count < 100 && !this.isOpend) {
			await sleep(Math.floor(Math.random() * 20 * count) + 100);
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
				dc.send(
					`WebRTCPeer dataChannel Hello World! OPEN SUCCESS! dc.id:${dc.id} label:${dc.label} ordered:${dc.ordered} protocol:${dc.protocol} binaryType:${dc.binaryType} maxPacketLifeTime:${dc.maxPacketLifeTime} maxRetransmits:${dc.maxRetransmits} negotiated:${dc.negotiated}`
				);
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
		this.peer = await this.prepareNewConnection(true);
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
			console.log('WebRTCPeer makeAnswer createAnswer() succsess in promise answer:', answer);
			await this.peer.setLocalDescription(answer);
			console.log(`WebRTCPeer makeAnswer setLocalDescription() succsess in promise${this.peer.localDescription}`);
			return this.peer.localDescription;
		} catch (e) {
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
				console.warn(`WebRTCPeer setOfferAndAswer this.peer ${this.peer} offer:`, offer);
				await this.peer.setRemoteDescription(offer);
				console.log(`WebRTCPeer setOfferAndAswer setRemoteDescription(answer) succsess in promise name:${this.name}`);
				const ans = await this.makeAnswer();
				console.warn(`WebRTCPeer setOfferAndAswer ans ${ans}`);
				if (this.candidates.length < 1 || ans) {
					return ans;
				}
				await sleep(Math.floor(Math.random() * 1000) + 1000);
			}
		} catch (e) {
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
	send(msg, binaryType = 'blob') {
		const dc = this.dataChannel;
		if (!dc) {
			return false;
		}
		dc.binaryType = binaryType;
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
		let result = message.buffer ? new Uint8Array(message.buffer) : te.encode(message);
		for (let i = 0; i < stretchCount; i++) {
			result = await window.crypto.subtle.digest(algo, result);
		}
		return isAB ? result : B64U.ab2Base64Url(result);
	}
}
class B64U {
	static isSameAb(abA, abB) {
		return B64U.ab2Base64(abA) === B64U.ab2Base64(abB);
	}
	static isBase64(str = '') {
		return str % 4 === 0 && /[+/=0-9a-zA-Z]+/.test(str);
	}
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
	static joinU8as(u8as) {
		let sumLength = 0;
		const u8asCount = u8as.length;
		for (let i = 0; i < u8asCount; i++) {
			sumLength += u8as[i].byteLength;
		}
		const united = new Uint8Array(sumLength);
		let offset = 0;
		for (let i = 0; i < u8asCount; i++) {
			const u8a = u8as[i];
			united.set(u8a, offset);
			offset += u8a.byteLength;
		}
		return united;
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
		const passphrase = B64U.stringToU8A(passphraseText).buffer;
		const digest = await Hasher.digest(passphrase, 100, 'SHA-256', true);
		const keyMaterial = await crypto.subtle.importKey('raw', digest, { name: 'PBKDF2' }, false, ['deriveKey']);
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
		const encryptedDataAB = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, inputU8a.buffer);
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
		const saltU8A = typeof salt === 'string' ? new Uint8Array(B64U.base64UrlToAB(salt)) : salt;
		const [key] = typeof passphraseTextOrKey === 'string' ? await Cryptor.getKey(passphraseTextOrKey, saltU8A) : { passphraseTextOrKey };
		return key;
	}
	static async decodeAES256GCM(encryptedResultStr, passphraseTextOrKey) {
		const [encryptedDataBase64Url, invocationPart, salt] = encryptedResultStr.split(',');
		const iv = new Uint8Array(B64U.base64UrlToAB(invocationPart));
		const encryptedData = B64U.base64UrlToAB(encryptedDataBase64Url);
		const key = await Cryptor.loadKey(passphraseTextOrKey, salt);
		let decryptedData = null;
		try {
			decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedData);
		} catch (e) {
			ef(e);
			return null;
		}
		return new Uint8Array(decryptedData);
	}
}
