const te = new TextEncoder('utf-8');
const td = new TextDecoder('utf-8');
const OF = '_OFFER';
const AN = '_ANSWER';
const SleepMs = 100;
const WAIT = 'wait';
const WAIT_AUTO_INTERVAL = 1000 * 20;
const WAIT_AUTO_INTERVAL_2 = 1000 * 10 + Math.random() * 15000;
const HASH_SCRATCH_COUNT = 12201;
const NULL_ARR = [null];
const contentType = 'application/x-www-form-urlencoded';
const J = JSON;
const SALT =
	'メロスは激怒した。必ず、かの邪智暴虐じゃちぼうぎゃくの王を除かなければならぬと決意した。メロスには政治がわからぬ。メロスは、村の牧人である。笛を吹き、羊と遊んで暮して来た。けれども邪悪に対しては、人一倍に敏感であった。';
///////////////////////////
const now = () => Date.now();
const ef = (e, id = '', l = null) => {
	console.warn(`${id} ${e.message}`);
	console.warn(e.stack);
	if (l && l.log && l !== console) {
		l.log(`${id} ${e.message}`);
		l.log(e.stack);
	}
};
function getEF(id, l) {
	return (e) => {
		ef(e, id, l);
	};
}
function sleep(ms = SleepMs) {
	return new Promise((r) => {
		setTimeout(() => {
			r();
		}, ms);
	});
}
function decode(d, id, l) {
	try {
		const o = typeof d === 'string' ? J.parse(d) : d;
		const r = o && o.message ? o.message : null;
		return r;
	} catch (e) {
		ef(e, id, l);
	}
	return null;
}
async function mkHash(
	s = [location.origin, navigator.userAgent, now()],
	st = Math.floor(Math.random() * 100) + (now() % 100) + 1
) {
	return await H.d(J.stringify(s), st);
}
async function dcb(e, g, t) {
	return e + g + t;
}
///////////////////////////
export class ESWebRTCConnecterU {
	#i = null;
	constructor(
		l = console,
		onRecive = (tdn, m) => {
			console.log(`ESWebRTCConnecterU targetDeviceName:${tdn},msg:${m}`);
		}
	) {
		this.#i = new M(l, onRecive);
	}
	async init(u, g, p, dn) {
		await this.#i.init(u, g, p, dn);
	}
	setOnOpenFunc(fn = dcb) {
		this.#i.onOpenFunc = fn;
	}
	setOnCloseFunc(fn = dcb) {
		this.#i.onCloseFunc = fn;
	}
	async startWaitAutoConnect() {
		await this.#i.startWaitAutoConn();
	}
	async stopWaitAutoConnect() {
		await this.#i.stopWaitAutoConn();
	}
	closeAll() {
		this.#i.closeAll();
	}
	close(tsh) {
		this.#i.close(tsh);
	}
	sendBigMessage(tsh, name, type, ab) {
		this.#i.sendBigMsg(tsh, name, type, ab);
	}
	broadcastBigMessage(m) {
		this.#i.broadcastBigMsg(m);
	}
	sendMessage(tsh, m) {
		this.#i.sendMsg(tsh, m);
	}
	broadcastMessage(m) {
		this.#i.broadcastMsg(m);
	}
	async request(tsh, kp = '/', t = 'GET', m) {
		return await this.#i.req(tsh, kp, t, m);
	}
	setOnRequest(
		cb = async (kp, t, d) => {
			console.log(`keyPath:${kp}/type:${t}`, d);
			return d;
		}
	) {
		this.#i.setOnReq(cb);
	}
	tranTest(l, name, type, ab) {
		const func = async (r) => {
			const i = new M(l, (tdn, m) => {
				console.log('tranTest ESWebRTCConnecterUnit cb onRcvCB msg:', m);
				const rab = m.ab;
				console.log('tranTest ESWebRTCConnecterUnit cb onRcvCB resAb:', rab);
				if (tdn === 'test' && B64U.ab2B64(rab) === B64U.ab2B64(ab)) {
					r('OK');
				}
			});
			await i.init('', 'test', 'test', 'test');
			i.req('test', name, ab);
		};
		return new Promise(func);
	}
}
///////////////////////////
class M {
	constructor(
		l = console,
		onRcv = (tdn, m) => {
			console.log(`ESWebRTCConnecterUnit targetDeviceName:${tdn},msg:${m}`);
		}
	) {
		this.l = l;
		this.l.log('ESWebRTCConnecterU');
		this.c = {};
		this.threads = [];
		this.confs = {};
		this.connections = {};
		this.onRcvCB = onRcv;
		this.ESBigSendDAdoptor = new A(onRcv);
	}
	async init(u, g, p, dn, salt = SALT) {
		this.l.log('ESWebRTCConnecterU INIT START');
		this.url = u;
		this.group = g;
		this.passwd = p;
		this.deviceName = dn;
		this.hash = await mkHash([u, g, p, dn], HASH_SCRATCH_COUNT);
		this.singHash = await mkHash([u, g, p, salt], HASH_SCRATCH_COUNT);
		this.groupHash = await mkHash([u, g, p, salt], HASH_SCRATCH_COUNT);
		this.nowHash = await mkHash([now(), u, g, p, dn, salt], HASH_SCRATCH_COUNT);
		this.signalingHash = await this.encrypt({ hash: this.nowHash, group: g, deviceName: dn });
		this.l.log(`ESWebRTCConnecterU INIT END this.hash:${this.hash} deviceName:${dn}`);
		this.reqMap = new Map();
	}
	async encrypt(o, k = this.singHash) {
		return await Cy.encodeStrAES256GCM(J.stringify(o), k);
	}
	async decrypt(es, k = this.singHash) {
		try {
			const ds = await Cy.decodeAES256GCMasStr(es, k);
			return J.parse(ds);
		} catch (e) {
			ef(e, es, this.l);
		}
		return null;
	}
	async startWaitAutoConn() {
		await this.inited;
		this.isStopAuto = false;
		let c = 3;
		this.isWaiting = false;
		let isFirst = true;
		while (this.isStopAuto === false) {
			const gh = this.groupHash;
			await sleep(WAIT_AUTO_INTERVAL / 5);
			if (!gh) {
				continue;
			}
			if (c === 0 || isFirst) {
				await this.sendWait(gh);
				isFirst = false;
				c = 3;
			} else {
				c--;
			}
			const l = await this.getWaitList(gh);
			if (!Array.isArray(l)) {
				continue;
			}
			this.l.log(l);
			const n = now();
			for (const r of l) {
				const diff = n - r.expire;
				if (diff > 10000) {
					// console.log(`■ESWebRTCConnecterU startWaitAutoConnect continue diff:${diff}`, r);
					continue;
				}
				const v = r.value && typeof r.value === 'string' ? J.parse(r.value) : r.value;
				// console.log(
				// 	`■ESWebRTCConnecterU startWaitAutoConnect diff:${diff} ${
				// 		v.hash !== this.signalingHash
				// 	}/${v.hash.indexOf(this.signalingHash)}`,
				// 	v
				// );
				if (v.hash !== this.signalingHash && v.hash.indexOf(this.signalingHash) !== 0) {
					// console.log(
					// 	`■ESWebRTCConnecterU startWaitAutoConnect sendWaitNotify group:${groupHash}/${this.group}`
					// );
					await this.onCatchAnother(gh, n, v.hash, this.group); //v.hash===tsh
					break;
				}
			}
		}
	}
	async onCatchAnother(gh, now, h, g) {
		const hs = h.split('/');
		// console.log(`■ESWebRTCConnecterU onCatchAnother hashSplit group:${hash}`, hs);
		const tsh = h.indexOf(this.signalingHash) < 0 ? h : hs[1] !== this.signalingHash ? hs[1] : hs[2];
		const conf = await this.getConf(gh, tsh, g);
		if (!conf || this.isOpend(conf)) {
			return;
		}
		await this.sendWaitNotify(gh, tsh);
		const l = await this.getWaitList(gh);
		if (!Array.isArray(l) || l.length < 1) {
			return;
		}
		let isHotStamdby = false;
		const tl = [];
		const len = this.signalingHash.length;
		const tlen = tsh.length;
		const a = len + tlen;
		for (const r of l) {
			const v = r.value && typeof r.value === 'string' ? J.parse(r.value) : r.value;
			if (r.expire < now || v.hash.length < a) {
				continue;
			}
			tl.push(J.stringify([r.expire, v.hash]));
		}
		if (tl.length < 1) {
			return;
		}
		tl.sort();
		tl.reverse();
		let isOffer = false;
		let rc = 0;
		for (const t of tl) {
			const h = J.parse(t)[1];
			if (h.indexOf(this.signalingHash) === 1 && h.indexOf(tsh) >= tlen) {
				isOffer = true;
				rc++;
			}
			if (h.indexOf(this.signalingHash) >= len && h.indexOf(tsh) === 1) {
				isOffer = false;
				rc++;
			}
			if (rc >= 2) {
				break;
			}
		}
		this.startNego(conf).catch(getEF(now, this.l));
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
	async sendWait(gh) {
		await this.post(
			gh,
			{ msg: WAIT, hash: this.signalingHash, expire: now() + WAIT_AUTO_INTERVAL_2 + WAIT_AUTO_INTERVAL / 5 },
			WAIT
		);
	}
	async sendWaitNotify(gh, tsh) {
		await this.post(
			gh,
			{
				msg: WAIT,
				hash: `/${this.signalingHash}/${tsh}`,
				expire: now() + WAIT_AUTO_INTERVAL_2 + WAIT_AUTO_INTERVAL / 5,
			},
			WAIT
		);
	}
	async getWaitList(gh) {
		const d = await this.load(gh, WAIT);
		const o = d ? J.parse(d) : null;
		return o ? o.message : null;
	}
	isOpend(conf) {
		const i = conf.w.isOpened();
		this.l.log(`◆◆ESWebRTCConnecterU isOpend conf.w.isOpend:${i}:${conf.target}`);
		return i;
	}
	async startNego(conf) {
		conf.isStop = false;
		setTimeout(U.getStopFn(conf), WAIT_AUTO_INTERVAL);
		while (conf.isStop === false && this.isStopAuto === false) {
			setTimeout(() => {
				if (conf.isAns) {
					return;
				} else if (this.threads.length < 4) {
					this.threads.push(1);
				} else {
					return;
				}
				this.load(conf.pxOs).then(async (data) => {
					const cacheKey = await H.d(conf.pxOs + data);
					this.threads.pop(1);
					const d = decode(data, conf.id, this.l);
					// this.l.log('ESWebRTCConnecterU=ANSWER====data:', data);
					if (d && !conf.cache[cacheKey]) {
						conf.cache[cacheKey] = 1;
						this.listener(conf, OF, d);
					}
				});
			}, SleepMs);
			setTimeout(() => {
				if (!conf.isAns) {
					return;
				} else if (this.threads.length < 4) {
					this.threads.push(1);
				} else {
					return;
				}
				this.load(conf.pxAs).then(async (data) => {
					const cacheKey = await H.d(conf.pxAs + data);
					this.threads.pop(1);
					const d = decode(data, conf.id, this.l);
					// this.l.log('ESWebRTCConnecterU=OFFER====data:', data);
					if (d && !conf.cache[cacheKey]) {
						conf.cache[cacheKey] = 1;
						this.listener(conf, AN, d);
					}
				});
			}, SleepMs);
			await sleep();
		}
		this.resetConf(conf);
	}
	async stopWaitAutoConn() {
		for (const k in this.confs) {
			this.confs[k].isStop = true;
		}
		this.isStopAuto = true;
		for (const k in this.confs) {
			this.confs[k].isStop = true;
		}
		await sleep(Math.floor(Math.random() * 1000) + 2500);
		for (const k in this.confs) {
			this.resetConf(this.confs[k]);
		}
	}
	async offer(conf) {
		conf.isAns = false;
		const o = await conf.w.getOfferSdp();
		this.l.log('ESWebRTCConnecterU setOnRecieve OFFER post offer:', o);
		await this.post(conf.pxAt, await this.encrypt(o, conf.nowHashKey));
	}
	async post(g, o, cmd = 'g') {
		const n = now();
		const d = await GA.postToGAS(this.url, {
			group: g,
			cmd,
			data: typeof o !== 'string' ? J.stringify(o) : o,
		});
		this.l.log(`ESWebRTCConnecterU================post=================${g}/${cmd} d:${now() - n} data:`, d);
	}
	async load(g, cmd = 'g') {
		const n = now();
		const k = `${n}_${Math.floor(Math.random() * 1000)}`;
		const d = await GA.getTextGAS(this.url, { group: g, cmd });
		this.l.log(`ESWebRTCConnecterU==${k}==============load========${g}/${cmd} ========${now() - n} data:`, d);
		return d;
	}
	async getConKey(gh, signalingHash) {
		const obj = signalingHash === 'test' ? { deviceName: 'test' } : await this.decrypt(signalingHash);
		return [J.stringify([gh, obj ? obj.deviceName : null]), obj];
	}
	async getConf(gh, tsh, g) {
		const [k, oT] = await this.getConKey(gh, tsh);
		if (!oT) {
			return null;
		}
		const [s] = await this.getConKey(gh, this.signalingHash);
		let conf = this.confs[k];
		const tdn = oT.deviceName;
		if (!conf) {
			conf = {
				targetDeviceName: tdn,
				isAns: true,
				isGetFirst: false,
				isExcangedCandidates: false,
				pxAt: k + AN,
				pxOt: k + OF,
				pxAs: s + AN,
				pxOs: s + OF,
				isStop: false,
				cache: {},
				id: `${now()} ${this.deviceName}`,
			};
			conf.w = new WebRTCConnecter(this.l, tsh === 'test');
			conf.w.setOnMsg(async (m) => {
				console.log('conf.w.setOnMessage((msg):', m);
				await this.onMsgByConf(conf, tdn, tsh, m);
			});
			conf.w.setOnOpen((e) => {
				this.l.log(`############★###OPEN！###★###############targetDeviceName:${tdn}`, oT);
				this.onOpenFunc(e, g, tsh, tdn);
				conf.isStop = true;
			});
			conf.w.setOnClose((e) => {
				this.l.log(`############☆###CLOSE###☆###############targetDeviceName:${tdn}`);
				this.onCloseFunc(e, g, tsh, tdn);
				conf.isStop = false;
			});
			this.confs[k] = conf;
		}
		conf.nowHashKey = oT.nowHash;
		return conf;
	}
	async onMsgByConf(conf, tdn, tsh, m) {
		const ab =
			m instanceof Blob
				? await B64U.blob2ab(m)
				: m.buffer && m.buffer.byteLength
				? m.buffer
				: m.byteLength
				? m
				: null;
		const dU8A = this.ESBigSendDAdoptor.getBigSendDResFormat(tdn, ab);
		if (dU8A) {
			console.log('☆onMessageByConf A conf.w.setOnMessage((msg):to onReciveBigDResponse dU8A', dU8A, m);
			await this.onRcvBigDRes(conf, tdn, dU8A);
		} else if (await this.ESBigSendDAdoptor.isBigSendD(ab, tdn)) {
			console.log('☆onMessageByConf B conf.w.setOnMessage((msg):to onReciveBigD ab', ab, m);
			await this.onRcvBigD(conf, tdn, ab, tsh);
		} else if (!ab && typeof m === 'string') {
			console.log('☆onMessageByConf C conf.w.setOnMessage((msg):to onRcvCB', m);
			this.onRcvCB(tdn, m);
		} else {
			console.log('☆onMessageByConf D conf.w.setOnMessage((msg):to onRcvCB', m);
			this.onRcvCB(tdn, { ab });
		}
	}
	resetConf(conf) {
		conf.isAns = true;
		conf.isGetFirst = false;
		conf.isExcangedCandidates = false;
		conf.isStop = false;
		const ckeys = Object.keys(conf.cache);
		for (const key of ckeys) {
			delete conf.cache[key];
		}
	}
	async listener(conf, px, ve) {
		const v = await this.decrypt(ve, this.nowHash);
		this.l.log(
			`ESWebRTCConnecterU==============LISTENER==RECEIVE=A================px:${px}/${
				px === AN
			}//value:${v}/conf.isAns:${conf.isAns}/!conf.isGetFirst:${!conf.isGetFirst}/conf.isExcangedCandidates:${
				conf.isExcangedCandidates
			}`
		);
		if (conf.w.isOpend || conf.isStop || v === true || v === null || v === 'null') {
			this.l.log(
				`ESWebRTCConnecterU==============LISTENER==END=================value:${v}/conf.isStop:${conf.isStop}`
			);
			return;
		}
		if (conf.isAns && px === AN) {
			this.l.log(
				`ESWebRTCConnecterU A AS ANSWER conf.isAns:${conf.isAns} A px:${px} conf.isGetFirst:${conf.isGetFirst}`
			);
			if (!conf.isGetFirst) {
				const a = await this.ans(conf, v);
				this.l.log(
					`ESWebRTCConnecterU==============LISTENER==answer=A================typeof answer :${typeof a}`,
					a
				);
				await this.post(conf.pxOt, await this.encrypt(a, conf.nowHashKey));
				conf.isGetFirst = true;
				// console.warn('★★ANSWER conf.isGetFirst = true;');
			} else if (!conf.isExcangedCandidates) {
				conf.isExcangedCandidates = true;
				const cs = conf.w.setCandidates(typeof v === 'string' ? J.parse(v) : v, now());
				this.l.log('ESWebRTCConnecterU==============LISTENER==answer candidats=A================', cs);
			}
		} else if (!conf.isAns && px === OF) {
			this.l.log(
				`ESWebRTCConnecterU B AS OFFER conf.isAns:${conf.isAns}/B px:${px}/!conf.isGetFirst:${!conf.isGetFirst}`
			);
			if (!conf.isGetFirst) {
				const cs = await this.conn(conf, v);
				this.l.log('ESWebRTCConnecterU==============LISTENER==make offer candidates=A================', cs);
				conf.isGetFirst = true;
				// console.warn('★★★OFFER conf.isGetFirst = true;');
				await this.post(conf.pxAt, await this.encrypt(cs, conf.nowHashKey));
			} else if (!conf.isExcangedCandidates) {
				conf.isExcangedCandidates = true;
				const cs = v ? conf.w.setCandidates(typeof v === 'string' ? J.parse(v) : v, now()) : null;
				this.l.log('ESWebRTCConnecterU==============LISTENER==set offer candidats=A================', cs);
			}
		}
	}
	async ans(conf, osi) {
		setTimeout(async () => {
			if (conf.isStop) {
				return;
			}
			const cs = await conf.w.connAns();
			while (!conf.isGetFirst) {
				await sleep(Math.floor(Math.random() * 200) + 50);
			}
			await this.post(conf.pxOt, await this.encrypt(cs, conf.nowHashKey));
		});
		if (conf.isStop) {
			return;
		}
		return await conf.w.ans(U.parseSdp(osi, this.l));
	}
	conn(conf, si) {
		if (conf.isStop) {
			return;
		}
		const fn = async (r) => {
			if (conf.isStop) {
				return;
			}
			return await conf.w.conn(U.parseSdp(si, this.l), (cs) => {
				r(cs);
			});
		};
		return new Promise(fn);
	}
	/////////////////////////////////////////////////////////////////
	closeAll() {
		for (const k in this.confs) {
			const c = this.confs[k];
			if (c && c.w && c.w.isOpend) {
				c.w.close();
				this.resetConf(c);
			}
		}
	}
	async close(tsh) {
		const c = await this.getConf(this.groupHash, tsh, this.group);
		if (c && c.w && c.w.isOpend) {
			c.w.close();
			this.resetConf(c);
		}
	}
	/////////////////////////////////////////////////////////////////
	async sendBigMsg(tsh, n, t, ab) {
		return await this.ESBigSendDAdoptor.sendBigD(
			await this.getConf(this.groupHash, tsh, this.group),
			n,
			t,
			ab,
			this.l
		);
	}
	async broadcastBigMsg(n, t, ab) {
		const ps = [];
		for (const k in this.confs) {
			ps.push(this.ESBigSendDAdoptor.sendBigD(this.confs[k], n, t, ab, this.l));
		}
		return Promise.all(ps);
	}
	/////////////////////////////////////////////////////////////////
	async sendMsg(tsh, m) {
		U.sendOnDC(await this.getConf(this.groupHash, tsh, this.group), m, this.l);
	}
	broadcastMsg(m) {
		for (const k in this.confs) {
			U.sendOnDC(this.confs[k], m, this.l);
		}
	}
	async onRcvBigD(conf, tdn, m, tsh) {
		const { files, isComple, res } = await this.ESBigSendDAdoptor.rcvBigSendD(conf, m);
		console.log(
			`☆ ESWebRTCConnecterU onReciveBigD A Array.isArray(files):${Array.isArray(files)}/isComple:${isComple}`,
			res
		);
		if (isComple && Array.isArray(files)) {
			console.log(
				`☆ ESWebRTCConnecterU onReciveBigD B files.byteLength:${files.byteLength}/isComple:${isComple}`
			);
			for (const f of files) {
				console.log(`☆ ESWebRTCConnecterU onReciveBigD C file${f}/isComple:${isComple}`, f);
				if (this.ESBigSendDAdoptor.isReq(f)) {
					console.log(`☆ ESWebRTCConnecterU onReciveBigD D file${f}/isComple:${isComple}`);
					return await this.onReqData(tdn, f, tsh);
				} else if (this.ESBigSendDAdoptor.isRes(f)) {
					console.log(`☆ ESWebRTCConnecterU onReciveBigD E file${f}/isComple:${isComple}`);
					return await this.onRes(tdn, f);
				}
				console.log(`☆ ESWebRTCConnecterU onReciveBigD F file${f}/isComple:${isComple}`);
			}
			console.log(`☆ ESWebRTCConnecterU onReciveBigD G files:${files}/isComple:${isComple}`);
			this.onRcvCB(tdn, files);
		}
		return [];
	}
	async onReqData(tdn, f, tsh) {
		const ts = f.type.split('/');
		const PQ = ts.shift();
		const h = ts.pop();
		const t = ts.join('/');
		const { key, type, result, status } = await this.onReq(tdn, f.name, t, f.data);
		const nt = [PQ, status, type, h].join('/');
		return await this.sendBigMsg(tsh, key, this.ESBigSendDAdoptor.cnvtTypeToRes(nt), result);
	}
	async onRcvBigDRes(conf, tdn, dU8A) {
		if (this.ESBigSendDAdoptor.isComplBigSendDRes(dU8A)) {
			return await this.ESBigSendDAdoptor.rcvBigSendDCompl(dU8A);
		} else if (this.ESBigSendDAdoptor.isBigSendDRes(dU8A)) {
			return await this.ESBigSendDAdoptor.rcvBigSendDRes(dU8A);
		}
		return null;
	}
	/////////////////////////////////////////////////////////////////
	req(tsh, kp, t, m) {
		const fn = async (r) => {
			const ab =
				typeof m === 'string'
					? B64U.str2u8a(m)
					: m.byteLength
					? m
					: m.buffer
					? m.buffer
					: B64U.str2u8a(J.stringify(m));
			const h = await H.d(now() + Math.random() + tsh + kp + SALT + t);
			const th = m.byteLength ? 'arraybuffer' : m.buffer ? 'typedarray' : typeof m;
			const nt = `${BSU.REQUEST_HEADER}${th}/${h}`; // PorQ/type/hash
			this.reqMap.set(h, r);
			setTimeout(() => {
				this.reqMap.delete(h);
				r(BSU.TIME_OUT);
			}, BSU.MAX_WAIT_MS);
			const conf = await this.getConf(this.groupHash, tsh, this.group);
			return await this.ESBigSendDAdoptor.sendBigD(conf, kp, nt, ab, this.l);
		};
		return new Promise(fn);
	}
	onRes(tdn, f) {
		const ts = f.type.split('/');
		const status = ts.shift();
		const h = ts.pop();
		const r = this.reqMap.get(h);
		const tm = ts.join('/');
		if (!r) {
			console.log('onRespons resolve:', r);
		}
		r(tdn, f.name, tm, f.data, status);
	}
	setOnReq(
		cb = async (k, t, d) => {
			console.log(`key:${k}/type:${t}`, d);
			return { key: k, type: t, result: d, status: 404 };
		}
	) {
		this.onReq = cb;
	}
}
class A {
	constructor(onComplCB) {
		this.sendM = new Map();
		this.recieveMap = new Map();
		this.onComplCB = onComplCB;
	}
	isReq(f) {
		return (
			f &&
			f.type &&
			f.type.indexOf(BSU.REQUEST_HEADER) === 0 &&
			f.type.split('/').length >= 3 &&
			B64U.isB64(f.type.split('/').pop())
		);
	}
	isRes(f) {
		return (
			f &&
			f.type &&
			f.type.indexOf(BSU.RESPONSE_HEADER) === 0 &&
			f.type.split('/').length >= 3 &&
			B64U.isB64(f.type.split('/').pop())
		);
	}
	cnvtTypeToRes(t) {
		return t ? (t.indexOf(BSU.REQUEST_HEADER) === 0 ? t.replace(BSU.REQUEST_HEADER, BSU.RESPONSE_HEADER) : t) : t;
	}
	async isBigSendD(d, dn) {
		const M = BSU.MIN;
		console.log(`☆☆ESBigSendDAdoptor isBigSendD A deviceName:${dn}/MIN:${M}`, d);
		if (
			!d ||
			typeof d === 'string' ||
			(!d.byteLength && !d.buffer) ||
			(!d.buffer && d.byteLength < M) ||
			(d.buffer && d.buffer.byteLength < M)
		) {
			return false; // 1,256/8=32byte,data
		}
		const dnU8A = B64U.str2u8a(dn);
		console.log(`☆☆ESBigSendDAdoptor isBigSendD B deviceName:${dn}`, dnU8A);
		const f1 = dnU8A[0] * 1;
		const dU8A = d.byteLength && d.byteLength > 0 ? B.u8a(d) : d.buffer ? B.u8a(d.buffer) : NULL_ARR;
		console.log(
			`☆☆ESBigSendDAdoptor isBigSendD C data.byteLength:${d.byteLength}/f1:${f1}/dU8A[0]:${dU8A[0]}`,
			dU8A
		);
		if (f1 !== dU8A[0] * 1) {
			console.log(
				`☆☆ESBigSendDAdoptor isBigSendD C1 data.byteLength:${d.byteLength}/f1:${f1}/dU8A[0]:${
					dU8A[0]
				}/type:${typeof f1}`
			);
			return false;
		}
		const hU8A = dU8A.subarray(1, 33);
		const dhU8A = dU8A.subarray(33); //index,signAll,data
		const h = B64U.ab2B64(await H.d(dhU8A, 1, undefined, true));
		const hB64 = B64U.u8a2B64(hU8A);
		const r = hB64 === h;
		console.log(
			`☆☆ESBigSendDAdoptor isBigSendD D data.byteLength:${d.byteLength}/hU8A:${hU8A}/result:${r}/hB64:${hB64}/hash:${h}/dhU8A:`,
			dhU8A
		);
		return r;
	}
	async sendBigD(conf, n, t, ab, l = console) {
		l.log(`★★ESBigSendDAdoptor sendBigD A sendMessage msg:${ab}/${conf.w}/${conf.w.isOpend}`);
		if (!conf || !conf.w || !conf.w.isOpend) {
			return;
		}
		const w = conf.w;
		const dn = conf.targetDeviceName;
		const u8a = B.u8a(ab);
		const { dasendDataAb, signatureU8A, count, f1 } = await BSU.mkBigSendDMeta(u8a, dn, t, n);
		console.log(`★★ESBigSendDAdoptor sendBigD B dasendDataAb:${dasendDataAb}`, dasendDataAb);
		const sB64 = B64U.ab2B64(signatureU8A.buffer);
		const sq = new Map();
		const idx = -1;
		const i = B.i32a(1).fill(idx);
		const rh = B64U.ab2B64(await BSU.mkResAb(f1, B.u8a(dasendDataAb).subarray(69), i.buffer, signatureU8A));
		this.sendM.set(sB64, {
			sq,
			t,
			n,
			byteLength: ab.byteLength,
			status: BSU.SENDING,
		});
		console.log(`★★ESBigSendDAdoptor sendBigD C01 resHashB64:${rh}/i:`, rh);
		const r = await this.snedTran(w, dasendDataAb, rh, sq, idx);
		console.log(`★★ESBigSendDAdoptor sendBigD C02 result:${r}/i:`, i);
		if (r === BSU.COMPLE) {
			return true;
		}
		if (r === BSU.TIME_OUT) {
			return false;
		}
		let of = 0;
		const ps = [];
		for (let i = 0; i < count; i++) {
			console.log(`★★ESBigSendDAdoptor sendBigD D count:${count}/i:${i}/offset:`, of);
			const end = i === count - 1 ? ab.byteLength : of + BSU.SIZE;
			const p = u8a.subarray(of, end);
			ps.push(this.sendTranApart(w, p, f1, signatureU8A, sq, i));
			of = of += BSU.SIZE;
		}
		await Promise.all(ps);
		console.log(`★★ESBigSendDAdoptor sendBigD E result:${r}`, r);
	}
	async sendTranApart(w, p, f1, sU8A, sq, idx) {
		const i = B.i32a(1);
		i.fill(idx);
		console.log(`★★★ESBigSendDAdoptor sendTranApart A index:${idx}`, i);
		const rh = B64U.u8a2B64(await BSU.mkResAb(f1, p, i.buffer, sU8A));
		const sAB = await BSU.mkBigSendD(p, f1, sU8A, idx);
		console.log(`★★★ESBigSendDAdoptor sendTranApart B resHashB64:${rh}`, rh);
		console.log(`★★★ESBigSendDAdoptor sendTranApart C partU8A:${p}`, p);
		console.log(`★★★ESBigSendDAdoptor sendTranApart D signatureU8A:${sU8A}`, sU8A);
		let isSendOK = false;
		let isCmp = false;
		while (isSendOK === false) {
			const r = await this.snedTran(w, sAB, rh, sq, idx);
			console.log(`★★★ESBigSendDAdoptor sendTranApart E index:${idx}/result:${r}`, p);
			if (r === BSU.COMPLE) {
				isSendOK = true;
				isCmp = true;
			}
			if (r === BSU.OK) {
				isSendOK = true;
			}
		}
		return isCmp;
	}
	snedTran(w, ab, rh = '', sq = new Map(), index) {
		const tm = sq.has(rh) ? sq.get(rh).tm : null;
		clearTimeout(tm);
		return new Promise((r) => {
			const tm = setTimeout(() => {
				r(BSU.TIME_OUT);
			}, BSU.WAIT_MS);
			sq.set(rh, { index, timer: tm, resolve: r });
			console.log(`★★★★ESBigSendDAdoptor snedTransactional index:${index}/resHashB64:${rh}/ ${ab}`, ab);
			w.send(ab, 'arraybuffer');
		});
	}
	getBigSendDResFormat(dn, d) {
		const M = BSU.MIN;
		console.log(`☆☆ESBigSendDAdoptor A getBigSendDResFormat deviceName:${dn}/data:`, d);
		if (
			d === null ||
			typeof d === 'string' ||
			(!d.byteLength && !d.buffer) ||
			(d.byteLength && d.byteLength < M) ||
			(d.buffer && d.buffer.byteLength < M)
		) {
			return false; // 1,256/8=32byte,data(index4byte,data)
		}
		console.log(`☆☆ESBigSendDAdoptor B getBigSendDResFormat deviceName:${dn}/data:`, d);
		const dnU8A = B64U.str2u8a(dn);
		const f1 = dnU8A[0];
		const dU8A = !Array.isArray(d) && d.byteLength && d.byteLength > 0 ? B.u8a(d) : B.u8a(d.buffer);
		console.log(`☆☆ESBigSendDAdoptor C getBigSendDResFormat f1:${f1}/data:`, d);
		if (f1 !== dU8A[0]) {
			return false;
		}
		// const hashB64 = B64U.u8a2B64(dU8A.subarray(1, 33));
		const idx = B64U.u8a2I32a(dU8A.subarray(33, 37))[0];
		console.log(`☆☆ESBigSendDAdoptor D getBigSendDResFormat index:${idx}/f1:`, f1);
		const sB64 = B64U.u8a2B64(dU8A.subarray(37, 69));
		const m = this.sendM.get(sB64);
		console.log(`☆☆ESBigSendDAdoptor E getBigSendDResFormat signatureB64:${sB64}/m:`, m);
		return m && m.sq && m.byteLength >= idx * BSU.SIZE && idx >= -1 ? dU8A : null;
	}
	isBigSendDRes(dU8A) {
		const h = B64U.u8a2B64(dU8A);
		const i = B64U.u8a2I32a(dU8A.subarray(33, 37))[0];
		const sB64 = B64U.u8a2B64(dU8A.subarray(37, 69));
		const m = this.sendM.get(sB64);
		const sq = m && m.sq ? m.sq : null;
		console.log(
			`☆☆☆☆ESBigSendDAdoptor isBigSendDResponse  A index:${i}/signatureB64:${sB64} /hashB64:${h} sq.get(hashB64):/m:`,
			sq.get(h),
			m
		);
		const t = sq && sq.get(h) ? sq.get(h) : { index: null };
		if (t.index === i) {
			console.log(`☆☆☆☆ESBigSendDAdoptor isBigSendDResponse B index:${i}`);
			clearTimeout(t.timer);
			return true;
		}
		console.log(`☆☆☆☆ESBigSendDAdoptor isBigSendDResponse C index:${i} task:`, t);
		return false;
	}
	isComplBigSendDRes(dU8A) {
		const sB64 = B64U.u8a2B64(dU8A.subarray(37, 69));
		const i = B64U.u8a2I32a(dU8A.subarray(33, 37))[0];
		const s = dU8A[dU8A.length - 1];
		const m = this.sendM.get(sB64);
		console.log(`☆☆☆☆ESBigSendDAdoptor isComplBigSendDRes index:${i}/ESBSU.STATUS[status] :${BSU.STATUS[s]}/m:`, m);
		return Math.ceil(m.byteLength / BSU.SIZE) === i && BSU.STATUS[s] === BSU.COMPLE;
	}
	async rcvBigSendD(conf, dAB) {
		if (!conf || !conf.w || !conf.w.isOpend) {
			return;
		}
		const w = conf.w;
		const u8a = B.u8a(dAB);
		const bU8A = u8a.subarray(33); //index,signAll,data
		const i = B64U.u8a2I32a(bU8A.subarray(0, 4))[0]; //index,signAll,data
		const sB64 = B64U.u8a2B64(bU8A.subarray(4, 36)); //index,signAll,data
		const dU8A = bU8A.subarray(36); //index,signAll,data
		let o = this.recieveMap.get(sB64);
		console.log(`☆☆☆ESBigSendDAdoptor recieveBigSendD A index:${i}/signatureB64:`, sB64);
		if (!o) {
			o = {
				m: [{ type: null, name: null }],
				signature: null,
				byteLength: null,
				count: null,
				counter: 0,
				data: {},
				full: null,
				cmpU64: null,
			};
			this.recieveMap.set(sB64, o);
		}
		console.log(`☆☆☆ESBigSendDAdoptor recieveBigSendD B index:${i}/o:`, o);
		if (i === -1) {
			console.log('☆☆☆ESBigSendDAdoptor recieveBigSendD C B64U.u8a2str(dU8A):', B64U.u8a2str(dU8A));
			const mt = J.parse(B64U.u8a2str(dU8A));
			let isRegisterd = false;
			for (const m of o.m) {
				if (m.name === mt.name && m.type === mt.type) {
					isRegisterd = true;
					break;
				}
			}
			if (!isRegisterd) {
				o.m.push({ name: mt.name, type: mt.type });
				o.signature = mt.signature;
				o.byteLength = mt.byteLength;
				o.count = mt.count;
				const l = Math.ceil(mt.count / 8);
				const cc = B.u8a(l);
				cc.fill(0);
				o.counter = cc;
				const cpc = B.u8a(l);
				cpc.fill(255);
				cpc[cc.length - 1] = mt.count % 8 ? Math.pow(2, mt.count % 8) - 1 : 255;
				o.cmpU64 = B64U.u8a2B64(cpc);
			}
		} else {
			const ci = Math.floor(i / 8);
			o.counter[ci] = o.counter[ci] | (1 << i % 8);
			const idx = (2147483648 + i).toFixed();
			o.data[idx] = dU8A;
		}
		console.log(`☆☆☆ESBigSendDAdoptor recieveBigSendD D index:${i}/m o.counter:${o.counter}/o.data:`, o.data);
		console.log(
			`☆☆☆ESBigSendDAdoptor recieveBigSendD E index:${i}/B64U.u8a2Base64(o.counter):${B64U.u8a2B64(
				o.counter
			)}/o.counter:`,
			o.counter
		);
		const isCmp = o.cmpU64 === B64U.u8a2B64(o.counter);
		console.log(`☆☆☆ESBigSendDAdoptor recieveBigSendD F index:${i}/o.cmpU64:${o.cmpU64}/isComple:`, isCmp);
		const r0 = await BSU.mkBigSendDRes(dAB, i);
		console.log(`☆☆☆ESBigSendDAdoptor recieveBigSendD G index:${i}/res:`, r0);
		w.send(r0.buffer, 'arraybuffer');
		if (isCmp) {
			console.log(`☆☆☆ESBigSendDAdoptor recieveBigSendD H index:${i}/isComple:`, isCmp);
			const { united, isValid } = await BSU.unitData(o);
			const r1 = await BSU.mkBigSendDRes(dAB, o.count + 1, isValid ? BSU.COMPLE : BSU.NG);
			w.send(r1.buffer, 'arraybuffer');
			console.log(
				`☆☆☆ESBigSendDAdoptor recieveBigSendD I index:${i}/isComple:${isCmp}/isValid:${isValid}/united:`,
				united
			);
			if (isValid) {
				console.log(`☆☆☆ESBigSendDAdoptor recieveBigSendD J index:${i}/isValid:`, isValid);
				const fs = [];
				for (const m of o.m) {
					if (!m.type && !m.name) {
						continue;
					}
					const type = [m.type].join('/');
					fs.push({ name: m.name, type, data: united });
				}
				return { files: fs, isComple: isCmp, res: r1 };
			}
		}
		console.log(`☆☆☆ESBigSendDAdoptor recieveBigSendD K index:${i}/isComple:${isCmp}/res:`, r0);
		return { res: r0, isComple: isCmp };
	}
	async rcvBigSendDRes(dU8A) {
		const li = dU8A.length - 1;
		console.log(`☆☆☆☆ESBigSendDAdoptor recieveBigSendDRes A lastIndex:${li}`);
		const status = BSU.STATUS[dU8A[li]];
		dU8A[li] = BSU.STATUS.indexOf(BSU.OK);
		const h = B64U.u8a2B64(dU8A);
		const sB64 = B64U.u8a2B64(dU8A.subarray(37, 69));
		const m = this.sendM.get(sB64);
		const t = m && m.sq && m.sq.get(h) ? m.sq.get(h) : { index: null };
		const r = t.resolve;
		if (typeof r === 'function') {
			r(status);
			return true;
		}
		return false;
	}
	async rcvBigSendDCompl(dU8A) {
		const sB64 = B64U.u8a2B64(dU8A.subarray(37, 69));
		const m = this.sendM.get(sB64);
		if (m && m.sq) {
			const sq = m.sq;
			for (const [k, v] of sq) {
				if (typeof v === 'function') {
					v(BSU.COMPLE);
				}
				sq.delete(k);
			}
		}
	}
	//////////////////////////////////////////////////
}
class BSU {
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
	static STATUS = [BSU.TIME_OUT, BSU.OK, BSU.NG, BSU.COMPLE, BSU.SENDING];
	static async mkBigSendDMeta(d, dn, t, name) {
		const dnU8A = B64U.str2u8a(dn);
		const f1 = B.u8a(1).fill(dnU8A[0]);
		const bl = d.buffer.byteLength;
		const c = Math.ceil(bl / BSU.SIZE);
		const I1 = B.i32a(1).fill(-1);
		const s = await H.d(d); //BASE64
		// console.log('□□ESBigSendUtil makeBigSendDMeta 6 signature:', s);
		const sU8A = B.u8a(B64U.b64u2ab(s));
		// console.log(`□□ESBigSendUtil makeBigSendDMeta 7 signatureU8A:${sU8A.length}`, sU8A);
		const j = J.stringify({ type: t, name, signature: s, byteLength: bl, count: c });
		// console.log('□□ESBigSendUtil makeBigSendDMeta 8 json:', j);
		const u8a = B64U.joinU8as([B.u8a(I1.buffer), sU8A, B64U.str2u8a(j)]); // 4+32=36
		// console.log(`□□ESBigSendUtil makeBigSendDMeta 9 dataU8a:${u8a.length}`, u8a);
		const sAb = await H.d(u8a, 1, undefined, true);
		const r = {
			dasendDataAb: B64U.joinU8as([f1, B.u8a(sAb), u8a]).buffer, // 1+32=33 33+36 = 69
			signatureU8A: sU8A,
			count: c,
			f1,
		}; //d,signature,[index,signAll,data]
		// console.log('□□ESBigSendUtil makeBigSendDMeta A result', r);
		return r;
	}
	static async mkBigSendD(u8a, f1, sU8A, i) {
		const I1 = B.i32a(1).fill(i);
		const dataU8a = B64U.joinU8as([B.u8a(I1.buffer), sU8A, u8a]);
		const signAb = await H.d(dataU8a, 1, undefined, true);
		const dU8A = B64U.joinU8as([f1, B.u8a(signAb), dataU8a]);
		const r = dU8A.buffer; //d,signature,[i,signAll,data]
		//----------------------------------------------
		const dataU8A = dU8A.subarray(33); //i,signAll,data
		console.log(`□□ESBigSendUtil makeBigSendD A01 result dataU8A: ${dataU8A}/`);
		const h = B64U.ab2B64(await H.d(dataU8A, 1, undefined, true));
		console.log(`□□ESBigSendUtil makeBigSendD A02 result hash: ${h}/`);
		const hU8A = dU8A.subarray(1, 33);
		console.log(`□□ESBigSendUtil makeBigSendD A03 result hashU8A: ${hU8A}/`);
		const ab = hU8A.buffer;
		console.log(`□□ESBigSendUtil makeBigSendD A04 result ab: ${ab.byteLength}/`);
		const hB64 = B64U.u8a2B64(hU8A);
		console.log(`□□ESBigSendUtil makeBigSendD A05 result ab: ${ab.byteLength}/`);
		const isMatch = hB64 === h;
		console.log(
			`□□ESBigSendUtil makeBigSendD A result hash: ${h}/${hU8A.length}/###hashU8AB64:${hB64.length}#${hB64}####/isMatch:${isMatch}`,
			hU8A
		);
		//----------------------------------------------

		console.log('□□ESBigSendUtil makeBigSendD A result', r);
		return r;
	}
	static async mkBigSendDRes(d, i = -1, f = BSU.OK) {
		console.log(`☆☆☆☆ ESBSU makeBigSendDResponse A index:${i}/flg:${f}/data:`, d);
		const dU8A = !Array.isArray(d) && d.byteLength && d.byteLength > 0 ? B.u8a(d) : B.u8a(d.buffer);
		console.log(
			`☆☆☆☆ ESBSU makeBigSendDResponse B Array.isArray(d):${Array.isArray(d)}/dU8A.length:${dU8A.length}/dU8A:`,
			dU8A
		);
		const f1 = B.u8a(1);
		f1[0] = dU8A[0];
		const iI32a = B64U.u8a2I32a(i > 0 ? B.u8a(B.i32a(1).fill(i).buffer) : dU8A.subarray(33, 37));
		const sU8A = dU8A.subarray(37, 69);
		const bU8A = dU8A.subarray(69);
		const flg = BSU.bOK(f);
		console.log(
			`☆☆☆☆ ESBSU makeBigSendDResponse C indexI32A:${iI32a}/signatureU8A.length:${sU8A.length}/signatureU8A:`,
			sU8A
		);
		return await BSU.mkResAb(f1, bU8A, iI32a.buffer, sU8A, flg);
	}
	static bOK(f = BSU.OK) {
		return B.u8a(1).fill(BSU.STATUS.indexOf(f));
	}
	static async mkResAb(f1, dU8A, iAb, sU8A, f = BSU.bOK()) {
		console.log(
			`☆☆☆☆☆ ESBSU makeResAb A f1:${f1}/indexAb:${B.i32a(iAb)[0]}/signatureU8A:${sU8A.length}/signatureU8A:`,
			sU8A
		);
		const h = B.u8a(await H.d(dU8A, 1, undefined, true)); //ab
		console.log(
			`☆☆☆☆☆ ESBSU makeResAb B f1:${f1}/dU8A.length:${dU8A.length}/hashU8A:${h.length} ${B64U.u8a2B64(h)} /dU8A:`,
			dU8A
		);
		return B64U.joinU8as([f1, h, B.u8a(iAb), sU8A, f]);
	}
	static async unitData(o) {
		console.log('☆☆☆☆☆ ESBSU unitData A map:', o);
		if (o.full) {
			return { united: o.full, isValid: true };
		}
		const d = o.data;
		const ks = Object.keys(d);
		ks.sort();
		console.log('☆☆☆☆☆ ESBSU unitData B keys:', ks);
		const a = [];
		for (const k of ks) {
			a.push(d[k]);
		}
		const dU8A = B64U.joinU8as(a);
		console.log(`☆☆☆☆☆ ESBSU unitData C dU8A.length:${dU8A.length}`, dU8A);

		const u = B.u8a(o.byteLength);
		let offset = 0;
		for (const k of ks) {
			const u8a = d[k];
			u.set(u8a, offset);
			delete d[k];
			offset += u8a.byteLength;
		}
		ks.splice(0, ks.length);
		const h = await H.d(u);
		console.log(`☆☆☆☆☆ ESBSU unitData D map.signature:${o.signature} /digest:${h} /united:`, u);
		const isValid = h === o.signature;
		o.full = isValid ? u : null;
		return { united: u, isValid };
	}
}
class U {
	static getStopFn(conf) {
		return () => {
			conf.isStop = true;
		};
	}
	static sendOnDC(conf, m, l = console, bt = 'blob') {
		l.log(`ESWebRTCConnecterUtil sendMessage msg:${m}`);
		if (conf && conf.w && conf.w.isOpend) {
			conf.w.send(m, bt);
		}
	}
	static parseSdp(sdpI, l = console) {
		const sdp = typeof sdpI === 'string' ? J.parse(sdpI) : sdpI;
		l.log(`ESWebRTCConnecterU parseSdp ${typeof sdpI}/sdpInput:${sdpI}`);
		if (!sdp.sdp) {
			return null;
		}
		sdp.sdp = sdp.sdp.replace(/\\r\\n/g, '\r\n');
		l.log(sdp);
		return sdp.sdp;
	}
}
class GA {
	//////Fetcher Core///////////////////////////////////////////////
	static c(d) {
		return d && typeof d === 'object'
			? Object.keys(d)
					.map((k) => `${k}=${encodeURIComponent(d[k])}`)
					.join('&')
			: d;
	}
	static async getTextGAS(p, d = {}) {
		console.log('GASAccessor----getTextGAS--A------------');
		const r = await fetch(`${p}?${GA.c(d)}`, {
			method: 'GET',
			redirect: 'follow',
			Accept: 'application/json',
			'Content-Type': contentType,
		});
		return await r.text();
	}
	static async postToGAS(p, d) {
		console.warn('GASAccessor----postToGAS--A------------', d);
		const r = await fetch(`${p}`, {
			method: 'POST',
			redirect: 'follow',
			Accept: 'application/json',
			'Content-Type': contentType,
			body: `${GA.c(d)}`,
			headers: {
				'Content-Type': contentType,
			},
		});
		return await r.text();
	}
}
class WebRTCConnecter {
	constructor(
		l = console,
		isTM = false,
		stunSrv = [
			{
				urls: 'stun:stun.l.google.com:19302',
			},
		]
	) {
		this.isTestMode = isTM;
		this.pOffer = new WebRTCPeer('OFFER', stunSrv);
		this.pAnswer = new WebRTCPeer('ANSWER', stunSrv);
		this.wPeer = null;
		this.onOpenCallBack = () => {};
		this.onCloseCallBack = () => {};
		this.onMsgCB = () => {};
		this.onErrCB = () => {};
		this.isOpend = isTM ? true : false;
		this.l = l;
		this.inited = this.init();
	}
	async init() {
		this.l.log('-WebRTCConnecter-init--0----------WebRTCConnecter--------------------------------------');
		this.close();
		const self = this;
		this.pOffer.onOpen = (e) => {
			self.onOpenCallBack(e);
			self.wPeer = self.pOffer;
			self.l.log(
				'-WebRTCConnecter-onOpen--1-pOffer---------WebRTCConnecter--------------------------------------'
			);
			self.wPeer.onClose = self.onCloseCallBack;
			self.wPeer.onMessage = self.onMsgCB;
			self.wPeer.onError = self.onErrCB;
			self.isOpend = true;
		};
		this.pAnswer.onOpen = (e) => {
			self.onOpenCallBack(e);
			self.wPeer = self.pAnswer;
			self.l.log('-WebRTCConnecter-onOpen--1-pAnswer---------pAnswer--------------------------------------');
			self.wPeer.onClose = self.onCloseCallBack;
			self.wPeer.onMessage = self.onMsgCB;
			self.wPeer.onError = self.onErrCB;
			self.isOpend = true;
		};
		this.l.log(
			`-WebRTCConnecter-init--3----------WebRTCConnecter--------------------------------------pOffer:${this.pOffer.name}`
		);
		this.l.log(
			`-WebRTCConnecter-init--4----------WebRTCConnecter--------------------------------------pAnswer:${this.pAnswer.name}`
		);
		return true;
	}

