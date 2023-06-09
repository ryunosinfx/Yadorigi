const te = new TextEncoder('utf-8');
const td = new TextDecoder('utf-8');
const OFFER = '_OFFER';
const ANSWER = '_ANSWER';
const SleepMs = 100;
const WAIT = 'wait';
const WAIT_AUTO_INTERVAL = 1000 * 20;
const WAIT_AUTO_INTERVAL_2 = 1000 * 10 + Math.random() * 15000;
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
async function mkHash(
	seeds = [location.origin, navigator.userAgent, Date.now()],
	stretch = Math.floor(Math.random() * 100) + (Date.now() % 100) + 1
) {
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
			console.log(`ESWebRTCConnecterU targetDeviceName:${targetDeviceName},msg:${msg}`);
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
		this.#i.broadcastBigMessage(msg);
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
	tranTest(logger, name, type, ab) {
		const func = async (resolve) => {
			const i = new ESWebRTCConnecterUnit(logger, (targetDeviceName, msg) => {
				console.log('tranTest ESWebRTCConnecterUnit onReciveCallBack msg:', msg);
				const resAb = msg.ab;
				console.log('tranTest ESWebRTCConnecterUnit onReciveCallBack resAb:', resAb);
				if (targetDeviceName === 'test' && B64U.ab2Base64(resAb) === B64U.ab2Base64(ab)) {
					resolve('OK');
				}
			});
			await i.init('', 'test', 'test', 'test');
			i.request('test', name, ab);
		};
		return new Promise(func);
	}
}
///////////////////////////
class ESWebRTCConnecterUnit {
	constructor(
		logger = console,
		onReciveCallBack = (targetDeviceName, msg) => {
			console.log(`ESWebRTCConnecterUnit targetDeviceName:${targetDeviceName},msg:${msg}`);
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
			if (!groupHash) {
				continue;
			}
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
				console.log(
					`■ESWebRTCConnecterU startWaitAutoConnect diff:${diff} ${
						v.hash !== this.signalingHash
					}/${v.hash.indexOf(this.signalingHash)}`,
					v
				);
				if (v.hash !== this.signalingHash && v.hash.indexOf(this.signalingHash) !== 0) {
					console.log(
						`■ESWebRTCConnecterU startWaitAutoConnect sendWaitNotify group:${groupHash}/${this.group}`
					);
					await this.onCatchAnother(groupHash, now, v.hash, this.group); //v.hash===targetSignalingHash
					break;
				}
			}
		}
	}
	async onCatchAnother(groupHash, now, hash, group) {
		const hashSplit = hash.split('/');
		console.log(`■ESWebRTCConnecterU onCatchAnother hashSplit group:${hash}`, hashSplit);
		const targetSignalingHash =
			hash.indexOf(this.signalingHash) < 0
				? hash
				: hashSplit[1] !== this.signalingHash
				? hashSplit[1]
				: hashSplit[2];
		const conf = await this.getConf(groupHash, targetSignalingHash, group);
		if (!conf || this.isOpend(conf)) {
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
	async sendWait(groupHash) {
		await this.post(
			groupHash,
			{ msg: WAIT, hash: this.signalingHash, expire: Date.now() + WAIT_AUTO_INTERVAL_2 + WAIT_AUTO_INTERVAL / 5 },
			WAIT
		);
	}
	async sendWaitNotify(groupHash, targetSignalingHash) {
		await this.post(
			groupHash,
			{
				msg: WAIT,
				hash: `/${this.signalingHash}/${targetSignalingHash}`,
				expire: Date.now() + WAIT_AUTO_INTERVAL_2 + WAIT_AUTO_INTERVAL / 5,
			},
			WAIT
		);
	}
	async getWaitList(groupHash) {
		const data = await this.load(groupHash, WAIT);
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
		const data = await GASAccessor.postToGAS(this.url, {
			group,
			cmd,
			data: typeof dataObj !== 'string' ? JSON.stringify(dataObj) : dataObj,
		});
		this.l.log(
			`ESWebRTCConnecterU================post=================${group}/${cmd} d:${Date.now() - now} data:`,
			data
		);
	}
	async load(group, cmd = 'g') {
		const now = Date.now();
		const key = `${now}_${Math.floor(Math.random() * 1000)}`;
		const data = await GASAccessor.getTextGAS(this.url, { group, cmd });
		this.l.log(
			`ESWebRTCConnecterU==${key}==============load========${group}/${cmd} ========${Date.now() - now} data:`,
			data
		);
		return data;
	}
	async getConKey(groupHash, signalingHash) {
		const obj = signalingHash === 'test' ? { deviceName: 'test' } : await this.decrypt(signalingHash);
		return [JSON.stringify([groupHash, obj ? obj.deviceName : null]), obj];
	}
	async getConf(groupHash, targetSignalingHash, group) {
		const [k, objT] = await this.getConKey(groupHash, targetSignalingHash);
		if (!objT) {
			return null;
		}
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
			conf.w = new WebRTCConnecter(this.l, targetSignalingHash === 'test');
			conf.w.setOnMessage(async (msg) => {
				console.log('conf.w.setOnMessage((msg):', msg);
				await this.onMessageByConf(conf, targetDeviceName, targetSignalingHash, msg);
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
	async onMessageByConf(conf, targetDeviceName, targetSignalingHash, msg) {
		const ab =
			msg instanceof Blob
				? await B64U.blobToAb(msg)
				: msg.buffer && msg.buffer.byteLength
				? msg.buffer
				: msg.byteLength
				? msg
				: null;
		const dU8A = this.ESBigSendDataAdoptor.getBigSendDataResFormat(targetDeviceName, ab);
		if (dU8A) {
			console.log('☆onMessageByConf A conf.w.setOnMessage((msg):to onReciveBigDataResponse dU8A', dU8A);
			await this.onReciveBigDataResponse(conf, targetDeviceName, dU8A);
		} else if (await this.ESBigSendDataAdoptor.isBigSendData(ab, targetDeviceName)) {
			console.log('☆onMessageByConf B conf.w.setOnMessage((msg):to onReciveBigData ab', ab);
			await this.onReciveBigData(conf, targetDeviceName, ab, targetSignalingHash);
		} else {
			console.log('☆onMessageByConf C conf.w.setOnMessage((msg):to onReciveCallBack', msg);
			this.onReciveCallBack(targetDeviceName, { ab });
		}
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
			`ESWebRTCConnecterU==============LISTENER==RECEIVE=A================px:${px}/${
				px === ANSWER
			}//value:${value}/conf.isAnaswer:${
				conf.isAnaswer
			}/!conf.isGetFirst:${!conf.isGetFirst}/conf.isExcangedCandidates:${conf.isExcangedCandidates}`
		);
		if (conf.w.isOpend || conf.isStop || value === true || value === null || value === 'null') {
			this.l.log(
				`ESWebRTCConnecterU==============LISTENER==END=================value:${value}/conf.isStop:${conf.isStop}`
			);
			return;
		}
		if (conf.isAnaswer && px === ANSWER) {
			this.l.log(
				`ESWebRTCConnecterU A AS ANSWER conf.isAnaswer:${conf.isAnaswer} A px:${px} conf.isGetFirst:${conf.isGetFirst}`
			);
			if (!conf.isGetFirst) {
				const answer = await this.answer(conf, value);
				this.l.log(
					`ESWebRTCConnecterU==============LISTENER==answer=A================typeof answer :${typeof answer}`,
					answer
				);
				await this.post(conf.pxOt, await this.encrypt(answer, conf.nowHashKey));
				conf.isGetFirst = true;
				console.warn('★★ANSWER conf.isGetFirst = true;');
			} else if (!conf.isExcangedCandidates) {
				conf.isExcangedCandidates = true;
				const candidats = conf.w.setCandidates(
					typeof value === 'string' ? JSON.parse(value) : value,
					Date.now()
				);
				this.l.log('ESWebRTCConnecterU==============LISTENER==answer candidats=A================', candidats);
			}
		} else if (!conf.isAnaswer && px === OFFER) {
			this.l.log(
				`ESWebRTCConnecterU B AS OFFER conf.isAnaswer:${
					conf.isAnaswer
				}/B px:${px}/!conf.isGetFirst:${!conf.isGetFirst}`
			);
			if (!conf.isGetFirst) {
				const candidates = await this.connect(conf, value);
				this.l.log(
					'ESWebRTCConnecterU==============LISTENER==make offer candidates=A================',
					candidates
				);
				conf.isGetFirst = true;
				console.warn('★★★OFFER conf.isGetFirst = true;');
				await this.post(conf.pxAt, await this.encrypt(candidates, conf.nowHashKey));
			} else if (!conf.isExcangedCandidates) {
				conf.isExcangedCandidates = true;
				const candidats = value
					? conf.w.setCandidates(typeof value === 'string' ? JSON.parse(value) : value, Date.now())
					: null;
				this.l.log(
					'ESWebRTCConnecterU==============LISTENER==set offer candidats=A================',
					candidats
				);
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
		return await this.ESBigSendDataAdoptor.sendBigData(
			await this.getConf(this.groupHash, targetSignalingHash, this.group),
			name,
			type,
			ab,
			this.l
		);
	}
	async broadcastBigMessage(name, type, ab) {
		const promises = [];
		for (const key in this.confs) {
			promises.push(this.ESBigSendDataAdoptor.sendBigData(this.confs[key], name, type, ab, this.l));
		}
		return Promise.all(promises);
	}
	/////////////////////////////////////////////////////////////////
	async sendMessage(targetSignalingHash, msg) {
		ESWebRTCConnecterUtil.sendOnDC(
			await this.getConf(this.groupHash, targetSignalingHash, this.group),
			msg,
			this.l
		);
	}
	broadcastMessage(msg) {
		for (const key in this.confs) {
			ESWebRTCConnecterUtil.sendOnDC(this.confs[key], msg, this.l);
		}
	}
	async onReciveBigData(conf, targetDeviceName, msg, targetSignalingHash) {
		const { files, isComple, res } = await this.ESBigSendDataAdoptor.recieveBigSendData(conf, msg);
		console.log(
			`☆ ESWebRTCConnecterU onReciveBigData A Array.isArray(files):${Array.isArray(files)}/isComple:${isComple}`,
			res
		);
		if (isComple && Array.isArray(files)) {
			console.log(
				`☆ ESWebRTCConnecterU onReciveBigData B files.byteLength:${files.byteLength}/isComple:${isComple}`
			);
			for (const file of files) {
				console.log(`☆ ESWebRTCConnecterU onReciveBigData C file${file}/isComple:${isComple}`, file);
				if (this.ESBigSendDataAdoptor.isRequest(file)) {
					console.log(`☆ ESWebRTCConnecterU onReciveBigData D file${file}/isComple:${isComple}`);
					return await this.onRequestData(targetDeviceName, file, targetSignalingHash);
				} else if (this.ESBigSendDataAdoptor.isResponse(file)) {
					console.log(`☆ ESWebRTCConnecterU onReciveBigData E file${file}/isComple:${isComple}`);
					return await this.onRespons(targetDeviceName, file);
				}
				console.log(`☆ ESWebRTCConnecterU onReciveBigData F file${file}/isComple:${isComple}`);
			}
			console.log(`☆ ESWebRTCConnecterU onReciveBigData G files:${files}/isComple:${isComple}`);
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
		return await this.sendBigMessage(
			targetSignalingHash,
			key,
			this.ESBigSendDataAdoptor.convertTypeToResopnce(newType),
			result
		);
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
			const ab =
				typeof msg === 'string'
					? B64U.stringToU8A(msg)
					: msg.byteLength
					? msg
					: msg.buffer
					? msg.buffer
					: B64U.stringToU8A(JSON.stringify(msg));
			const hash = await Hasher.digest(Date.now() + Math.random() + targetSignalingHash + key + SALT);
			const type = `${
				ESBigSendUtil.REQUEST_HEADER + (msg.byteLength ? 'arraybuffer' : msg.buffer ? 'typedarray' : typeof msg)
			}/${hash}`; // PorQ/type/hash
			this.requestMap.set(hash, resolve);
			setTimeout(() => {
				this.requestMap.delete(hash);
				resolve(ESBigSendUtil.TIME_OUT);
			}, ESBigSendUtil.MAX_WAIT_MS);
			return await this.ESBigSendDataAdoptor.sendBigData(
				await this.getConf(this.groupHash, targetSignalingHash, this.group),
				key,
				type,
				ab,
				this.l
			);
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
		return (
			file &&
			file.type &&
			file.type.indexOf(ESBigSendUtil.REQUEST_HEADER) === 0 &&
			file.type.split('/').length >= 3 &&
			B64U.isBase64(file.type.split('/').pop())
		);
	}
	isResponse(file) {
		return (
			file &&
			file.type &&
			file.type.indexOf(ESBigSendUtil.RESPONSE_HEADER) === 0 &&
			file.type.split('/').length >= 3 &&
			B64U.isBase64(file.type.split('/').pop())
		);
	}
	convertTypeToResopnce(type) {
		return type
			? type.indexOf(ESBigSendUtil.REQUEST_HEADER) === 0
				? type.replace(ESBigSendUtil.REQUEST_HEADER, ESBigSendUtil.RESPONSE_HEADER)
				: type
			: type;
	}

	async isBigSendData(data, deviceName) {
		const MIN = ESBigSendUtil.MIN;
		console.log(`☆☆ESBigSendDataAdoptor isBigSendData A deviceName:${deviceName}/MIN:${MIN}`, data);
		if (
			!data ||
			typeof data === 'string' ||
			(!data.byteLength && !data.buffer) ||
			(!data.buffer && data.byteLength < MIN) ||
			(data.buffer && data.buffer.byteLength < MIN)
		) {
			return false; // 1,256/8=32byte,data
		}
		const dnU8A = B64U.stringToU8A(deviceName);
		console.log(`☆☆ESBigSendDataAdoptor isBigSendData B deviceName:${deviceName}`, dnU8A);
		const f1 = dnU8A[0] * 1;
		const dU8A =
			data.byteLength && data.byteLength > 0
				? new Uint8Array(data)
				: data.buffer
				? new Uint8Array(data.buffer)
				: NULL_ARR;
		console.log(
			`☆☆ESBigSendDataAdoptor isBigSendData C data.byteLength:${data.byteLength}/f1:${f1}/dU8A[0]:${dU8A[0]}`,
			dU8A
		);
		if (f1 !== dU8A[0] * 1) {
			console.log(
				`☆☆ESBigSendDataAdoptor isBigSendData C1 data.byteLength:${data.byteLength}/f1:${f1}/dU8A[0]:${
					dU8A[0]
				}/type:${typeof f1}`
			);
			return false;
		}
		const hashU8A = dU8A.subarray(1, 33);
		const dataU8A = dU8A.subarray(33); //index,signAll,data
		const hash = B64U.ab2Base64(await Hasher.digest(dataU8A, 1, undefined, true));
		const hashU8AB64 = B64U.u8a2Base64(hashU8A);
		const result = hashU8AB64 === hash;
		console.log(
			`☆☆ESBigSendDataAdoptor isBigSendData D data.byteLength:${data.byteLength}/hashU8A:${hashU8A}/result:${result}/hashU8AB64:${hashU8AB64}/hash:${hash}/dataU8A:`,
			dataU8A
		);
		return result;
	}
	async sendBigData(conf, name, type, ab, logger = console) {
		logger.log(`★★ESBigSendDataAdoptor sendBigData A sendMessage msg:${ab}/${conf.w}/${conf.w.isOpend}`);
		if (!conf || !conf.w || !conf.w.isOpend) {
			return;
		}
		const w = conf.w;
		const deviceName = conf.targetDeviceName;
		const dataU8A = new Uint8Array(ab);
		const { dasendDataAb, signatureU8A, count, f1 } = await ESBigSendUtil.makeBigSendDataMeta(
			dataU8A,
			deviceName,
			type,
			name
		);
		console.log(`★★ESBigSendDataAdoptor sendBigData B dasendDataAb:${dasendDataAb}`, dasendDataAb);
		const signatureB64 = B64U.ab2Base64(signatureU8A.buffer);
		const sendQueue = new Map();
		const index = -1;
		const i = new Int32Array(1).fill(index);
		const resHashB64 = B64U.ab2Base64(
			await ESBigSendUtil.makeResAb(f1, new Uint8Array(dasendDataAb).subarray(69), i.buffer, signatureU8A)
		);
		this.sendMap.set(signatureB64, {
			sendQueue,
			type,
			name,
			byteLength: ab.byteLength,
			status: ESBigSendUtil.SENDING,
		});
		const promises = [];
		console.log(`★★ESBigSendDataAdoptor sendBigData C01 resHashB64:${resHashB64}/i:`, resHashB64);
		const result = await this.snedTransactional(w, dasendDataAb, resHashB64, sendQueue, index);
		console.log(`★★ESBigSendDataAdoptor sendBigData C02 result:${result}/i:`, i);
		if (result === ESBigSendUtil.COMPLE) {
			return true;
		}
		if (result === ESBigSendUtil.TIME_OUT) {
			return false;
		}
		let offset = 0;
		for (let i = 0; i < count; i++) {
			console.log(`★★ESBigSendDataAdoptor sendBigData D count:${count}/i:${i}/offset:`, offset);
			const end = i === count - 1 ? ab.byteLength : offset + ESBigSendUtil.SIZE;
			const partU8A = dataU8A.subarray(offset, end);
			promises.push(this.sendTranApart(w, partU8A, f1, signatureU8A, sendQueue, i));
			offset = offset += ESBigSendUtil.SIZE;
		}
		await Promise.all(promises);
		console.log(`★★ESBigSendDataAdoptor sendBigData E result:${result}`, result);
	}
	async sendTranApart(w, partU8A, f1, signatureU8A, sendQueue, index) {
		const i = new Int32Array(1);
		i.fill(index);
		const indexA = B64U.u8a2I32a(new Uint8Array(i.buffer))[0];
		console.log(`★★★ESBigSendDataAdoptor sendTranApart A index:${index}/indexA:${indexA}`, i);
		const resHashB64 = B64U.u8a2Base64(await ESBigSendUtil.makeResAb(f1, partU8A, i.buffer, signatureU8A));
		const sendAb = await ESBigSendUtil.makeBigSendData(partU8A, f1, signatureU8A, index);
		console.log(`★★★ESBigSendDataAdoptor sendTranApart B resHashB64:${resHashB64}`, resHashB64);
		console.log(`★★★ESBigSendDataAdoptor sendTranApart C partU8A:${partU8A}`, partU8A);
		console.log(`★★★ESBigSendDataAdoptor sendTranApart D signatureU8A:${signatureU8A}`, signatureU8A);
		let isSendSuccsess = false;
		let isComple = false;
		while (isSendSuccsess === false) {
			const result = await this.snedTransactional(w, sendAb, resHashB64, sendQueue, index);
			console.log(`★★★ESBigSendDataAdoptor sendTranApart E index:${index}/result:${result}`, partU8A);
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
			sendQueue.set(resHashB64, { index, timer, resolve });
			console.log(
				`★★★★ESBigSendDataAdoptor snedTransactional index:${index}/resHashB64:${resHashB64}/ ${ab}`,
				ab
			);
			w.send(ab, 'arraybuffer');
		});
	}
	getBigSendDataResFormat(deviceName, data) {
		const MIN = ESBigSendUtil.MIN;
		console.log(`☆☆ESBigSendDataAdoptor A getBigSendDataResFormat deviceName:${deviceName}/data:`, data);
		if (
			data === null ||
			typeof data === 'string' ||
			(!data.byteLength && !data.buffer) ||
			(data.byteLength && data.byteLength < MIN) ||
			(data.buffer && data.buffer.byteLength < MIN)
		) {
			return false; // 1,256/8=32byte,data(index4byte,data)
		}
		console.log(`☆☆ESBigSendDataAdoptor B getBigSendDataResFormat deviceName:${deviceName}/data:`, data);
		const dnU8A = B64U.stringToU8A(deviceName);
		const f1 = dnU8A[0];
		const dU8A =
			!Array.isArray(data) && data.byteLength && data.byteLength > 0
				? new Uint8Array(data)
				: new Uint8Array(data.buffer);
		console.log(`☆☆ESBigSendDataAdoptor C getBigSendDataResFormat f1:${f1}/data:`, data);
		if (f1 !== dU8A[0]) {
			return false;
		}
		// const hashB64 = B64U.u8a2Base64(dU8A.subarray(1, 33));
		const index = B64U.u8a2I32a(dU8A.subarray(33, 37))[0];
		console.log(`☆☆ESBigSendDataAdoptor D getBigSendDataResFormat index:${index}/f1:`, f1);
		const signatureB64 = B64U.u8a2Base64(dU8A.subarray(37, 69));
		const m = this.sendMap.get(signatureB64);
		console.log(`☆☆ESBigSendDataAdoptor E getBigSendDataResFormat signatureB64:${signatureB64}/m:`, m);
		return m && m.sendQueue && m.byteLength >= index * ESBigSendUtil.SIZE && index >= -1 ? dU8A : null;
	}
	isBigSendDataResponse(dU8A) {
		const hashB64 = B64U.u8a2Base64(dU8A);
		const i = B64U.u8a2I32a(dU8A.subarray(33, 37))[0];
		const signatureB64 = B64U.u8a2Base64(dU8A.subarray(37, 69));
		const m = this.sendMap.get(signatureB64);
		console.log(
			`☆☆☆☆ESBigSendDataAdoptor isBigSendDataResponse  A index:${i}/signatureB64:${signatureB64} /hashB64:${hashB64} m.sendQueue.get(hashB64):/m:`,
			m.sendQueue.get(hashB64),
			m
		);
		const task = m && m.sendQueue && m.sendQueue.get(hashB64) ? m.sendQueue.get(hashB64) : { index: null };
		if (task.index === i) {
			console.log(`☆☆☆☆ESBigSendDataAdoptor isBigSendDataResponse B index:${i}`);
			clearTimeout(task.timer);
			return true;
		}
		console.log(`☆☆☆☆ESBigSendDataAdoptor isBigSendDataResponse C index:${i} task:`, task);
		return false;
	}
	isComplBigSendDataRes(dU8A) {
		const signatureB64 = B64U.u8a2Base64(dU8A.subarray(37, 69));
		const index = B64U.u8a2I32a(dU8A.subarray(33, 37))[0];
		const status = dU8A[dU8A.length - 1];
		const m = this.sendMap.get(signatureB64);
		console.log(
			`☆☆☆☆ESBigSendDataAdoptor isComplBigSendDataRes index:${index}/ESBigSendUtil.STATUS[status] :${ESBigSendUtil.STATUS[status]}/m:`,
			m
		);
		return (
			Math.ceil(m.byteLength / ESBigSendUtil.SIZE) === index &&
			ESBigSendUtil.STATUS[status] === ESBigSendUtil.COMPLE
		);
	}
	async recieveBigSendData(conf, dataAb) {
		if (!conf || !conf.w || !conf.w.isOpend) {
			return;
		}
		const w = conf.w;
		const dataU8A = new Uint8Array(dataAb);
		const dataBodyU8A = dataU8A.subarray(33); //index,signAll,data
		const index = B64U.u8a2I32a(dataBodyU8A.subarray(0, 4))[0]; //index,signAll,data
		const signatureB64 = B64U.u8a2Base64(dataBodyU8A.subarray(4, 36)); //index,signAll,data
		const dU8A = dataBodyU8A.subarray(36); //index,signAll,data
		let map = this.recieveMap.get(signatureB64);
		console.log(`☆☆☆ESBigSendDataAdoptor recieveBigSendData A index:${index}/signatureB64:`, signatureB64);
		if (!map) {
			map = {
				m: [{ type: null, name: null }],
				signature: null,
				byteLength: null,
				count: null,
				counter: 0,
				data: {},
				full: null,
				compleU64: null,
			};
			this.recieveMap.set(signatureB64, map);
		}
		console.log(`☆☆☆ESBigSendDataAdoptor recieveBigSendData B index:${index}/map:`, map);
		if (index === -1) {
			console.log('☆☆☆ESBigSendDataAdoptor recieveBigSendData C B64U.u8aToString(dU8A):', B64U.u8aToString(dU8A));
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
				const len = Math.ceil(meta.count / 8);
				const compCount = new Uint8Array(len);
				compCount.fill(0);
				map.counter = compCount;
				const compleCount = new Uint8Array(len);
				compleCount.fill(255);
				compleCount[compCount.length - 1] = meta.count % 8 ? Math.pow(2, meta.count % 8) - 1 : 255;
				map.compleU64 = B64U.u8a2Base64(compleCount);
			}
		} else {
			const counterIndex = Math.floor(index / 8);
			map.counter[counterIndex] = map.counter[counterIndex] | (1 << index % 8);
			const indexKey = (2147483648 + index).toFixed();
			map.data[indexKey] = dU8A;
		}
		console.log(
			`☆☆☆ESBigSendDataAdoptor recieveBigSendData D index:${index}/m map.counter:${map.counter}/map.data:`,
			map.data
		);
		console.log(
			`☆☆☆ESBigSendDataAdoptor recieveBigSendData E index:${index}/B64U.u8a2Base64(map.counter):${B64U.u8a2Base64(
				map.counter
			)}/map.counter:`,
			map.counter
		);
		const isComple = map.compleU64 === B64U.u8a2Base64(map.counter);
		console.log(
			`☆☆☆ESBigSendDataAdoptor recieveBigSendData F index:${index}/mmap.compleU64:${map.compleU64}/isComple:`,
			isComple
		);
		const res = await ESBigSendUtil.makeBigSendDataResponse(dataAb, index);
		console.log(`☆☆☆ESBigSendDataAdoptor recieveBigSendData G index:${index}/res:`, res);
		w.send(res.buffer, 'arraybuffer');
		if (isComple) {
			console.log(`☆☆☆ESBigSendDataAdoptor recieveBigSendData H index:${index}/isComple:`, isComple);
			const { united, isValid } = await ESBigSendUtil.unitData(map);
			const res = await ESBigSendUtil.makeBigSendDataResponse(
				dataAb,
				map.count + 1,
				isValid ? ESBigSendUtil.COMPLE : ESBigSendUtil.NG
			);
			w.send(res.buffer, 'arraybuffer');
			console.log(
				`☆☆☆ESBigSendDataAdoptor recieveBigSendData I index:${index}/isComple:${isComple}/isValid:${isValid}/united:`,
				united
			);
			if (isValid) {
				console.log(`☆☆☆ESBigSendDataAdoptor recieveBigSendData J index:${index}/isValid:`, isValid);
				const files = [];
				for (const m of map.m) {
					if (!m.type && !m.name) {
						continue;
					}
					const type = [m.type].join('/');
					files.push({ name: m.name, type, data: united });
				}
				return { files, isComple, res };
			}
		}
		console.log(`☆☆☆ESBigSendDataAdoptor recieveBigSendData K index:${index}/isComple:${isComple}/res:`, res);
		return { res, isComple };
	}
	async recieveBigSendDataRes(dU8A) {
		const lastIndex = dU8A.length - 1;
		console.log(`☆☆☆☆ESBigSendDataAdoptor recieveBigSendDataRes A lastIndex:${lastIndex}`);
		const status = ESBigSendUtil.STATUS[dU8A[lastIndex]];
		dU8A[lastIndex] = ESBigSendUtil.STATUS.indexOf(ESBigSendUtil.OK);
		const hashB64 = B64U.u8a2Base64(dU8A);
		const signatureB64 = B64U.u8a2Base64(dU8A.subarray(37, 69));
		const m = this.sendMap.get(signatureB64);
		const task = m && m.sendQueue && m.sendQueue.get(hashB64) ? m.sendQueue.get(hashB64) : { index: null };
		const resolve = task.resolve;
		if (typeof resolve === 'function') {
			resolve(status);
			return true;
		}
		return false;
	}
	async recieveBigSendDataCompl(dU8A) {
		const signatureB64 = B64U.u8a2Base64(dU8A.subarray(37, 69));
		const m = this.sendMap.get(signatureB64);
		if (m.sendQueue) {
			for (const [key, value] of m.sendQueue) {
				if (typeof value === 'function') {
					value(ESBigSendUtil.COMPLE);
				}
				m.sendQueue.delete(key);
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
	static STATUS = [
		ESBigSendUtil.TIME_OUT,
		ESBigSendUtil.OK,
		ESBigSendUtil.NG,
		ESBigSendUtil.COMPLE,
		ESBigSendUtil.SENDING,
	];
	static async makeBigSendDataMeta(dataU8A, deviceName, type, name) {
		const dnU8A = B64U.stringToU8A(deviceName);
		const f1 = new Uint8Array(1).fill(dnU8A[0]);
		const byteLength = dataU8A.buffer.byteLength;
		const count = Math.ceil(byteLength / ESBigSendUtil.SIZE);
		const I1 = new Int32Array(1).fill(-1);
		const signature = await Hasher.digest(dataU8A); //BASE64
		console.log('□□ESBigSendUtil makeBigSendDataMeta 6 signature:', signature);
		const signatureU8A = new Uint8Array(B64U.base64UrlToAB(signature));
		console.log(`□□ESBigSendUtil makeBigSendDataMeta 7 signatureU8A:${signatureU8A.length}`, signatureU8A);
		const json = JSON.stringify({ type, name, signature, byteLength, count });
		console.log('□□ESBigSendUtil makeBigSendDataMeta 8 json:', json);
		const dataU8a = B64U.joinU8as([new Uint8Array(I1.buffer), signatureU8A, B64U.stringToU8A(json)]); // 4+32=36
		console.log(`□□ESBigSendUtil makeBigSendDataMeta 9 dataU8a:${dataU8a.length}`, dataU8a);
		const signAb = await Hasher.digest(dataU8a, 1, undefined, true);
		const result = {
			dasendDataAb: B64U.joinU8as([f1, new Uint8Array(signAb), dataU8a]).buffer, // 1+32=33 33+36 = 69
			signatureU8A,
			count,
			f1,
		}; //d,signature,[index,signAll,data]
		console.log('□□ESBigSendUtil makeBigSendDataMeta A result', result);
		return result;
	}
	static async makeBigSendData(sendDataU8A, f1, signatureU8A, index) {
		const I1 = new Int32Array(1).fill(index);
		const dataU8a = B64U.joinU8as([new Uint8Array(I1.buffer), signatureU8A, sendDataU8A]);
		const signAb = await Hasher.digest(dataU8a, 1, undefined, true);
		const dU8A = B64U.joinU8as([f1, new Uint8Array(signAb), dataU8a]);
		const result = dU8A.buffer; //d,signature,[index,signAll,data]
		//----------------------------------------------
		const dataU8A = dU8A.subarray(33); //index,signAll,data
		console.log(`□□ESBigSendUtil makeBigSendData A01 result dataU8A: ${dataU8A}/`);
		const hash = B64U.ab2Base64(await Hasher.digest(dataU8A, 1, undefined, true));
		console.log(`□□ESBigSendUtil makeBigSendData A02 result hash: ${hash}/`);
		const hashU8A = dU8A.subarray(1, 33);
		console.log(`□□ESBigSendUtil makeBigSendData A03 result hashU8A: ${hashU8A}/`);
		const ab = hashU8A.buffer;
		console.log(`□□ESBigSendUtil makeBigSendData A04 result ab: ${ab.byteLength}/`);
		const hashU8AB64 = B64U.u8a2Base64(hashU8A);
		console.log(`□□ESBigSendUtil makeBigSendData A05 result ab: ${ab.byteLength}/`);
		const isMatch = hashU8AB64 === hash;
		console.log(
			`□□ESBigSendUtil makeBigSendData A result hash: ${hash}/${hashU8A.length}/###hashU8AB64:${hashU8AB64.length}#${hashU8AB64}####/isMatch:${isMatch}`,
			hashU8A
		);
		//----------------------------------------------

		console.log('□□ESBigSendUtil makeBigSendData A result', result);
		return result;
	}
	static async makeBigSendDataResponse(data, index = -1, flg = ESBigSendUtil.OK) {
		console.log(`☆☆☆☆ ESBigSendUtil makeBigSendDataResponse A index:${index}/flg:${flg}/data:`, data);
		const dU8A =
			!Array.isArray(data) && data.byteLength && data.byteLength > 0
				? new Uint8Array(data)
				: new Uint8Array(data.buffer);
		console.log(
			`☆☆☆☆ ESBigSendUtil makeBigSendDataResponse B Array.isArray(data):${Array.isArray(data)}/dU8A.length:${
				dU8A.length
			}/dU8A:`,
			dU8A
		);
		const f1 = new Uint8Array(1);
		f1[0] = dU8A[0];
		const indexI32A = B64U.u8a2I32a(
			index > 0 ? new Uint8Array(new Int32Array(1).fill(index).buffer) : dU8A.subarray(33, 37)
		);
		const signatureU8A = dU8A.subarray(37, 69);
		const pureDU8A = dU8A.subarray(69);
		const flag = new Uint8Array(1).fill(ESBigSendUtil.STATUS.indexOf(flg));
		console.log(
			`☆☆☆☆ ESBigSendUtil makeBigSendDataResponse C indexI32A:${indexI32A}/signatureU8A.length:${signatureU8A.length}/signatureU8A:`,
			signatureU8A
		);
		return await ESBigSendUtil.makeResAb(f1, pureDU8A, indexI32A.buffer, signatureU8A, flag);
	}
	static async makeResAb(
		f1,
		dU8A,
		indexAb,
		signatureU8A,
		flag = new Uint8Array(1).fill(ESBigSendUtil.STATUS.indexOf(ESBigSendUtil.OK))
	) {
		console.log(
			`☆☆☆☆☆ ESBigSendUtil makeResAb A f1:${f1}/indexAb:${new Int32Array(indexAb)[0]}/signatureU8A:${
				signatureU8A.length
			}/signatureU8A:`,
			signatureU8A
		);
		const hashU8A = new Uint8Array(await Hasher.digest(dU8A, 1, undefined, true)); //ab
		console.log(
			`☆☆☆☆☆ ESBigSendUtil makeResAb B f1:${f1}/dU8A.length:${dU8A.length}/hashU8A:${
				hashU8A.length
			} ${B64U.u8a2Base64(hashU8A)} /dU8A:`,
			dU8A
		);
		return B64U.joinU8as([f1, hashU8A, new Uint8Array(indexAb), signatureU8A, flag]);
	}
	static async unitData(map) {
		console.log('☆☆☆☆☆ ESBigSendUtil unitData A map:', map);
		if (map.full) {
			return { united: map.full, isValid: true };
		}
		const dataU8a = map.data;
		const keys = Object.keys(dataU8a);
		keys.sort();
		console.log('☆☆☆☆☆ ESBigSendUtil unitData B keys:', keys);
		const list = [];
		for (const index of keys) {
			list.push(dataU8a[index]);
		}
		const dU8A = B64U.joinU8as(list);
		console.log(`☆☆☆☆☆ ESBigSendUtil unitData C dU8A.length:${dU8A.length}`, dU8A);

		const united = new Uint8Array(map.byteLength);
		let offset = 0;
		for (const index of keys) {
			const u8a = dataU8a[index];
			united.set(u8a, offset);
			delete dataU8a[index];
			offset += u8a.byteLength;
		}
		keys.splice(0, keys.length);
		const digest = await Hasher.digest(united);
		console.log(`☆☆☆☆☆ ESBigSendUtil unitData D map.signature:${map.signature} /digest:${digest} /united:`, united);
		const isValid = digest === map.signature;
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
	static sendOnDC(conf, msg, logger = console, binaryType = 'blob') {
		logger.log(`ESWebRTCConnecterUtil sendMessage msg:${msg}`);
		if (conf && conf.w && conf.w.isOpend) {
			conf.w.send(msg, binaryType);
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
		isTestMode = false,
		stunServer = [
			{
				urls: 'stun:stun.l.google.com:19302',
			},
		]
	) {
		this.isTestMode = isTestMode;
		this.WebRTCPeerOffer = new WebRTCPeer('OFFER', stunServer);
		this.WebRTCPeerAnswer = new WebRTCPeer('ANSWER', stunServer);
		this.WebRTCPeer = null;
		this.onOpenCallBack = () => {};
		this.onCloseCallBack = () => {};
		this.onMessageCallBack = () => {};
		this.onErrorCallBack = () => {};
		this.isOpend = isTestMode ? true : false;
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
			self.l.log(
				'-WebRTCConnecter-onOpen--1-WebRTCPeerOffer---------WebRTCConnecter--------------------------------------'
			);
			self.WebRTCPeer.onClose = self.onCloseCallBack;
			self.WebRTCPeer.onMessage = self.onMessageCallBack;
			self.WebRTCPeer.onError = self.onErrorCallBack;
			self.isOpend = true;
		};
		this.WebRTCPeerAnswer.onOpen = (event) => {
			self.onOpenCallBack(event);
			self.WebRTCPeer = self.WebRTCPeerAnswer;
			self.l.log(
				'-WebRTCConnecter-onOpen--1-WebRTCPeerAnswer---------WebRTCPeerAnswer--------------------------------------'
			);
			self.WebRTCPeer.onClose = self.onCloseCallBack;
			self.WebRTCPeer.onMessage = self.onMessageCallBack;
			self.WebRTCPeer.onError = self.onErrorCallBack;
			self.isOpend = true;
		};
		this.l.log(
			`-WebRTCConnecter-init--3----------WebRTCConnecter--------------------------------------WebRTCPeerOffer:${this.WebRTCPeerOffer.name}`
		);
		this.l.log(
			`-WebRTCConnecter-init--4----------WebRTCConnecter--------------------------------------WebRTCPeerAnswer:${this.WebRTCPeerAnswer.name}`
		);
		return true;
	}

	async getOfferSdp() {
		return (await this.inited) ? await this.WebRTCPeerOffer.makeOffer() : '';
	}
	setOnOpen(callback) {
		this.onOpenCallBack = (event) => {
			console.warn(
				`-WebRTCConnecter-onOpenCallBack--1------------------------------------------------event:${event}`
			);
			callback(event);
		};
	}
	setOnClose(callback) {
		this.onCloseCallBack = (event) => {
			console.warn(
				`-WebRTCConnecter-onCloseCallBack--1------------------------------------------------event:${event}`
			);
			callback(event);
		};
	}
	setOnMessage(callback) {
		this.onMessageCallBack = (msg) => {
			console.warn(
				`-WebRTCConnecter-onMessageCallBack--1------------------------------------------------msg:${msg}`
			);
			callback(msg);
		};
	}
	setOnError(callback) {
		this.onErrorCallBack = (error) => {
			console.warn(
				`-WebRTCConnecter-onErrorCallBack--1------------------------------------------------error:${error}`
			);
			callback(error);
		};
	}
	send(msg, binaryType = 'blob') {
		const m = msg;
		console.log(`WebRTCConnecter send msg:${msg}/binaryType:${binaryType}`);
		if (this.isTestMode) {
			return this.onMessageCallBack(
				typeof m !== 'string' && m instanceof Blob
					? m.buffer
						? new Blob(m)
						: m.byteLength
						? new Uint8Array(m)
						: m
					: m
			);
		}
		this.WebRTCPeer.send(msg, binaryType);
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
		return !Array.isArray(candidates)
			? `setCandidates candidates:${candidates}`
			: this.WebRTCPeer.setCandidates(candidates);
	}
	close() {
		this.WebRTCPeerOffer.close();
		this.WebRTCPeerAnswer.close();
	}
	isOpened() {
		return this.isTestMode ? true : this.WebRTCPeer ? this.WebRTCPeer.isOpened() : false;
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
			console.warn(
				'-WebRTCPeer-prepareNewConnection--0----------WebRTCPeer--------------------------------------'
			);
			const peer = new RTCPeerConnection(this.config, addOption);
			console.warn(
				'-WebRTCPeer-prepareNewConnection--1----------WebRTCPeer--------------------------------------'
			);
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
					console.log(
						`-WebRTCPeer--onicecandidate--- empty ice event peer.localDescription:${peer.localDescription}`
					);
				}
			};
			peer.onnegotiationneeded = async () => {
				try {
					console.log(
						`-WebRTCPeer1--onnegotiationneeded--------WebRTCPeer----createOffer() succsess in promise name:${this.name}`
					);
					const offer = await peer.createOffer();
					console.log(
						`-WebRTCPeer2--onnegotiationneeded--------WebRTCPeer----createOffer() succsess in promise;iceConnectionState;${peer.iceConnectionState}`
					);
					await peer.setLocalDescription(offer);
					console.log(
						`-WebRTCPeer3--onnegotiationneeded--------WebRTCPeer----setLocalDescription() succsess in promise;iceConnectionState${peer.iceConnectionState}`
					);
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
				console.warn(
					`-WebRTCPeer-ondatachannel--1----------WebRTCPeer--------------------------------------evt:${evt}`
				);
				this.dataChannelSetup(evt.channel);
			};
			console.warn(
				`-WebRTCPeer-prepareNewConnection--2----------WebRTCPeer--------------------------------------isWithDataChannel:${isWithDataChannel}`
			);
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
			console.log(
				`WebRTCPeer The Data Channel be Closed. readyState:${this.dataChannel.readyState} /${dc.id} !== ${this.dataChannel.id}`
			);
			// this.dataChannel.close();
			// this.dataChannel = null;
		}
		dc.onerror = (error) => {
			console.error('WebRTCPeer Data Channel Error:', error);
			this.onError(error);
		};
		dc.onmessage = (event) => {
			console.log(
				`WebRTCPeer Got Data Channel Message:typeof:${typeof event.data}/isBlob:${event.data instanceof Blob}`,
				event.data
			);
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
				console.log(
					`WebRTCPeer setOfferAndAswer setRemoteDescription(answer) succsess in promise name:${this.name}`
				);
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
		console.log(`Connection SEND!; dc.binaryType : ${dc.binaryType}`);
		switch (dc.readyState) {
			case 'connecting':
				console.log(`Connection not open; queueing: ${msg}`);
				this.queue.push(msg);
				break;
			case 'open':
				this.sendOnQueue(binaryType);
				dc.send(msg, binaryType);
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
	sendOnQueue(binaryType) {
		const l = this.queue.length;
		for (let i = 0; i < l; i++) {
			this.dataChannel.send(this.queue.shift(), binaryType);
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
		let result = message.buffer
			? message instanceof Uint8Array
				? B64U.deepCopyU8a(message)
				: new Uint8Array(message.buffer)
			: te.encode(message);

		for (let i = 0; i < stretchCount; i++) {
			result = await window.crypto.subtle.digest(algo, result);
		}
		console.log('digest result:', result);
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
		return td.decode(u8a);
	}
	static ab2Base64(abInput) {
		const ab = abInput.buffer ? abInput.buffer : abInput;
		console.log('ab2Base64 ab:', ab.byteLength);
		return window.btoa(B64U.uint8Array2BinaryString(new Uint8Array(ab)));
	}
	static u8a2Base64(u8a) {
		console.log('u8a2Base64 u8a:', u8a.length);
		return window.btoa(B64U.uint8Array2BinaryString(u8a));
	}
	static u8a2I32a(u8a) {
		const u8a4 = new Uint8Array(4);
		const len1 = u8a.length;
		const len = Math.ceil(len1 / 4);
		const i32a = new Int32Array(len);
		for (let i = 0; i < len; i++) {
			u8a4[0] = u8a[i + 0];
			u8a4[1] = len1 < i + 1 ? 0 : u8a[i + 1];
			u8a4[2] = len1 < i + 2 ? 0 : u8a[i + 2];
			u8a4[3] = len1 < i + 3 ? 0 : u8a[i + 3];
			i32a[i] = new Int32Array(u8a4.buffer)[0];
		}
		return i32a;
	}
	static u8a2u32a(u8a) {
		const u8a4 = new Uint8Array(4);
		const len1 = u8a.length;
		const len = Math.ceil(len1 / 4);
		const u32a = new Uint32Array(len);
		for (let i = 0; i < len; i++) {
			u8a4[0] = u8a[i + 0];
			u8a4[1] = len1 < i + 1 ? 0 : u8a[i + 1];
			u8a4[2] = len1 < i + 2 ? 0 : u8a[i + 2];
			u8a4[3] = len1 < i + 3 ? 0 : u8a[i + 3];
			u32a[i] = new Uint32Array(u8a4.buffer)[0];
		}
		return u32a;
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
		console.log('□□joinU8ss A u8as', u8as);
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
		console.log('□□joinU8ss B united', united);
		return united;
	}
	static uint8Array2BinaryString(u8a) {
		const r = [];
		console.log(`uint8Array2BinaryString u8a:${u8a.length}`);
		for (const e of u8a) {
			r.push(String.fromCharCode(e));
		}
		console.log(`uint8Array2BinaryString r:${r.length}`);
		return r.join('');
	}
	static binaryString2Uint8Array(binaryString) {
		const rawLength = binaryString.length;
		const array = new Uint8Array(new ArrayBuffer(rawLength));
		for (let i = 0; i < rawLength; i++) {
			array[i] = binaryString.charCodeAt(i);
		}
		return array;
	}
	static blobToAb(blob) {
		return new Promise((resolve) => {
			const fr = new FileReader();
			fr.onload = () => {
				resolve(fr.result);
			};
			fr.onerror = () => {
				resolve(fr.error);
				console.error(fr.error);
			};
			fr.readAsArrayBuffer(blob);
		});
	}
	static deepCopyU8a(u8a) {
		const len = u8a.length;
		const newOne = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			newOne[i] = u8a[i];
		}
		return newOne;
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
		return saltInput
			? isAB
				? new Uint8Array(saltInput)
				: B64U.stringToU8A(saltInput)
			: crypto.getRandomValues(new Uint8Array(16));
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
		console.log('encodeAES256GCM encryptedDataAB:', encryptedDataAB);
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
		const [key] =
			typeof passphraseTextOrKey === 'string'
				? await Cryptor.getKey(passphraseTextOrKey, saltU8A)
				: { passphraseTextOrKey };
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
