export const te = new TextEncoder('utf-8');
const OFFER = '_OFFER';
const ANSWER = '_ANSWER';
const SleepMs = 100;
const WAIT = 'wait';
const WAIT_AUTO_INTERVAL = 1000 * 20;
const HASH_SCRATCH_COUNT = 12201;
const contentType = 'application/x-www-form-urlencoded';
const ef = (e, id = '') => {
	console.warn(`${id} ${e.message}`);
	console.warn(e.stack);
};
function sleep(ms = SleepMs) {
	return new Promise((r) => {
		setTimeout(() => {
			r();
		}, ms);
	});
}
function decode(data) {
	try {
		const obj = typeof data === 'string' ? JSON.parse(data) : data;
		const result = obj && obj.message ? obj.message : null;
		return result;
	} catch (e) {
		ef(e);
	}
	return null;
}
export class ESWebRTCConnecterU {
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
	async init(url, group, passwd, deviceName) {
		this.l.log('ESWebRTCConnecterU INIT START');
		this.url = url;
		this.group = group;
		this.passwd = passwd;
		this.hash = await this.mkHash([url, group, passwd, deviceName], HASH_SCRATCH_COUNT);
		this.l.log(`ESWebRTCConnecterU INIT END this.hash:${this.hash}`);
	}
	async mkHash(seeds = [location.origin, navigator.userAgent, Date.now()], stretch = Math.floor(Math.random() * 100) + (Date.now() % 100) + 1) {
		return await Hasher.digest(JSON.stringify(seeds), stretch);
	}
	async startWaitAutoConnect() {
		await this.inited;
		this.isStopAuto = false;
		let count = 3;
		this.isWaiting = false;
		let isFirst = true;
		while (this.isStopAuto === false) {
			const group = this.group;
			this.gropuHash = await Hasher.digest(group);
			await sleep(WAIT_AUTO_INTERVAL / 4);
			if (count === 0 || isFirst) {
				await this.sendWait(group);
				isFirst = false;
				count = 3;
			} else {
				count--;
			}
			const list = await this.getWaitList(group);
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
				if (v.hash !== this.hash && v.hash.indexOf(this.hash) < 0) {
					console.log(`ESWebRTCConnecterU sendWaitNotify group:${group}`);
					await this.onCatchAnother(group, now, v.hash);
					break;
				}
			}
		}
	}
	async onCatchAnother(group, now, target) {
		const conf = this.getConf(group, target);
		await this.sendWaitNotify(group, target);
		const l = await this.getWaitList(group);
		if (!Array.isArray(l) || l.length < 1) {
			return;
		}
		let isHotStamdby = false;
		const list3 = [];
		const len = this.hash.length;
		const tlen = target.length;
		const a = len + tlen;
		for (const row of l) {
			const v = row.value && typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
			if (row.expire < now || v.hash.length < a) {
				continue;
			}
			list3.push(JSON.stringify([row.expire, v.hash]));
		}
		if (list3.length < 1) {
			return;
		}
		list3.sort();
		list3.reverse();
		let isOffer = false;
		let rowCount = 0;
		for (const row of list3) {
			const cols = JSON.parse(row);
			const hash = cols[1];
			if (hash.indexOf(this.hash) === 1 && hash.indexOf(target) >= tlen) {
				isOffer = true;
				rowCount++;
			}
			if (hash.indexOf(this.hash) >= len && hash.indexOf(target) === 1) {
				isOffer = false;
				rowCount++;
			}
			if (rowCount >= 2) {
				break;
			}
		}
		this.startNegosiation(conf).catch(ef);
		await sleep(100);
		if (isOffer) {
			await sleep(1000);
			this.offer(conf).catch(ef);
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
		await this.send(group, { msg: WAIT, hash: this.hash, expire: Date.now() + WAIT_AUTO_INTERVAL }, WAIT);
	}
	async sendWaitNotify(group, tagetHash) {
		await this.send(group, { msg: WAIT, hash: `/${this.hash}/${tagetHash}`, expire: Date.now() + WAIT_AUTO_INTERVAL }, WAIT);
	}
	async getWaitList(group) {
		const data = await this.load(group, WAIT);
		const obj = data ? JSON.parse(data) : null;
		return obj ? obj.message : null;
	}
	async startNegosiation(conf) {
		conf.isStop = false;
		conf.w.setOnOpne(() => {
			conf.isStop = true;
		});
		setTimeout(() => {
			conf.isStop = true;
		}, WAIT_AUTO_INTERVAL);
		while (conf.isStop === false && this.isStopAuto === false) {
			setTimeout(() => {
				if (conf.isAnaswer) {
					return;
				} else if (this.threads.length < 4) {
					this.threads.push(1);
				} else {
					return;
				}
				this.load(conf.pxOs).then((data) => {
					const cacheKey = conf.pxOs + data;
					this.threads.pop(1);
					const d = decode(data);
					this.l.log(`ESWebRTCConnecterU=ANSWER====data:${data}`);
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
				this.load(conf.pxAs).then((data) => {
					const cacheKey = conf.pxAs + data;
					this.threads.pop(1);
					const d = decode(data);
					this.l.log(`ESWebRTCConnecterU=OFFER====data:${data}`);
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
			this.resetConf(this.confs[key]);
		}
	}
	async offer(conf) {
		conf.isAnaswer = false;
		const offer = await conf.w.getOfferSdp();
		this.l.log(`ESWebRTCConnecterU setOnRecieve OFFER send offer:${offer}`);
		await this.send(conf.pxAt, offer);
	}
	async send(group, dataObj, cmd = 'g') {
		const now = Date.now();
		const data = await this.postToGAS(this.url, { group, cmd, data: typeof dataObj !== 'string' ? JSON.stringify(dataObj) : dataObj });
		this.l.log(`ESWebRTCConnecterU================send=================${group}/${cmd} d:${Date.now() - now} data:${data}`);
	}
	async load(group, cmd = 'g') {
		const now = Date.now();
		const key = `${now}_${Math.floor(Math.random() * 1000)}`;
		const data = await this.getTextGAS(this.url, { group, cmd });
		this.l.log(`ESWebRTCConnecterU==${key}==============load=B========${group}/${cmd} ========${Date.now() - now} data:${data}`);
		return data;
	}
	getConKey(group, target) {
		return JSON.stringify([group, target]);
	}
	getConf(group, target) {
		const k = this.getConKey(group, target);
		const s = this.getConKey(group, this.hash);
		let conf = this.confs[k];
		if (!conf) {
			conf = { isAnaswer: true, isGetFirst: false, isExcangedCandidates: false, pxAt: k + ANSWER, pxOt: k + OFFER, pxAs: s + ANSWER, pxOs: s + OFFER, isStop: false, cache: {} };
			conf.w = new WebRTCConnecter();
			conf.w.setOnMessage((msg) => {
				this.onReciveCallBack(target, msg);
			});
			this.confs[k] = conf;
		}
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
	async listener(conf, px, value) {
		this.l.log('ESWebRTCConnecterU==============LISTENER==RECEIVE=A================');
		this.l.log(`ESWebRTCConnecterU getLisntenrB event px:${px}/${px === ANSWER}//alue:${value}`);
		this.l.log(
			`ESWebRTCConnecterU==============LISTENER==RECEIVE=B================conf.isAnaswer:${conf.isAnaswer}/!conf.isGetFirst:${!conf.isGetFirst}/conf.isExcangedCandidates:${conf.isExcangedCandidates}`
		);
		if (value === true || value === null || value === 'null') {
			this.l.log(`ESWebRTCConnecterU==============LISTENER==END=================value:${value}`);
			return;
		}
		if (conf.isAnaswer && px === ANSWER) {
			this.l.log(`ESWebRTCConnecterU A AS ANSWER conf.isAnaswer:${conf.isAnaswer} A px:${px}`);
			if (!conf.isGetFirst) {
				conf.w.setOnCandidates(async (candidates) => {
					while (!conf.isGetFirst) {
						await sleep(200);
					}
					await sleep(500);
					await this.send(conf.pxOt, candidates);
				});
				const answer = await conf.w.answer(this.parseSdp(value));
				this.l.log(`ESWebRTCConnecterU==============LISTENER==answer=A================typeof answer :${typeof answer}`);
				this.l.log(answer);
				if (!answer) {
					this.l.log(`ESWebRTCConnecterU==============LISTENER==answer=0================value:${value}`);
				}
				this.l.log('ESWebRTCConnecterU==============LISTENER==answer=B================');
				await this.send(conf.pxOt, answer);
				conf.isGetFirst = true;
			} else if (!conf.isExcangedCandidates) {
				conf.isExcangedCandidates = true;
				const candidats = await conf.w.setCandidates(JSON.parse(value), Date.now());
				this.l.log('ESWebRTCConnecterU==============LISTENER==answer candidats=A================');
				this.l.log(candidats);
				this.l.log('ESWebRTCConnecterU==============LISTENER==answer candidats=B================');
			}
		} else if (!conf.isAnaswer && px === OFFER) {
			this.l.log(`ESWebRTCConnecterU B AS OFFER conf.isAnaswer:${conf.isAnaswer}/B px:${px}/!conf.isGetFirst:${!conf.isGetFirst}`);
			if (!conf.isGetFirst) {
				conf.isGetFirst = true;
				const candidates = await this.connect(conf, value);
				this.l.log('ESWebRTCConnecterU==============LISTENER==make offer candidates=A================');
				this.l.log(candidates);
				this.l.log('ESWebRTCConnecterU==============LISTENER==make offer candidates=B================');
				await this.send(conf.pxAt, candidates);
			} else if (!conf.isExcangedCandidates) {
				const candidats = value ? await conf.w.setCandidates(JSON.parse(value), Date.now()) : null;
				this.l.log('ESWebRTCConnecterU==============LISTENER==set offer candidats=A================');
				this.l.log(candidats);
				conf.isExcangedCandidates = true;
				this.l.log('ESWebRTCConnecterU==============LISTENER==set offer candidats=B================');
			}
		}
	}
	parseSdp(sdpInput) {
		const sdp = typeof sdpInput === 'string' ? JSON.parse(sdpInput) : sdpInput;
		this.l.log(`ESWebRTCConnecterU parseSdp ${typeof sdpInput}/sdpInput:${sdpInput}`);
		sdp.sdp = sdp.sdp.replace(/\\r\\n/g, '\r\n');
		this.l.log(sdp);
		return sdp.sdp;
	}
	connect(conf, sdpInput) {
		const func = async (resolve) => {
			this.l.log(sdpInput);
			return await conf.w.connect(this.parseSdp(sdpInput), (candidates) => {
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
	close(hash) {
		const conf = this.getConf(this.group, hash);
		if (conf && conf.w && conf.w.isOpend) {
			conf.w.close();
			this.resetConf(conf);
		}
	}
	// setOnMessage(
	// 	hash,
	// 	cb = (msg) => {
	// 		this.l.log(`setOnMessage msg:${msg}`);
	// 	}
	// ) {
	// 	const conf = this.confs[hash];
	// 	if (conf && conf.w) {
	// 		conf.w.setOnMessage(cb);
	// 	}
	// }
	/////////////////////////////////////////////////////////////////
	sendMessage(hash, msg) {
		const conf = this.getConf(this.group, hash);
		this.l.log(`ESWebRTCConnecterU sendMessage msg:${msg}`);
		if (conf && conf.w && conf.w.isOpend) {
			conf.w.send(msg);
		}
	}
	broadcastMessage(msg) {
		this.l.log(`ESWebRTCConnecterU sendMessage msg:${msg}`);
		for (const key in this.confs) {
			const conf = this.confs[key];
			if (conf && conf.w && conf.w.isOpend) {
				conf.w.send(msg);
			}
		}
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
		console.log('ESWebRTCConnecterU----getTextGAS--A------------');
		const r = await fetch(`${path}?${this.convertObjToQueryParam(data)}`, {
			method: 'GET',
			redirect: 'follow',
			Accept: 'application/json',
			'Content-Type': contentType,
		});
		return await r.text();
	}
	async postToGAS(path, data) {
		console.log('ESWebRTCConnecterU----postToGAS--A------------');
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
		this.WebRTCPeerCurrent = null;
		this.peerMap = {};
		this.onOpenCallBack = () => {};
		this.onCloseCallBack = () => {};
		this.onMessageCallBack = () => {};
		this.onErrorCallBack = () => {};
		this.isOpend = false;
		this.l = logger;
	}
	async init() {
		this.l.log('-WebRTCConnecter-init--0----------WebRTCConnecter--------------------------------------');
		this.close();
		const result = await this.WebRTCPeerOffer.makeOffer();
		this.l.log(`-WebRTCConnecter-init--1----------WebRTCConnecter--------------------------------------result:${result}`);
		const self = this;
		const onOpenAtOffer = (event) => {
			if (self.WebRTCPeerAnswer.isOpend) {
				self.selectActiveConnection();
			} else {
				self.onOpenCallBack(event);
				self.WebRTCPeer = self.WebRTCPeerOffer;
			}
			self.l.log('-WebRTCConnecter-onOpen--1-WebRTCPeerOffer---------WebRTCConnecter--------------------------------------');
			self.WebRTCPeer.onClose = self.onCloseCallBack;
			self.WebRTCPeer.onMessage = self.onMessageCallBack;
			self.WebRTCPeer.onError = self.onErrorCallBack;
			self.isOpend = true;
		};
		const onOpenAtAnswer = (event) => {
			if (self.WebRTCPeerOffer.isOpend) {
				self.selectActiveConnection();
			} else {
				self.onOpenCallBack(event);
				self.WebRTCPeer = self.WebRTCPeerAnswer;
			}
			self.l.log('-WebRTCConnecter-onOpen--1-WebRTCPeerAnswer---------WebRTCPeerAnswer--------------------------------------');
			self.WebRTCPeer.onClose = self.onCloseCallBack;
			self.WebRTCPeer.onMessage = self.onMessageCallBack;
			self.WebRTCPeer.onError = self.onErrorCallBack;
			self.isOpend = true;
		};
		this.WebRTCPeerAnswer.onOpen = onOpenAtAnswer;
		this.WebRTCPeerOffer.onOpen = onOpenAtOffer;
		this.l.log(`-WebRTCConnecter-init--3----------WebRTCConnecter--------------------------------------WebRTCPeerOffer:${this.WebRTCPeerOffer.name}`);
		this.l.log(`-WebRTCConnecter-init--4----------WebRTCConnecter--------------------------------------WebRTCPeerAnswer:${this.WebRTCPeerAnswer.name}`);
		return result;
	}

	async getOfferSdp() {
		if (await this.init()) {
			return this.getSdp();
		}
		return '';
	}
	selectActiveConnection() {
		const hashList = [];
		for (const hash in this.peerMap) {
			hashList.push(hash);
		}
		if (hashList.length > 1) {
			hashList.sort();
			const closeTarget = hashList.pop();
			const mainTarget = hashList.pop();
			this.WebRTCPeer = this.peerMap[mainTarget];

			this.WebRTCPeer.onClose = this.onCloseCallBack;
			const peerClose = this.peerMap[closeTarget];
			peerClose.onClose = () => {};
			peerClose.close();
		}
	}
	setOnOpne(callback) {
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
		this.WebRTCPeer.send(msg);
	}
	getSdp() {
		return this.WebRTCPeer ? this.WebRTCPeer.sdp : this.WebRTCPeerOffer.sdp;
	}
	async answer(sdp) {
		if (await this.init()) {
			const hash = await Hasher.digest(sdp);
			this.peerMap[hash] = this.WebRTCPeerAnswer;
			this.WebRTCPeerCurrent = this.WebRTCPeerAnswer;
			return await this.WebRTCPeerAnswer.setOfferAndAswer(sdp);
		}
	}
	async connect(sdp, func) {
		const hash = await Hasher.digest(sdp);
		this.peerMap[hash] = this.WebRTCPeerOffer;
		this.WebRTCPeerCurrent = this.WebRTCPeerOffer;
		const result = await this.WebRTCPeerOffer.setAnswer(sdp).catch(ef);
		if (result && func) {
			this.setOnCandidates(func);
		}
		return result;
	}
	async setOnCandidates(func) {
		if (await this.init()) {
			let count = 1;
			while (count < 100) {
				await sleep(20 * count);
				count += 1;
				if (!this.WebRTCPeerCurrent) {
					continue;
				}
				const candidates = this.WebRTCPeerCurrent.getCandidates();
				console.log(`WebRTCConnecter setOnCandidates count:${count}/candidates:${candidates}`);
				if (Array.isArray(candidates) && candidates.length > 0) {
					func(candidates);
					break;
				}
			}
		}
	}
	async setCandidates(candidatesInput) {
		const candidates = typeof candidatesInput === 'object' ? candidatesInput : JSON.parse(candidatesInput);
		if (!Array.isArray(candidates)) {
			return `setCandidates candidates:${candidates}`;
		}
		this.WebRTCPeerCurrent.setCandidates(candidates);
	}
	close() {
		this.WebRTCPeerOffer.close();
		this.WebRTCPeerAnswer.close();
	}
}
const addOption = { optional: [{ DtlsSrtpKeyAgreement: true }, { RtpDataChannels: true }] };
export class WebRTCPeer {
	constructor(name, stunServers) {
		this.name = name;
		this.peer = null;
		this.isOpend = false;
		this.candidates = [];
		this.config = { iceServers: stunServers };
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
					this.sdp = peer.localDescription;
					resolve(peer);
				} catch (e) {
					reject(e);
					console.error(`WebRTCPeer setLocalDescription(offer) ERROR: ${e}`);
					ef(e);
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
	dataChannelSetup(dataChannel) {
		dataChannel.onerror = (error) => {
			console.log('WebRTCPeer Data Channel Error:', error);
			this.onError(error);
		};
		dataChannel.onmessage = (event) => {
			console.log('WebRTCPeer Got Data Channel Message:', event.data);
			this.onMessage(event.data);
		};
		dataChannel.onopen = (event) => {
			dataChannel.send('WebRTCPeer dataChannel Hello World! OPEN SUCCESS!');
			this.isOpend = true;
			this.onOpen(event);
		};
		dataChannel.onclose = () => {
			console.log('WebRTCPeer The Data Channel is Closed');
			this.isOpend = false;
			this.onClose();
		};
		this.dataChannel = dataChannel;
	}
	// sendSdp(sessionDescription) {
	// 	console.log(`---sending sdp ---${sessionDescription.sdp}`);
	// }
	async makeOffer() {
		console.log('-WebRTCPeer-makeOffer--1----------WebRTCPeer--------------------------------------');
		this.peer = await this.prepareNewConnection(true);
		console.log('-WebRTCPeer-makeOffer--2----------WebRTCPeer--------------------------------------');
		return true;
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
			ef(e);
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
			ef(e);
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
	send(msg) {
		this.dataChannel.send(msg);
	}
	close() {
		if (this.peer) {
			if (this.peer.iceConnectionState !== 'closed') {
				this.peer.close();
				this.peer = null;
			}
		}
		console.log('WebRTCPeer peerConnection is closed.');
	}
	getCandidates() {
		return this.candidates;
	}
	async setCandidates(candidates, id) {
		for (const candidate of candidates) {
			console.log(`WebRTCPeer setCandidates candidate:${candidate} ${JSON.stringify(candidate)}`);
			this.peer.addIceCandidate(candidate).catch((e) => {
				ef(e, id);
			});
		}
	}
}

//////Hash Core///////////////////////////////////////////////
export class Hasher {
	static async digest(message, stretchCount = 1, algo = 'SHA-256') {
		let result = te.encode(message);
		for (let i = 0; i < stretchCount; i++) {
			result = await window.crypto.subtle.digest(algo, result);
		}
		return this.ab2Base64Url(result);
	}
	static ab2Base64Url(abInput) {
		const ab = abInput.buffer ? abInput.buffer : abInput;
		const base64 = window.btoa(Hasher.arrayBuffer2BinaryString(new Uint8ClampedArray(ab)));
		return base64 ? base64.split('+').join('-').split('/').join('_').split('=').join('') : base64;
	}
	static arrayBuffer2BinaryString(u8a) {
		const retList = [];
		for (const e of u8a) {
			retList.push(String.fromCharCode(e));
		}
		return retList.join('');
	}
}