	async getOfferSdp() {
		return (await this.inited) ? await this.pOffer.mkOffer() : '';
	}
	setOnOpen(cb) {
		this.onOpenCallBack = (e) => {
			console.warn(
				`-WebRTCConnecter-onOpenCallBack--1------------------------------------------------event:${e}`
			);
			cb(e);
		};
	}
	setOnClose(cb) {
		this.onCloseCallBack = (e) => {
			console.warn(
				`-WebRTCConnecter-onCloseCallBack--1------------------------------------------------event:${e}`
			);
			cb(e);
		};
	}
	setOnMsg(cb) {
		this.onMsgCB = (m) => {
			console.warn(
				`-WebRTCConnecter-onMessageCallBack--1------------------------------------------------msg:${m}`
			);
			cb(m);
		};
	}
	setOnErr(cb) {
		this.onErrCB = (e) => {
			console.warn(
				`-WebRTCConnecter-onErrorCallBack--1------------------------------------------------error:${e}`
			);
			cb(e);
		};
	}
	send(m, bt = 'blob') {
		// console.log(`WebRTCConnecter send msg:${msg}/binaryType:${bt}`);
		if (this.isTestMode) {
			return this.onMsgCB(
				typeof m !== 'string' && m instanceof Blob ? (m.buffer ? new Blob(m) : m.byteLength ? B.u8a(m) : m) : m
			);
		}
		this.wPeer.send(m, bt);
	}
	async ans(sdp) {
		if (!sdp) {
			return null;
		} else if (await this.inited) {
			return await this.pAnswer.setOfferAndAns(sdp);
		}
	}
	async conn(sdp, fn) {
		if (!sdp) {
			return null;
		}
		const result = await this.pOffer.setAns(sdp).catch(getEF(now(), this.l));
		this.wPeer = this.pOffer;
		if (result && fn) {
			this.setOnCandidates(fn);
		}
		return result;
	}
	connAns() {
		return new Promise((r) => {
			this.wPeer = this.pAnswer;
			this.setOnCandidates(async (c) => {
				await sleep(Math.floor(Math.random() * 400) + 200);
				r(c);
			});
		});
	}
	async setOnCandidates(fn) {
		let c = 1;
		while (c < 100 && !this.isOpend) {
			await sleep(Math.floor(Math.random() * 20 * c) + 100);
			c += 1;
			if (!this.wPeer) {
				continue;
			}
			const cs = this.wPeer.getCandidates();
			console.log(`WebRTCConnecter setOnCandidates count:${c}/candidates:${cs}`);
			if (Array.isArray(cs) && cs.length > 0) {
				fn(cs);
				break;
			}
		}
	}
	setCandidates(ci) {
		const c = typeof ci === 'object' ? ci : J.parse(ci);
		return !Array.isArray(c) ? `setCandidates candidates:${c}` : this.wPeer.setCandidates(c);
	}
	close() {
		this.pOffer.close();
		this.pAnswer.close();
	}
	isOpened() {
		return this.isTestMode ? true : this.wPeer ? this.wPeer.isOpened() : false;
	}
}
const opt = { optional: [{ DtlsSrtpKeyAgreement: true }, { RtpDataChannels: true }] };
class WebRTCPeer {
	constructor(n, stunSrvs, l = null) {
		this.name = n;
		this.p = null;
		this.cs = [];
		this.config = { iceServers: stunSrvs };
		this.l = l;
		this.id = `${now()} ${this.name}`;
		this.q = [];
		this.isOpenDc = false;
	}
	prepareNewConn(isWithDataChannel) {
		return new Promise((resolve, reject) => {
			console.warn(
				'-WebRTCPeer-prepareNewConnection--0----------WebRTCPeer--------------------------------------'
			);
			const p = new RTCPeerConnection(this.config, opt);
			console.warn(
				'-WebRTCPeer-prepareNewConnection--1----------WebRTCPeer--------------------------------------'
			);
			p.ontrack = (e) => {
				console.log(`-WebRTCPeer- peer.ontrack()vevt:${e}`);
			};
			// peer.onaddstream = evt => {
			// 	console.log('-- peer.onaddstream()vevt:' + evt);
			// };
			p.onremovestream = (e) => {
				console.log(`-WebRTCPeer- peer.onremovestream()vevt:${e}`);
			};
			p.onicecandidate = (e) => {
				if (e.candidate) {
					// console.log(evt.candidate);
					this.cs.push(e.candidate);
				} else {
					console.log(
						`-WebRTCPeer--onicecandidate--- empty ice event peer.localDescription:${p.localDescription}`
					);
				}
			};
			p.onnegotiationneeded = async () => {
				try {
					console.log(
						`-WebRTCPeer1--onnegotiationneeded--------WebRTCPeer----createOffer() succsess in promise name:${this.name}`
					);
					const o = await p.createOffer();
					console.log(
						`-WebRTCPeer2--onnegotiationneeded--------WebRTCPeer----createOffer() succsess in promise;iceConnectionState;${p.iceConnectionState}`
					);
					await p.setLocalDescription(o);
					console.log(
						`-WebRTCPeer3--onnegotiationneeded--------WebRTCPeer----setLocalDescription() succsess in promise;iceConnectionState${p.iceConnectionState}`
					);
					resolve(p);
				} catch (e) {
					reject(e);
					ef(e, this.id, this.l);
				}
			};
			p.oniceconnectionstatechange = () => {
				console.log(`WebRTCPeer ICE connection Status has changed to ${p.iceConnectionState}`);
				switch (p.iceConnectionState) {
					case 'closed':
					case 'failed':
						if (this.p && this.isOpend) {
							this.close();
						}
						break;
					case 'disconnected':
						break;
				}
			};
			p.ondatachannel = (e) => {
				console.warn(
					`-WebRTCPeer-ondatachannel--1----------WebRTCPeer--------------------------------------evt:${e}`
				);
				this.dcSetup(e.channel);
			};
			console.warn(
				`-WebRTCPeer-prepareNewConnection--2----------WebRTCPeer--------------------------------------isWithDataChannel:${isWithDataChannel}`
			);
			if (isWithDataChannel) {
				const dc = p.createDataChannel(`chat${now()}`);
				this.dcSetup(dc);
			}
		});
	}
	onOpen(e) {
		console.log(`WebRTCPeer.onOpen is not Overrided name:${this.name}`);
		console.log(e);
	}
	onError(e) {
		console.log(`WebRTCPeer.onError is not Overrided name:${this.name}`);
		console.log(e);
	}
	onMessage(m) {
		console.log(`WebRTCPeer.onMessage is not Overrided name:${this.name}`);
		console.log(m);
	}
	onClose() {
		console.log(`WebRTCPeer.onClose is not Overrided name:${this.name}`);
		console.log('close');
	}
	dcSetup(dc) {
		if (this.dc && dc.id !== this.dc.id && this.isOpenDc) {
			console.log(
				`WebRTCPeer The Data Channel be Closed. readyState:${this.dc.readyState} /${dc.id} !== ${this.dc.id}`
			);
			// this.dc.close();
			// this.dc = null;
		}
		dc.onerror = (e) => {
			console.error('WebRTCPeer Data Channel Error:', e);
			this.onError(e);
		};
		dc.onmessage = (e) => {
			console.log(
				`WebRTCPeer Got Data Channel Message:typeof:${typeof e.data}/isBlob:${e.data instanceof Blob}`,
				e.data
			);
			this.onMessage(e.data);
		};
		dc.onopen = (e) => {
			console.warn(e);
			if (!this.isOpenDc) {
				dc.send(
					`WebRTCPeer dataChannel Hello World! OPEN SUCCESS! dc.id:${dc.id} label:${dc.label} ordered:${dc.ordered} protocol:${dc.protocol} binaryType:${dc.binaryType} maxPacketLifeTime:${dc.maxPacketLifeTime} maxRetransmits:${dc.maxRetransmits} negotiated:${dc.negotiated}`
				);
				this.onOpen(e);
				this.isOpenDc = true;
			}
		};
		dc.onclose = () => {
			console.log('WebRTCPeer The Data Channel is Closed');
			this.onClose();
			dc.isOpen = false;
		};
		this.dc = dc;
	}
	async mkOffer() {
		this.p = await this.prepareNewConn(true);
		return this.p.localDescription;
	}
	async mkAns() {
		console.log('WebRTCPeer makeAnswer sending Answer. Creating remote session description...');
		if (!this.p) {
			console.error('WebRTCPeer makeAnswer peerConnection NOT exist!');
			return;
		}
		try {
			const a = await this.p.createAnswer();
			console.log('WebRTCPeer makeAnswer createAnswer() succsess in promise answer:', a);
			await this.p.setLocalDescription(a);
			console.log(`WebRTCPeer makeAnswer setLocalDescription() succsess in promise${this.p.localDescription}`);
			return this.p.localDescription;
		} catch (e) {
			ef(e, this.id, this.l);
		}
	}
	async setOfferAndAns(sdp) {
		console.warn(`WebRTCPeer setOfferAndAswer sdp ${sdp}`);
		console.warn(sdp);
		try {
			while (this.cs.length < 1) {
				const o = new RTCSessionDescription({
					type: 'offer',
					sdp,
				});
				if (this.p) {
					console.error('WebRTCPeer setOfferAndAswer peerConnection alreay exist!');
				}
				this.p = await this.prepareNewConn(true);
				console.warn(`WebRTCPeer setOfferAndAswer this.p${this.p} offer:`, o);
				await this.p.setRemoteDescription(o);
				console.log(
					`WebRTCPeer setOfferAndAswer setRemoteDescription(answer) succsess in promise name:${this.name}`
				);
				const a = await this.mkAns();
				console.warn(`WebRTCPeer setOfferAndAswer ans ${a}`);
				if (this.cs.length < 1 || a) {
					return a;
				}
				await sleep(Math.floor(Math.random() * 1000) + 1000);
			}
		} catch (e) {
			ef(e, this.id, this.l);
		}
		return null;
	}
	async setAns(sdp) {
		const answer = new RTCSessionDescription({
			type: 'answer',
			sdp: typeof sdp === 'object' ? J.parse(sdp) : sdp,
		});
		if (!this.p) {
			throw 'WebRTCPeer peerConnection NOT exist!';
		}
		await this.p.setRemoteDescription(answer);
		console.log('WebRTCPeer setRemoteDescription(answer) succsess in promise');
		return true;
	}
	isOpened() {
		const dc = this.dc;
		if (!dc) {
			return false;
		}
		let isOpend = false;
		switch (dc.readyState) {
			case 'connecting':
				isOpend = now() - this.lastSend < 20000;
				break;
			case 'open':
				isOpend = true;
				this.lastSend = now();
				break;
			case 'closing':
			case 'closed':
				isOpend = false;
				break;
		}
		return isOpend;
	}
	send(m, bt = 'blob') {
		const dc = this.dc;
		if (!dc) {
			return false;
		}
		dc.binaryType = bt;
		console.log(`Connection SEND!; dc.binaryType : ${dc.binaryType}`);
		switch (dc.readyState) {
			case 'connecting':
				console.log(`Connection not open; queueing: ${m}`);
				this.q.push(m);
				break;
			case 'open':
				this.sendOnQueue(bt);
				dc.send(m, bt);
				this.lastSend = now();
				break;
			case 'closing':
				console.log(`Attempted to send message while closing: ${m}`);
				this.q.push(m);
				break;
			case 'closed':
				console.warn('Error! Attempt to send while connection closed.');
				this.q.push(m);
				this.close();
				break;
		}
		return dc.readyState;
	}
	sendOnQueue(bt) {
		const l = this.q.length;
		for (let i = 0; i < l; i++) {
			this.dc.send(this.q.shift(), bt);
		}
	}
	close() {
		if (this.p || this.dc) {
			if (this.p && this.p.iceConnectionState !== 'closed') {
				this.p.close();
				this.p = null;
			}
			if (this.dc && this.dc.readyState !== 'closed') {
				this.dc.close();
				this.dc = null;
			}
			console.log('WebRTCPeer peerConnection is closed.');
		}
	}
	getCandidates() {
		return this.cs;
	}
	setCandidates(cs) {
		for (const c of cs) {
			console.log('WebRTCPeer setCandidates candidate', c);
			this.p.addIceCandidate(c).catch((e) => {
				ef(e, this.id, this.l);
			});
		}
		return 'setCandidates OK';
	}
}
//////Hash Core///////////////////////////////////////////////
export class H {
	static async d(m, sc = 1, algo = 'SHA-256', isAB = false) {
		let r = m.buffer ? (m instanceof Uint8Array ? B64U.dpU8a(m) : B.u8a(m.buffer)) : te.encode(m);
		for (let i = 0; i < sc; i++) {
			r = await window.crypto.subtle.digest(algo, r);
		}
		// console.log('digest result:', result);
		return isAB ? r : B64U.ab2b64u(r);
	}
}
class B {
	static u8a(a) {
		return new Uint8Array(a);
	}
	static u32a(a) {
		return new Uint32Array(a);
	}
	static i32a(a) {
		return new Int32Array(a);
	}
}
class B64U {
	static isSameAb(abA, abB) {
		return B64U.ab2B64(abA) === B64U.ab2B64(abB);
	}
	static isB64(s = '') {
		return s % 4 === 0 && /[+/=0-9a-zA-Z]+/.test(s);
	}
	static str2u8a(s) {
		return te.encode(s);
	}
	static u8a2str(u8a) {
		return td.decode(u8a);
	}
	static ab2B64(abi) {
		const ab = abi.buffer ? abi.buffer : abi;
		// console.log('ab2Base64 ab:', ab.byteLength);
		return window.btoa(B64U.u8a2bs(B.u8a(ab)));
	}
	static u8a2B64(u8a) {
		// console.log('u8a2Base64 u8a:', u8a.length);
		return window.btoa(B64U.u8a2bs(u8a));
	}
	static u8a2I32a(u8a) {
		const u8a4 = B.u8a(4);
		const len1 = u8a.length;
		const len = Math.ceil(len1 / 4);
		const i32a = B.i32a(len);
		for (let i = 0; i < len; i++) {
			u8a4[0] = u8a[i + 0];
			u8a4[1] = len1 < i + 1 ? 0 : u8a[i + 1];
			u8a4[2] = len1 < i + 2 ? 0 : u8a[i + 2];
			u8a4[3] = len1 < i + 3 ? 0 : u8a[i + 3];
			i32a[i] = B.i32a(u8a4.buffer)[0];
		}
		return i32a;
	}
	static u8a2u32a(u8a) {
		const u8a4 = B.u8a(4);
		const len1 = u8a.length;
		const len = Math.ceil(len1 / 4);
		const u32a = B.u32a(len);
		for (let i = 0; i < len; i++) {
			u8a4[0] = u8a[i + 0];
			u8a4[1] = len1 < i + 1 ? 0 : u8a[i + 1];
			u8a4[2] = len1 < i + 2 ? 0 : u8a[i + 2];
			u8a4[3] = len1 < i + 3 ? 0 : u8a[i + 3];
			u32a[i] = B.u32a(u8a4.buffer)[0];
		}
		return u32a;
	}
	static ab2b64u(ab) {
		return B64U.b642b64u(B64U.ab2B64(ab));
	}
	static b642ab(b64) {
		const bs = window.atob(b64);
		return B64U.bs2u8a(bs);
	}
	static b64u2ab(b64u) {
		return B64U.b642ab(B64U.b64u2b64(b64u));
	}
	static b642b64u(b64) {
		return b64 ? b64.split('+').join('-').split('/').join('_').split('=').join('') : b64;
	}
	static b64u2b64(b64u) {
		const l = b64u.length;
		const c = l % 4 > 0 ? 4 - (l % 4) : 0;
		let rb64 = b64u.split('-').join('+').split('_').join('/');
		for (let i = 0; i < c; i++) {
			rb64 += '=';
		}
		return rb64;
	}
	static joinU8as(u8as) {
		// console.log('□□joinU8ss A u8as', u8as);
		let sl = 0;
		const c = u8as.length;
		for (let i = 0; i < c; i++) {
			sl += u8as[i].byteLength;
		}
		const u = B.u8a(sl);
		let offset = 0;
		for (let i = 0; i < c; i++) {
			const u8a = u8as[i];
			u.set(u8a, offset);
			offset += u8a.byteLength;
		}
		// console.log('□□joinU8ss B united', u);
		return u;
	}
	static u8a2bs(u8a) {
		const r = [];
		// console.log(`uint8Array2BinaryString u8a:${u8a.length}`);
		for (const e of u8a) {
			r.push(String.fromCharCode(e));
		}
		// console.log(`uint8Array2BinaryString r:${r.length}`);
		return r.join('');
	}
	static bs2u8a(bs) {
		const l = bs.length;
		const a = B.u8a(new ArrayBuffer(l));
		for (let i = 0; i < l; i++) {
			a[i] = bs.charCodeAt(i);
		}
		return a;
	}
	static blob2ab(b) {
		return new Promise((r) => {
			const fr = new FileReader();
			fr.onload = () => {
				r(fr.result);
			};
			fr.onerror = () => {
				r(fr.error);
				console.error(fr.error);
			};
			fr.readAsArrayBuffer(b);
		});
	}
	static dpU8a(u8a) {
		const l = u8a.length;
		const n = B.u8a(l);
		for (let i = 0; i < l; i++) {
			n[i] = u8a[i];
		}
		return n;
	}
}
class Cy {
	static async getKey(pass, salt) {
		const pU8A = B64U.str2u8a(pass).buffer;
		const h = await H.d(pU8A, 100, 'SHA-256', true);
		const km = await crypto.subtle.importKey('raw', h, { name: 'PBKDF2' }, false, ['deriveKey']);
		const k = await crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt,
				iterations: 100000,
				hash: 'SHA-256',
			},
			km,
			{ name: 'AES-GCM', length: 256 },
			false,
			['encrypt', 'decrypt']
		);
		return [k, salt];
	}
	static getSalt(saltI, isAB) {
		return saltI ? (isAB ? B.u8a(saltI) : B64U.str2u8a(saltI)) : crypto.getRandomValues(B.u8a(16));
	}
	static async importKeyAESGCM(kAb, usages = ['encrypt', 'decrypt']) {
		return await crypto.subtle.importKey('raw', kAb, { name: 'AES-GCM' }, true, usages);
	}
	static getFixedField() {
		return crypto.getRandomValues(B.u8a(12)); // 96bitをUint8Arrayで表すため、96 / 8 = 12が桁数となる。
	}
	static getInvocationField() {
		return crypto.getRandomValues(B.u32a(1));
	}
	static secureMathRandom() {
		return crypto.getRandomValues(B.u32a(1))[0] / 4294967295; // 0から1の間の範囲に調整するためにUInt32の最大値(2^32 -1)で割る
	}
	static async encodeStrAES256GCM(s, pk) {
		return await Cy.encodeAES256GCM(B64U.str2u8a(s), pk);
	}
	static async encodeAES256GCM(u8a, pk, saltI = null, isAB) {
		const s = Cy.getSalt(saltI, isAB);
		const k = await Cy.loadKey(pk, s);
		const fp = Cy.getFixedField();
		const ip = Cy.getInvocationField();
		const iv = Uint8Array.from([...fp, ...B.u8a(ip.buffer)]);
		const edAb = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, u8a.buffer);
		// console.log('encodeAES256GCM encryptedDataAB:', edAb);
		return [
			B64U.ab2b64u(edAb), // 暗号化されたデータには、必ず初期ベクトルの変動部とパスワードのsaltを添付して返す。
			B64U.ab2b64u(iv.buffer),
			B64U.ab2b64u(s.buffer),
		].join(',');
	}
	static async decodeAES256GCMasStr(ers, pk) {
		return B64U.u8a2str(await Cy.decodeAES256GCM(ers, pk));
	}
	static async loadKey(pk, salt) {
		const s = typeof salt === 'string' ? B.u8a(B64U.b64u2ab(salt)) : salt;
		const [key] = typeof pk === 'string' ? await Cy.getKey(pk, s) : { passk: pk };
		return key;
	}
	static async decodeAES256GCM(ers, pk) {
		const [edB64U, ip, salt] = ers.split(',');
		const iv = B.u8a(B64U.b64u2ab(ip));
		const ed = B64U.b64u2ab(edB64U);
		const k = await Cy.loadKey(pk, salt);
		let dd = null;
		try {
			dd = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, k, ed);
		} catch (e) {
			ef(e);
			return null;
		}
		return B.u8a(dd);
	}
}
