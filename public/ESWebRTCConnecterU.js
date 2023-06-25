const te = new TextEncoder('utf-8');
const td = new TextDecoder('utf-8');
const OF = '_OFFER';
const AN = '_ANSWER';
const SlpMs = 100;
const WAIT = 'wait';
const rnd = (a = 1) => Math.random() * a;
const WaitAutoInterval = 1000 * 20;
const WaitAutoInterval2 = 1000 * 10 + rnd(15000);
const HshScrtchCnt = 12201;
const NullArr = [null];
const cType = 'application/x-www-form-urlencoded';
const J = JSON;
const Jp = (a) => J.parse(a);
const Js = (a) => J.stringify(a);
const SALT =
	'メロスは激怒した。必ず、かの邪智暴虐じゃちぼうぎゃくの王を除かなければならぬと決意した。メロスには政治がわからぬ。メロスは、村の牧人である。笛を吹き、羊と遊んで暮して来た。けれども邪悪に対しては、人一倍に敏感であった。';
///////////////////////////
const w = (...a) => console.warn(a);
const io = (...a) => console.info(a);
const err = (...a) => console.error(a);
const now = () => Date.now();
const crv = (t) => crypto.getRandomValues(t);
const isStr = (s) => typeof s === 'string';
const isArr = (a) => Array.isArray(a);
const isFn = (s) => typeof s === 'function';
const ct = (t) => clearTimeout(t);
const st = (f, w) => setTimeout(f, w);
const pv = (a) => (a && isStr(a) ? Jp(a) : a);
const ov = (a) => (typeof a === 'object' ? Jp(a) : a);
const ef = (e, id = '', l = null) => {
	w(`${id} ${e.message}`);
	w(e.stack);
	if (l && l.log && l !== console) {
		l.log(`${id} ${e.message}`);
		l.log(e.stack);
	}
};
function getEF(id, l) {
	return (e) => ef(e, id, l);
}
function slp(ms = SlpMs) {
	return new Promise((r) => st(() => r(), ms));
}
function dcd(d, id, l) {
	try {
		const o = pv(d);
		return o && o.message ? o.message : null;
	} catch (e) {
		ef(e, id, l);
	}
	return null;
}
async function mkH(s = [location.origin, navigator.userAgent, now()], st = Math.floor(rnd(100)) + (now() % 100) + 1) {
	return await H.d(Js(s), st);
}
async function dcb(e, g, t) {
	return e + g + t;
}
///////////////////////////isArr
export class ESWebRTCConnecterU {
	#i = null;
	constructor(l = console, onRcv = (tdn, m) => io(`ESWebRTCConnU targetDeviceName:${tdn},msg:${m}`)) {
		this.#i = new M(l, onRcv);
	}
	async init(u, g, p, dn) {
		await this.#i.init(u, g, p, dn);
	}
	setOnOpenFunc(fn = dcb) {
		this.#i.onO = fn;
	}
	setOnCloseFunc(fn = dcb) {
		this.#i.onClose = fn;
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
		this.#i.sndBigMsg(tsh, name, type, ab);
	}
	broadcastBigMessage(m) {
		this.#i.bcBigMsg(m);
	}
	sndMsg(tsh, m) {
		this.#i.sendMsg(tsh, m);
	}
	broadcastMessage(m) {
		this.#i.bcMsg(m);
	}
	async request(tsh, kp = '/', t = 'GET', m) {
		return await this.#i.req(tsh, kp, t, m);
	}
	setOnRequest(
		cb = async (kp, t, d) => {
			io(`keyPath:${kp}/type:${t}`, d);
			return d;
		}
	) {
		this.#i.setOnReq(cb);
	}
	tranTest(l, name, type, ab) {
		const fn = async (r) => {
			const i = new M(l, (tdn, m) => {
				io('tranTest ESWebRTCConnU cb onRcvCB msg:', m);
				const rab = m.ab;
				io('tranTest ESWebRTCConnU cb onRcvCB resAb:', rab);
				if (tdn === 'test' && B64.a2B(rab) === B64.a2B(ab)) r('OK');
			});
			await i.init('', 'test', 'test', 'test');
			i.req('test', name, ab);
		};
		return new Promise(fn);
	}
}
///////////////////////////
class M {
	constructor(l = console, onRcv = (tdn, m) => io(`M targetDeviceName:${tdn},msg:${m}`)) {
		const z = this;
		z.l = l;
		z.l.log('M');
		z.c = {};
		z.threads = [];
		z.confs = {};
		z.conns = {};
		z.onRcvCB = onRcv;
		z.A = new A(onRcv);
	}
	async init(u, g, p, dn, salt = SALT) {
		const z = this;
		z.l.log('M INIT START');
		z.url = u;
		z.group = g;
		z.passwd = p;
		z.devName = dn;
		z.hash = await mkH([u, g, p, dn], HshScrtchCnt);
		z.singHash = await mkH([u, g, p, salt], HshScrtchCnt);
		z.gHash = await mkH([u, g, p, salt], HshScrtchCnt);
		z.nowHash = await mkH([now(), u, g, p, dn, salt], HshScrtchCnt);
		z.sgnlH = await z.enc({ hash: z.nowHash, group: g, devName: dn });
		z.l.log(`M INIT END z.hash:${z.hash} devName:${dn}`);
		z.reqM = new Map();
	}
	async enc(o, k = this.singHash) {
		return await Cy.encStrAES256GCM(Js(o), k);
	}
	async dec(es, k = this.singHash) {
		try {
			return Jp(await Cy.decAES256GCMasStr(es, k));
		} catch (e) {
			ef(e, es, this.l);
		}
		return null;
	}
	async startWaitAutoConn() {
		const z = this;
		await z.inited;
		z.isStopAuto = z.isWaiting = false;
		let c = 3;
		let isFst = true;
		while (z.isStopAuto === false) {
			const gh = z.gHash;
			await slp(WaitAutoInterval / 5);
			if (!gh) continue;
			if (c === 0 || isFst) {
				await z.sndWait(gh);
				isFst = false;
				c = 3;
			} else {
				c--;
			}
			const l = await z.getWaitL(gh);
			if (!isArr(l)) continue;
			z.l.log(l);
			const n = now();
			for (const r of l) {
				const d = n - r.expire;
				if (d > 10000) continue;
				const v = pv(r.value);
				if (v.hash !== z.sgnlH && v.hash.indexOf(z.sgnlH) !== 0) {
					await z.onCatchAnother(gh, n, v.hash, z.group);
					break;
				}
			}
		}
	}
	async onCatchAnother(gh, now, h, g) {
		const z = this;
		const hs = h.split('/');
		const tsh = h.indexOf(z.sgnlH) < 0 ? h : hs[1] !== z.sgnlH ? hs[1] : hs[2];
		const cf = await z.getCf(gh, tsh, g);
		if (!cf || z.isOpd(cf)) return;
		await z.sndWaitNotify(gh, tsh);
		const l = await z.getWaitL(gh);
		if (!isArr(l) || l.length < 1) return;
		let isHotStamdby = false;
		const tl = [];
		const ln = z.sgnlH.length;
		const tn = tsh.length;
		const a = ln + tn;
		for (const r of l) {
			const v = pv(r.value);
			if (r.expire < now || v.hash.length < a) continue;
			tl.push(Js([r.expire, v.hash]));
		}
		if (tl.length < 1) return;
		tl.sort();
		tl.reverse();
		let isO = false;
		let rc = 0;
		for (const t of tl) {
			const h = Jp(t)[1];
			if (h.indexOf(z.sgnlH) === 1 && h.indexOf(tsh) >= tn) {
				isO = true;
				rc++;
			}
			if (h.indexOf(z.sgnlH) >= ln && h.indexOf(tsh) === 1) {
				isO = false;
				rc++;
			}
			if (rc >= 2) break;
		}
		z.startNego(cf).catch(getEF(now, z.l));
		await slp(100);
		if (isO) {
			await slp(Math.floor(rnd(500)) + 750);
			z.offer(cf).catch(getEF(now, z.l));
		}
		st(() => {
			isHotStamdby = false;
			z.isStop = true;
		}, WaitAutoInterval);
		isHotStamdby = true;
		while (isHotStamdby) await slp(100);
		z.isStop = false;
	}
	async sndWait(gh) {
		await this.post(
			gh,
			{ msg: WAIT, hash: this.sgnlH, expire: now() + WaitAutoInterval2 + WaitAutoInterval / 5 },
			WAIT
		);
	}
	async sndWaitNotify(gh, tsh) {
		await this.post(
			gh,
			{
				msg: WAIT,
				hash: `/${this.sgnlH}/${tsh}`,
				expire: now() + WaitAutoInterval2 + WaitAutoInterval / 5,
			},
			WAIT
		);
	}
	async getWaitL(gh) {
		const d = await this.load(gh, WAIT);
		const o = d ? Jp(d) : null;
		return o ? o.message : null;
	}
	isOpd(cf) {
		const i = cf.w.isOpened();
		this.l.log(`◆◆M isOpd conf.w.isOpd:${i}:${cf.target}`);
		return i;
	}
	async startNego(cf) {
		const z = this;
		cf.isStop = false;
		st(U.getStopFn(cf), WaitAutoInterval);
		while (cf.isStop === false && z.isStopAuto === false) {
			st(() => {
				if (cf.isAns) return;
				else if (z.threads.length < 4) z.threads.push(1);
				else return;
				z.load(cf.pxOs).then(async (d1) => {
					const ck = await H.d(cf.pxOs + d1);
					z.threads.pop(1);
					const d = dcd(d1, cf.id, z.l);
					if (d && !cf.cache[ck]) {
						cf.cache[ck] = 1;
						z.listener(cf, OF, d);
					}
				});
			}, SlpMs);
			st(() => {
				if (!cf.isAns) return;
				else if (z.threads.length < 4) z.threads.push(1);
				else return;
				z.load(cf.pxAs).then(async (data) => {
					const ck = await H.d(cf.pxAs + data);
					z.threads.pop(1);
					const d = dcd(data, cf.id, z.l);
					if (d && !cf.cache[ck]) {
						cf.cache[ck] = 1;
						z.listener(cf, AN, d);
					}
				});
			}, SlpMs);
			await slp();
		}
		z.resetConf(cf);
	}
	async stopWaitAutoConn() {
		const z = this;
		for (const k in z.confs) z.confs[k].isStop = true;
		z.isStopAuto = true;
		for (const k in z.confs) z.confs[k].isStop = true;
		await slp(Math.floor(rnd(1000)) + 2500);
		for (const k in z.confs) z.resetConf(z.confs[k]);
	}
	async offer(cf) {
		cf.isAns = false;
		const o = await cf.w.getOfferSdp();
		this.l.log('M setOnRecieve OFFER post offer:', o);
		await this.post(cf.pxAt, await this.enc(o, cf.nowHashKey));
	}
	async post(g, o, c = 'g') {
		const n = now();
		const d = await GA.post2GAS(this.url, {
			group: g,
			cmd: c,
			data: isStr(o) ? o : Js(o),
		});
		this.l.log(`M====post====${g}/${c} d:${now() - n} data:`, d);
	}
	async load(g, c = 'g') {
		const n = now();
		const k = `${n}_${Math.floor(rnd(1000))}`;
		const d = await GA.getTxtGAS(this.url, { group: g, cmd: c });
		this.l.log(`M==${k}====load====${g}/${c} ====${now() - n} data:`, d);
		return d;
	}
	async getConKey(gh, sh) {
		const obj = sh === 'test' ? { devName: 'test' } : await this.dec(sh);
		return [Js([gh, obj ? obj.devName : null]), obj];
	}
	async getCf(gh, tsh, g) {
		const z = this;
		const [k, oT] = await z.getConKey(gh, tsh);
		if (!oT) return null;
		const [s] = await z.getConKey(gh, z.sgnlH);
		let cf = z.confs[k];
		const tdn = oT.devName;
		if (!cf) {
			cf = {
				targetDeviceName: tdn,
				isAns: true,
				isGetFst: false,
				isExcangedCandidates: false,
				pxAt: k + AN,
				pxOt: k + OF,
				pxAs: s + AN,
				pxOs: s + OF,
				isStop: false,
				cache: {},
				id: `${now()} ${z.devName}`,
			};
			cf.w = new WebRTCConn(z.l, tsh === 'test');
			cf.w.setOnMsg(async (m) => {
				io('conf.w.setOnMsg((msg):', m);
				await z.onMsgByConf(cf, tdn, tsh, m);
			});
			cf.w.setOnOpen((e) => {
				z.l.log(`####★###OPEN！###★####targetDeviceName:${tdn}`, oT);
				z.onO(e, g, tsh, tdn);
				cf.isStop = true;
			});
			cf.w.setOnClose((e) => {
				z.l.log(`####☆###CLOSE###☆####targetDeviceName:${tdn}`);
				z.onClose(e, g, tsh, tdn);
				cf.isStop = false;
			});
			z.confs[k] = cf;
		}
		cf.nowHashKey = oT.nowHash;
		return cf;
	}
	async onMsgByConf(cf, tdn, tsh, m) {
		const z = this;
		const ab =
			m instanceof Blob ? await B64.L2a(m) : m.buffer && m.buffer.byteLength ? m.buffer : m.byteLength ? m : null;
		const dU8A = z.A.getBigSndDResFormat(tdn, ab);
		if (dU8A) {
			io('☆onMsgByConf A conf.w.setOnMsg((msg):to onRcvBigDRes dU8A', dU8A, m);
			await z.onRcvBigDRes(cf, tdn, dU8A);
		} else if (await z.A.isBigSndD(ab, tdn)) {
			io('☆onMsgByConf B conf.w.setOnMsg((msg):to isBigSndD ab', ab, m);
			await z.onRcvBigD(cf, tdn, ab, tsh);
		} else if (!ab && typeof m === 'string') {
			io('☆onMsgByConf C conf.w.setOnMsg((msg):to onRcvCB', m);
			z.onRcvCB(tdn, m);
		} else {
			io('☆onMsgByConf D conf.w.setOnMsg((msg):to onRcvCB', m);
			z.onRcvCB(tdn, { ab });
		}
	}
	resetConf(cf) {
		cf.isAns = true;
		cf.isGetFst = cf.isExcangedCandidates = cf.isStop = false;
		const c = Object.keys(cf.cache);
		for (const k of c) delete cf.cache[k];
		return null;
	}
	async listener(cf, px, ve) {
		const z = this;
		const v = await z.dec(ve, z.nowHash);
		z.l.log(
			`M====LISTENER==RECEIVE=A====px:${px}/${px === AN}//value:${v}/conf.isAns:${
				cf.isAns
			}/!conf.isGetFst:${!cf.isGetFst}/conf.isExcangedCandidates:${cf.isExcangedCandidates}`
		);
		if (cf.w.isOpd || cf.isStop || v === true || v === null || v === 'null')
			return z.l.log(`M====LISTENER==END====value:${v}/conf.isStop:${cf.isStop}`);
		if (cf.isAns && px === AN) {
			z.l.log(`M A AS ANSWER conf.isAns:${cf.isAns} A px:${px} conf.isGetFst:${cf.isGetFst}`);
			if (!cf.isGetFst) {
				const a = await z.ans(cf, v);
				z.l.log(`M====LISTENER==answer=A====typeof answer :${typeof a}`, a);
				await z.post(cf.pxOt, await z.enc(a, cf.nowHashKey));
				cf.isGetFst = true;
			} else if (!cf.isExcangedCandidates) {
				cf.isExcangedCandidates = true;
				const cs = cf.w.setCandidates(pv(v), now());
				z.l.log('M====LISTENER==answer candidats=A====', cs);
			}
		} else if (!cf.isAns && px === OF) {
			z.l.log(`M B AS OFFER conf.isAns:${cf.isAns}/B px:${px}/!conf.isGetFst:${!cf.isGetFst}`);
			if (!cf.isGetFst) {
				const cs = await z.conn(cf, v);
				z.l.log('M====LISTENER==make offer candidates=A====', cs);
				cf.isGetFst = true;
				await z.post(cf.pxAt, await z.enc(cs, cf.nowHashKey));
			} else if (!cf.isExcangedCandidates) {
				cf.isExcangedCandidates = true;
				const cs = v ? cf.w.setCandidates(pv(v), now()) : null;
				z.l.log('M====LISTENER==set offer candidats=A====', cs);
			}
		}
	}
	async ans(cf, osi) {
		st(async () => {
			if (cf.isStop) return;
			const cs = await cf.w.connAns();
			while (!cf.isGetFst) await slp(Math.floor(rnd(200)) + 50);
			await this.post(cf.pxOt, await this.enc(cs, cf.nowHashKey));
		});
		return cf.isStop ? null : await cf.w.ans(U.parseSdp(osi, this.l));
	}
	conn(cf, si) {
		if (cf.isStop) return;
		const fn = async (r) => {
			const f = (c) => r(c);
			return cf.isStop ? null : await cf.w.conn(U.parseSdp(si, this.l), f);
		};
		return new Promise(fn);
	}
	closeAll() {
		for (const k in this.confs) this.cc(this.confs[k]);
	}
	cc(c) {
		if (c && c.w && c.w.isOpend) return c.w.close() === this.resetConf(c);
	}
	async close(tsh) {
		this.cc(await this.getCf(this.gHash, tsh, this.group));
	}
	async sndBigMsg(tsh, n, t, ab) {
		return await this.A.sndBigD(await this.getCf(this.gHash, tsh, this.group), n, t, ab, this.l);
	}
	async bcBigMsg(n, t, ab) {
		const ps = [];
		for (const k in this.confs) ps.push(this.A.sndBigD(this.confs[k], n, t, ab, this.l));
		return Promise.all(ps);
	}
	async sendMsg(tsh, m) {
		U.sndOnDC(await this.getCf(this.gHash, tsh, this.group), m, this.l);
	}
	bcMsg(m) {
		for (const k in this.confs) U.sndOnDC(this.confs[k], m, this.l);
	}
	async onRcvBigD(cf, tdn, m, tsh) {
		const z = this;
		const { files, isComple, res } = await z.A.rcvBigSndD(cf, m);
		io(`☆ M onRcvBigD A isArr(files):${isArr(files)}/isComple:${isComple}`, res);
		if (isComple && isArr(files)) {
			io(`☆ M onRcvBigD B files.byteLength:${files.byteLength}/isComple:${isComple}`);
			for (const f of files) {
				io(`☆ M onRcvBigD C file${f}/isComple:${isComple}`, f);
				if (z.A.isReq(f)) {
					io(`☆ M onRcvBigD D file${f}/isComple:${isComple}`);
					return await z.onReqD(tdn, f, tsh);
				} else if (z.A.isRes(f)) {
					io(`☆ M onRcvBigD E file${f}/isComple:${isComple}`);
					return await z.onRes(tdn, f);
				}
				io(`☆ M onRcvBigD F file${f}/isComple:${isComple}`);
			}
			io(`☆ M onRcvBigD G files:${files}/isComple:${isComple}`);
			z.onRcvCB(tdn, files);
		}
		return [];
	}
	async onReqD(tdn, f, tsh) {
		const ts = f.type.split('/');
		const PQ = ts.shift();
		const h = ts.pop();
		const t = ts.join('/');
		const { key, type, result, status } = await this.onReq(tdn, f.name, t, f.data);
		const nt = [PQ, status, type, h].join('/');
		return await this.sndBigMsg(tsh, key, this.A.cnvtType2Res(nt), result);
	}
	async onRcvBigDRes(cf, tdn, dU8A) {
		if (this.A.isComplBigSndDRes(dU8A)) return await this.A.rcvBigSndDCompl(dU8A);
		else if (this.A.isBigSndDRes(dU8A)) return await this.A.rcvBigSndDRes(dU8A);
		return null;
	}
	/////////////////////////////////////////////////////////////////
	req(tsh, kp, t, m) {
		const z = this;
		const fn = async (r) => {
			const ab = isStr(m) ? B64.s2u(m) : m.byteLength ? m : m.buffer ? m.buffer : B64.s2u(Js(m));
			const h = await H.d(now() + rnd() + tsh + kp + SALT + t);
			const th = m.byteLength ? 'arraybuffer' : m.buffer ? 'typedarray' : typeof m;
			const nt = `${S.ReqH}${th}/${h}`; // PorQ/type/hash
			z.reqM.set(h, r);
			st(() => {
				z.reqM.delete(h);
				r(S.T_OUT);
			}, S.MaxWaitMs);
			const conf = await z.getCf(z.gHash, tsh, z.group);
			return await z.A.sndBigD(conf, kp, nt, ab, z.l);
		};
		return new Promise(fn);
	}
	onRes(tdn, f) {
		const ts = f.type.split('/');
		const s = ts.shift();
		const h = ts.pop();
		const r = this.reqM.get(h);
		const tm = ts.join('/');
		return r ? r(tdn, f.name, tm, f.data, s) : io('onRespons resolve:', r);
	}
	setOnReq(
		cb = async (k, t, d) => {
			io(`key:${k}/type:${t}`, d);
			return { key: k, type: t, result: d, status: 404 };
		}
	) {
		this.onReq = cb;
	}
}
class A {
	constructor(onCmpCB) {
		this.sndM = new Map();
		this.rcvM = new Map();
		this.onCmpCB = onCmpCB;
	}
	isReq(f) {
		return this.isR(f, S.ReqH);
	}
	isRes(f) {
		return this.isR(f, S.ResH);
	}
	isR(f, h) {
		return (
			f &&
			f.type &&
			f.type.indexOf(h) === 0 &&
			f.type.split('/').length >= 3 &&
			B64.isB64(f.type.split('/').pop())
		);
	}
	cnvtType2Res(t) {
		return t ? (t.indexOf(S.ReqH) === 0 ? t.replace(S.ReqH, S.ResH) : t) : t;
	}
	async isBigSndD(d, dn) {
		const M = S.MIN;
		io(`☆☆A isBigSndD A devName:${dn}/MIN:${M}`, d);
		if (
			!d ||
			isStr(d) ||
			(!d.byteLength && !d.buffer) ||
			(!d.buffer && d.byteLength < M) ||
			(d.buffer && d.buffer.byteLength < M)
		)
			return false; // 1,256/8=32byte,data
		const dnU8A = B64.s2u(dn);
		io(`☆☆A isBigSndD B devName:${dn}`, dnU8A);
		const f1 = dnU8A[0] * 1;
		const dU8A = d.byteLength && d.byteLength > 0 ? B.u8a(d) : d.buffer ? B.u8a(d.buffer) : NullArr;
		io(`☆☆A isBigSndD C data.byteLength:${d.byteLength}/f1:${f1}/dU8A[0]:${dU8A[0]}`, dU8A);
		if (f1 !== dU8A[0] * 1) {
			io(`☆☆A isBigSndD C1 data.byteLength:${d.byteLength}/f1:${f1}/dU8A[0]:${dU8A[0]}/type:${typeof f1}`);
			return false;
		}
		const hU8A = dU8A.subarray(1, 33);
		const dhU8A = dU8A.subarray(33); //index,signAll,data
		const h = B64.a2B(await H.d(dhU8A, 1, undefined, true));
		const hB64 = B64.u2B(hU8A);
		const r = hB64 === h;
		io(
			`☆☆A isBigSndD D data.byteLength:${d.byteLength}/hU8A:${hU8A}/result:${r}/hB64:${hB64}/hash:${h}/dhU8A:`,
			dhU8A
		);
		return r;
	}
	async sndBigD(cf, n, t, ab, l = console) {
		l.log(`★★A sendBigD A sndMsg msg:${ab}/${cf.w}/${cf.w.isOpend}`);
		if (!cf || !cf.w || !cf.w.isOpd) return;
		const w = cf.w;
		const dn = cf.targetDeviceName;
		const u8a = B.u8a(ab);
		const { dasendDataAb, signatureU8A, count, f1 } = await S.mkBigSndDMeta(u8a, dn, t, n);
		io(`★★A sendBigD B dasendDataAb:${dasendDataAb}`, dasendDataAb);
		const sB64 = B64.a2B(signatureU8A.buffer);
		const sq = new Map();
		const idx = -1;
		const i = B.i32a(1).fill(idx);
		const rh = B64.a2B(await S.mkResAb(f1, B.u8a(dasendDataAb).subarray(69), i.buffer, signatureU8A));
		this.sndM.set(sB64, {
			sq,
			t,
			n,
			byteLength: ab.byteLength,
			status: S.SENDING,
		});
		io(`★★A sendBigD C01 resHashB64:${rh}/i:`, rh);
		const r = await this.sndTran(w, dasendDataAb, rh, sq, idx);
		io(`★★A sendBigD C02 result:${r}/i:`, i);
		if (r === S.COMPLE) return true;
		if (r === S.T_OUT) return false;
		let of = 0;
		const ps = [];
		for (let i = 0; i < count; i++) {
			io(`★★A sendBigD D count:${count}/i:${i}/offset:`, of);
			const end = i === count - 1 ? ab.byteLength : of + S.SIZE;
			const p = u8a.subarray(of, end);
			ps.push(this.sndTranApart(w, p, f1, signatureU8A, sq, i));
			of = of += S.SIZE;
		}
		await Promise.all(ps);
		io(`★★A sendBigD E result:${r}`, r);
	}
	async sndTranApart(w, p, f1, sU8A, sq, i) {
		const a = B.i32a(1);
		a.fill(i);
		io(`★★★A sndTranApart A index:${i}`, a);
		const rh = B64.u2B(await S.mkResAb(f1, p, a.buffer, sU8A));
		const sAB = await S.mkBigSndD(p, f1, sU8A, i);
		io(`★★★A sndTranApart B resHashB64:${rh}`, rh);
		io(`★★★A sndTranApart C partU8A:${p}`, p);
		io(`★★★A sndTranApart D signatureU8A:${sU8A}`, sU8A);
		let isSndOK = false,
			isCmp = false;
		while (isSndOK === false) {
			const r = await this.sndTran(w, sAB, rh, sq, i);
			io(`★★★A sndTranApart E index:${i}/result:${r}`, p);
			if (r === S.COMPLE) isSndOK = isCmp = true;
			if (r === S.OK) isSndOK = true;
		}
		return isCmp;
	}
	sndTran(w, ab, rh = '', sq = new Map(), i) {
		ct(sq.has(rh) ? sq.get(rh).tm : null);
		return new Promise((r) => {
			const tm = st(() => r(S.T_OUT), S.WaitMs);
			sq.set(rh, { index: i, timer: tm, resolve: r });
			io(`★★★★A snedTran index:${i}/resHashB64:${rh}/ ${ab}`, ab);
			w.send(ab, 'arraybuffer');
		});
	}
	getBigSndDResFormat(dn, d) {
		const M = S.MIN;
		io(`☆☆A A getBigSndDResFormat devName:${dn}/data:`, d);
		if (
			d === null ||
			isStr(d) ||
			(!d.byteLength && !d.buffer) ||
			(d.byteLength && d.byteLength < M) ||
			(d.buffer && d.buffer.byteLength < M)
		)
			return false; // 1,256/8=32byte,data(index4byte,data)
		io(`☆☆A B getBigSndDResFormat devName:${dn}/data:`, d);
		const dnU8A = B64.s2u(dn);
		const f1 = dnU8A[0];
		const dU8A = !isArr(d) && d.byteLength && d.byteLength > 0 ? B.u8a(d) : B.u8a(d.buffer);
		io(`☆☆A C getBigSndDResFormat f1:${f1}/data:`, d);
		if (f1 !== dU8A[0]) return false;
		const idx = B64.u2I(dU8A.subarray(33, 37))[0];
		io(`☆☆A D getBigSndDResFormat index:${idx}/f1:`, f1);
		const sB64 = B64.u2B(dU8A.subarray(37, 69));
		const m = this.sndM.get(sB64);
		io(`☆☆A E getBigSndDResFormat signatureB64:${sB64}/m:`, m);
		return m && m.sq && m.byteLength >= idx * S.SIZE && idx >= -1 ? dU8A : null;
	}
	isBigSndDRes(dU8A) {
		const h = B64.u2B(dU8A);
		const i = B64.u2I(dU8A.subarray(33, 37))[0];
		const sB64 = B64.u2B(dU8A.subarray(37, 69));
		const m = this.sndM.get(sB64);
		const sq = m && m.sq ? m.sq : null;
		io(`☆☆☆☆A isBigSndDRes  A index:${i}/signatureB64:${sB64} /hashB64:${h} sq.get(hashB64):/m:`, sq.get(h), m);
		const t = sq && sq.get(h) ? sq.get(h) : { index: null };
		if (t.index === i) {
			io(`☆☆☆☆A isBigSndDRes B index:${i}`);
			ct(t.timer);
			return true;
		}
		io(`☆☆☆☆A isBigSndDRes C index:${i} task:`, t);
		return false;
	}
	isComplBigSndDRes(dU8A) {
		const sB64 = B64.u2B(dU8A.subarray(37, 69));
		const i = B64.u2I(dU8A.subarray(33, 37))[0];
		const s = dU8A[dU8A.length - 1];
		const m = this.sndM.get(sB64);
		io(`☆☆☆☆A isComplBigSndDRes index:${i}/ESBSU.STATUS[status] :${S.STATUS[s]}/m:`, m);
		return Math.ceil(m.byteLength / S.SIZE) === i && S.STATUS[s] === S.COMPLE;
	}
	async rcvBigSndD(cf, dAB) {
		if (!cf || !cf.w || !cf.w.isOpd) return;
		const w = cf.w;
		const u8a = B.u8a(dAB);
		const bU8A = u8a.subarray(33); //index,signAll,data
		const i = B64.u2I(bU8A.subarray(0, 4))[0]; //index,signAll,data
		const sB64 = B64.u2B(bU8A.subarray(4, 36)); //index,signAll,data
		const dU8A = bU8A.subarray(36); //index,signAll,data
		let o = this.rcvM.get(sB64);
		io(`☆☆☆A rcvBigSndD A index:${i}/signatureB64:`, sB64);
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
			this.rcvM.set(sB64, o);
		}
		io(`☆☆☆A rcvBigSndD B index:${i}/o:`, o);
		if (i === -1) {
			io('☆☆☆A rcvBigSndD C B64U.u8a2str(dU8A):', B64.u2s(dU8A));
			const mt = Jp(B64.u2s(dU8A));
			let isReg = false;
			for (const m of o.m) {
				if (m.name === mt.name && m.type === mt.type) {
					isReg = true;
					break;
				}
			}
			if (!isReg) {
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
				o.cmpU64 = B64.u2B(cpc);
			}
		} else {
			const ci = Math.floor(i / 8);
			o.counter[ci] = o.counter[ci] | (1 << i % 8);
			o.data[(2147483648 + i).toFixed()] = dU8A;
		}
		io(`☆☆☆A rcvBigSndD D index:${i}/m o.counter:${o.counter}/o.data:`, o.data);
		io(`☆☆☆A rcvBigSndD E index:${i}/B64U.u8a2Base64(o.counter):${B64.u2B(o.counter)}/o.counter:`, o.counter);
		const isCmp = o.cmpU64 === B64.u2B(o.counter);
		io(`☆☆☆A rcvBigSndD F index:${i}/o.cmpU64:${o.cmpU64}/isComple:`, isCmp);
		const r0 = await S.mkBigSndDRes(dAB, i);
		io(`☆☆☆A rcvBigSndD G index:${i}/res:`, r0);
		w.send(r0.buffer, 'arraybuffer');
		if (isCmp) {
			io(`☆☆☆A rcvBigSndD H index:${i}/isComple:`, isCmp);
			const { united, isValid } = await S.unitD(o);
			const r1 = await S.mkBigSndDRes(dAB, o.count + 1, isValid ? S.COMPLE : S.NG);
			w.send(r1.buffer, 'arraybuffer');
			io(`☆☆☆A rcvBigSndD I index:${i}/isComple:${isCmp}/isValid:${isValid}/united:`, united);
			if (isValid) {
				io(`☆☆☆A rcvBigSndD J index:${i}/isValid:`, isValid);
				const fs = [];
				for (const m of o.m) {
					if (!m.type && !m.name) continue;
					fs.push({ name: m.name, type: [m.type].join('/'), data: united });
				}
				return { files: fs, isComple: isCmp, res: r1 };
			}
		}
		io(`☆☆☆A rcvBigSndD K index:${i}/isComple:${isCmp}/res:`, r0);
		return { res: r0, isComple: isCmp };
	}
	async rcvBigSndDRes(dU8A) {
		const li = dU8A.length - 1;
		io(`☆☆☆☆A rcvBigSndDRes A lastIndex:${li}`);
		const s = S.STATUS[dU8A[li]];
		dU8A[li] = S.STATUS.indexOf(S.OK);
		const h = B64.u2B(dU8A);
		const m = this.sndM.get(B64.u2B(dU8A.subarray(37, 69)));
		const t = m && m.sq && m.sq.get(h) ? m.sq.get(h) : { index: null };
		const r = t.resolve;
		return isFn(r) ? r(s) !== true : false;
	}
	async rcvBigSndDCompl(dU8A) {
		const m = this.sndM.get(B64.u2B(dU8A.subarray(37, 69)));
		if (m && m.sq) {
			for (const [k, v] of m.sq) {
				if (isFn(v)) v(S.COMPLE);
				m.sq.delete(k);
			}
		}
	}
}
class S {
	static SIZE = 8000;
	static MIN = 1 + 32 + 4 + 32 + 1;
	static WaitMs = 30000;
	static MaxWaitMs = 60000;
	static ReqH = 'Q/';
	static ResH = 'P/';
	static OK = 'OK';
	static NG = 'NG';
	static COMPLE = 'COMPLE';
	static SENDING = 'SENDING';
	static T_OUT = 'TIME_OUT';
	static STATUS = [S.T_OUT, S.OK, S.NG, S.COMPLE, S.SENDING];
	static async mkBigSndDMeta(d, dn, t, name) {
		const dnU8A = B64.s2u(dn);
		const f1 = B.u8a(1).fill(dnU8A[0]);
		const bl = d.buffer.byteLength;
		const c = Math.ceil(bl / S.SIZE);
		const I1 = B.i32a(1).fill(-1);
		const s = await H.d(d); //BASE64
		const sU8A = B.u8a(B64.U2a(s));
		const j = Js({ type: t, name, signature: s, byteLength: bl, count: c });
		const u8a = B64.jus([B.u8a(I1.buffer), sU8A, B64.s2u(j)]); // 4+32=36
		const sAb = await H.d(u8a, 1, undefined, true);
		const r = {
			dasendDataAb: B64.jus([f1, B.u8a(sAb), u8a]).buffer, // 1+32=33 33+36 = 69
			signatureU8A: sU8A,
			count: c,
			f1,
		};
		return r;
	}
	static async mkBigSndD(u8a, f1, sU8A, i) {
		const I1 = B.i32a(1).fill(i);
		const bU8a = B64.jus([B.u8a(I1.buffer), sU8A, u8a]);
		const signAb = await H.d(bU8a, 1, undefined, true);
		const dU8A = B64.jus([f1, B.u8a(signAb), bU8a]);
		const r = dU8A.buffer;
		io('□□ESBigSndUtil makeBigSndD A result', r);
		return r;
	}
	static async mkBigSndDRes(d, i = -1, f = S.OK) {
		io(`☆☆☆☆ ESBSU mkBigSndDRes A index:${i}/flg:${f}/data:`, d);
		const dU8A = !isArr(d) && d.byteLength && d.byteLength > 0 ? B.u8a(d) : B.u8a(d.buffer);
		io(`☆☆☆☆ ESBSU mkBigSndDRes B isArr(d):${isArr(d)}/dU8A.length:${dU8A.length}/dU8A:`, dU8A);
		const f1 = B.u8a(1);
		f1[0] = dU8A[0];
		const iI32a = B64.u2I(i > 0 ? B.u8a(B.i32a(1).fill(i).buffer) : dU8A.subarray(33, 37));
		const sU8A = dU8A.subarray(37, 69);
		const bU8A = dU8A.subarray(69);
		const flg = S.bOK(f);
		io(`☆☆☆☆ ESBSU mkBigSndDRes C indexI32A:${iI32a}/signatureU8A.length:${sU8A.length}/signatureU8A:`, sU8A);
		return await S.mkResAb(f1, bU8A, iI32a.buffer, sU8A, flg);
	}
	static bOK(f = S.OK) {
		return B.u8a(1).fill(S.STATUS.indexOf(f));
	}
	static async mkResAb(f1, dU8A, iAb, sU8A, f = S.bOK()) {
		io(`☆☆☆☆☆ ESBSU mkResAb A f1:${f1}/indexAb:${B.i32a(iAb)[0]}/signatureU8A:${sU8A.length}/signatureU8A:`, sU8A);
		const h = B.u8a(await H.d(dU8A, 1, undefined, true)); //ab
		io(`☆☆☆☆☆ ESBSU mkResAb B f1:${f1}/dU8A.length:${dU8A.length}/hashU8A:${h.length} ${B64.u2B(h)} /dU8A:`, dU8A);
		return B64.jus([f1, h, B.u8a(iAb), sU8A, f]);
	}
	static async unitD(o) {
		io('☆☆☆☆☆ ESBSU unitData A map:', o);
		if (o.full) return { united: o.full, isValid: true };
		const d = o.data;
		const ks = Object.keys(d);
		ks.sort();
		io('☆☆☆☆☆ ESBSU unitData B keys:', ks);
		const a = [];
		for (const k of ks) a.push(d[k]);
		const dU8A = B64.jus(a);
		io(`☆☆☆☆☆ ESBSU unitData C dU8A.length:${dU8A.length}`, dU8A);
		const u = B.u8a(o.byteLength);
		let c = 0;
		for (const k of ks) {
			const g = d[k];
			u.set(g, c);
			delete d[k];
			c += g.byteLength;
		}
		ks.splice(0, ks.length);
		const h = await H.d(u);
		io(`☆☆☆☆☆ ESBSU unitData D map.signature:${o.signature} /digest:${h} /united:`, u);
		const i = h === o.signature;
		o.full = i ? u : null;
		return { united: u, isValid: i };
	}
}
class U {
	static getStopFn(cf) {
		return () => (cf.isStop = true);
	}
	static sndOnDC(cf, m, l = console, bt = 'blob') {
		l.log(`Mtil sndMsg msg:${m}`);
		return cf && cf.w && cf.w.isOpd ? cf.w.send(m, bt) : null;
	}
	static parseSdp(i, l = console) {
		const s = pv(i);
		l.log(`M parseSdp ${typeof i}/sdpInput:${i}`);
		if (!s.sdp) return null;
		s.sdp = s.sdp.replace(/\\r\\n/g, '\r\n');
		l.log(s);
		return s.sdp;
	}
}
class GA {
	static c(d) {
		return d && typeof d === 'object'
			? Object.keys(d)
					.map((k) => `${k}=${encodeURIComponent(d[k])}`)
					.join('&')
			: d;
	}
	static async getTxtGAS(p, d = {}) {
		io('GA----getTxtGAS--A----');
		const r = await fetch(`${p}?${GA.c(d)}`, {
			method: 'GET',
			redirect: 'follow',
			Accept: 'application/json',
			'Content-Type': cType,
		});
		return await r.text();
	}
	static async post2GAS(p, d) {
		w('GA----post2GAS--A----', d);
		const r = await fetch(`${p}`, {
			method: 'POST',
			redirect: 'follow',
			Accept: 'application/json',
			'Content-Type': cType,
			body: `${GA.c(d)}`,
			headers: {
				'Content-Type': cType,
			},
		});
		return await r.text();
	}
}
class WebRTCConn {
	constructor(
		l = console,
		isTM = false,
		stunSrv = [
			{
				urls: 'stun:stun.l.google.com:19302',
			},
		]
	) {
		const z = this;
		z.isTestMode = isTM;
		z.pO = new Peer('OFFER', stunSrv);
		z.pA = new Peer('ANSWER', stunSrv);
		z.wPeer = null;
		z.onOpenCB = z.onCloseCB = z.onMsgCB = z.onErrCB = () => {};
		z.isOpd = isTM ? true : false;
		z.l = l;
		z.inited = z.init();
	}
	async init() {
		const z = this;
		z.l.log('-WebRTCConn-init--0----WebRTCConn----');
		z.close();
		z.pO.onO = (e) => {
			z.onOpenCB(e);
			z.wPeer = z.pO;
			z.l.log('-WebRTCConn-onO--1-pOffer----WebRTCConn----');
			z.wPeer.onClose = z.onCloseCB;
			z.wPeer.onMsg = z.onMsgCB;
			z.wPeer.onError = z.onErrCB;
			z.isOpd = true;
		};
		z.pA.onO = (e) => {
			z.onOpenCB(e);
			z.wPeer = z.pA;
			z.l.log('-WebRTCConn-onO--1-pAnswer----pAnswer----');
			z.wPeer.onClose = z.onCloseCB;
			z.wPeer.onMsg = z.onMsgCB;
			z.wPeer.onError = z.onErrCB;
			z.isOpd = true;
		};
		z.l.log(`-WebRTCConn-init--3----WebRTCConn----pOffer:${z.pO.name} ----pAnswer:${z.pA.name}`);
		return true;
	}
	async getOfferSdp() {
		return (await this.inited) ? await this.pO.mkO() : '';
	}
	setOnOpen(cb) {
		this.onOpenCB = (e) => w(`-WebRTCConn-onOpenCallBack--1----event:${e}`, cb(e));
	}
	setOnClose(cb) {
		this.onCloseCB = (e) => w(`-WebRTCConn-onCloseCallBack--1----event:${e}`, cb(e));
	}
	setOnMsg(cb) {
		this.onMsgCB = (m) => w(`-WebRTCConn-onMessageCallBack--1----msg:${m}`, cb(m));
	}
	setOnErr(cb) {
		this.onErrCB = (e) => w(`-WebRTCConn-onErrorCallBack--1----error:${e}`, cb(e));
	}
	send(m, bt = 'blob') {
		io(`WebRTCConn send msg:${m}/binaryType:${bt}`);
		return this.isTestMode
			? this.onMsgCB(!isStr(m) && m instanceof Blob ? (m.buffer ? new Blob(m) : m.byteLength ? B.u8a(m) : m) : m)
			: this.wPeer.send(m, bt);
	}
	async ans(sdp) {
		return !sdp ? null : (await this.inited) ? await this.pA.setOandA(sdp) : null;
	}
	async conn(sdp, fn) {
		if (!sdp) return null;
		const r = await this.pO.setA(sdp).catch(getEF(now(), this.l));
		this.wPeer = this.pO;
		if (r && fn) this.setOnCandidates(fn);
		return r;
	}
	connAns() {
		return new Promise((r) => {
			this.wPeer = this.pA;
			this.setOnCandidates(async (c) => {
				await slp(Math.floor(rnd(400)) + 200);
				r(c);
			});
		});
	}
	async setOnCandidates(fn) {
		let c = 1;
		while (c < 100 && !this.isOpd) {
			await slp(Math.floor(rnd(20 * c)) + 100);
			c += 1;
			if (!this.wPeer) continue;
			const cs = this.wPeer.getCandidates();
			io(`WebRTCConn setOnCandidates count:${c}/candidates:${cs}`);
			if (isArr(cs) && cs.length > 0) {
				fn(cs);
				break;
			}
		}
	}
	setCandidates(ci) {
		const c = pv(ci);
		return !isArr(c) ? `setCandidates candidates:${c}` : this.wPeer.setCandidates(c);
	}
	close() {
		this.pO.close();
		this.pA.close();
	}
	isOpened() {
		return this.isTestMode ? true : this.wPeer ? this.wPeer.isOpd() : false;
	}
}
const opt = { optional: [{ DtlsSrtpKeyAgreement: true }, { RtpDataChannels: true }] };
class Peer {
	constructor(n, stunSrvs, l = null) {
		this.name = n;
		this.p = null;
		this.cs = [];
		this.cf = { iceServers: stunSrvs };
		this.l = l;
		this.id = `${now()} ${this.name}`;
		this.q = [];
		this.isOpenDc = false;
	}
	prepareNewConn(isWithDataChannel) {
		return new Promise((resolve, reject) => {
			w('-Peer-prepareNewConn--0----Peer----');
			const p = new RTCPeerConnection(this.cf, opt);
			w('-Peer-prepareNewConn--1----Peer----');
			p.ontrack = (e) => io(`-Peer- peer.ontrack() evt:${e}`);
			// peer.onaddstream = evt => {
			// 	info('-- peer.onaddstream()vevt:' + evt);
			// };
			p.onremovestream = (e) => io(`-Peer- peer.onremovestream() evt:${e}`);
			p.onicecandidate = (e) =>
				e.candidate
					? this.cs.push(e.candidate)
					: io(`-Peer--onicecandidate--- empty ice event peer.localDescription:${p.localDescription}`);
			p.onnegotiationneeded = async () => {
				try {
					io(`-Peer1--onnegotiationneeded----Peer----createOffer() succsess in promise name:${this.name}`);
					const o = await p.createOffer();
					io(
						`-Peer2--onnegotiationneeded----Peer----createOffer() succsess in promise;iceConnectionState;${p.iceConnectionState}`
					);
					await p.setLocalDescription(o);
					io(
						`-Peer3--onnegotiationneeded----Peer----setLocalDescription() succsess in promise;iceConnectionState${p.iceConnectionState}`
					);
					resolve(p);
				} catch (e) {
					reject(e);
					ef(e, this.id, this.l);
				}
			};
			p.oniceconnectionstatechange = () => {
				io(`Peer ICE connection Status has changed to ${p.iceConnectionState}`);
				switch (p.iceConnectionState) {
					case 'closed':
					case 'failed':
						if (this.p && this.isOpd) {
							this.close();
						}
						break;
					case 'disconnected':
						break;
				}
			};
			p.ondatachannel = (e) => {
				w(`-Peer-ondatachannel--1----Peer----evt:${e}`);
				this.dcSetup(e.channel);
			};
			w(`-Peer-prepareNewConn--2----Peer----isWithDataChannel:${isWithDataChannel}`);
			if (isWithDataChannel) this.dcSetup(p.createDataChannel(`chat${now()}`));
		});
	}
	onO(e) {
		io(`Peer.onO is not Overrided name:${this.name}`);
		io(e);
	}
	onError(e) {
		io(`Peer.onError is not Overrided name:${this.name}`);
		io(e);
	}
	onMsg(m) {
		io(`Peer.onMessage is not Overrided name:${this.name}`);
		io(m);
	}
	onClose() {
		io(`Peer.onClose is not Overrided name:${this.name}`);
		io('close');
	}
	dcSetup(dc) {
		if (this.dc && dc.id !== this.dc.id && this.isOpenDc)
			io(`Peer The Data Channel be Closed. readyState:${this.dc.readyState} /${dc.id} !== ${this.dc.id}`);
		dc.onerror = (e) => {
			err('Peer Data Channel Error:', e);
			this.onError(e);
		};
		dc.onmessage = (e) => {
			io(`Peer Got Data Channel Message:typeof:${typeof e.data}/isBlob:${e.data instanceof Blob}`, e.data);
			this.onMsg(e.data);
		};
		dc.onopen = (e) => {
			w(e);
			if (!this.isOpenDc) {
				dc.send(
					`Peer dataChannel Hello World! OPEN SUCCESS! dc.id:${dc.id} label:${dc.label} ordered:${dc.ordered} protocol:${dc.protocol} binaryType:${dc.binaryType} maxPacketLifeTime:${dc.maxPacketLifeTime} maxRetransmits:${dc.maxRetransmits} negotiated:${dc.negotiated}`
				);
				this.onO(e);
				this.isOpenDc = true;
			}
		};
		dc.onclose = () => {
			io('Peer The Data Channel is Closed');
			this.onClose();
			dc.isOpen = false;
		};
		this.dc = dc;
	}
	async mkO() {
		this.p = await this.prepareNewConn(true);
		return this.p.localDescription;
	}
	async mkA() {
		const z = this;
		io('Peer mkAns sending Answer. Creating remote session description...');
		if (!z.p) return err('Peer mkAns peerConnection NOT exist!');
		try {
			const a = await z.p.createAnswer();
			io('Peer mkAns createAnswer() succsess in promise answer:', a);
			await z.p.setLocalDescription(a);
			io(`Peer mkAns setLocalDescription() succsess in promise${z.p.localDescription}`);
			return z.p.localDescription;
		} catch (e) {
			ef(e, z.id, z.l);
		}
	}
	async setOandA(s) {
		w(`Peer setOfferAndAns sdp ${s}`);
		w(s);
		try {
			while (this.cs.length < 1) {
				const o = new RTCSessionDescription({
					type: 'offer',
					sdp: s,
				});
				if (this.p) err('Peer setOfferAndAns peerConnection alreay exist!');
				this.p = await this.prepareNewConn(true);
				w(`Peer setOfferAndAns this.p${this.p} offer:`, o);
				await this.p.setRemoteDescription(o);
				io(`Peer setOfferAndAns setRemoteDescription(answer) succsess in promise name:${this.name}`);
				const a = await this.mkA();
				w(`Peer setOfferAndAns ans ${a}`);
				if (this.cs.length < 1 || a) return a;
				await slp(Math.floor(rnd(1000)) + 1000);
			}
		} catch (e) {
			ef(e, this.id, this.l);
		}
		return null;
	}
	async setA(s) {
		const a = new RTCSessionDescription({
			type: 'answer',
			sdp: ov(s),
		});
		if (!this.p) throw 'Peer peerConnection NOT exist!';
		await this.p.setRemoteDescription(a);
		io('Peer setRemoteDescription(answer) succsess in promise');
		return true;
	}
	isOpd() {
		if (!this.dc) return false;
		let isO = false;
		switch (this.dc.readyState) {
			case 'connecting':
				isO = now() - this.lastSnd < 20000;
				break;
			case 'open':
				isO = true;
				this.lastSnd = now();
				break;
			case 'closing':
			case 'closed':
				isO = false;
				break;
		}
		return isO;
	}
	send(m, bt = 'blob') {
		const z = this;
		const dc = z.dc;
		if (!dc) return false;
		dc.binaryType = bt;
		io(`Connection SEND!; dc.binaryType : ${dc.binaryType}`);
		switch (dc.readyState) {
			case 'connecting':
				io(`Connection not open; queueing: ${m}`);
				z.q.push(m);
				break;
			case 'open':
				z.sendOnQ(bt);
				dc.send(m, bt);
				z.lastSnd = now();
				break;
			case 'closing':
				io(`Attempted to send message while closing: ${m}`);
				z.q.push(m);
				break;
			case 'closed':
				w('Error! Attempt to send while connection closed.');
				z.q.push(m);
				z.close();
				break;
		}
		return dc.readyState;
	}
	sendOnQ(bt) {
		const l = this.q.length;
		for (let i = 0; i < l; i++) this.dc.send(this.q.shift(), bt);
	}
	close() {
		const z = this;
		if (z.p || z.dc) {
			if (z.p && z.p.iceConnectionState !== 'closed') {
				z.p.close();
				z.p = null;
			}
			if (z.dc && z.dc.readyState !== 'closed') {
				z.dc.close();
				z.dc = null;
			}
			io('Peer peerConnection is closed.');
		}
	}
	getCandidates() {
		return this.cs;
	}
	setCandidates(cs) {
		for (const c of cs) {
			io('Peer setCandidates candidate', c);
			this.p.addIceCandidate(c).catch((e) => ef(e, this.id, this.l));
		}
		return 'setCandidates OK';
	}
}
//////Hash Core///////////////////////////////////////////////
export class H {
	static async d(m, sc = 1, algo = 'SHA-256', isAB = false) {
		let r = m.buffer ? (m instanceof Uint8Array ? B64.dpU8a(m) : B.u8a(m.buffer)) : te.encode(m);
		for (let i = 0; i < sc; i++) r = await window.crypto.subtle.digest(algo, r);
		return isAB ? r : B64.a2U(r);
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
class B64 {
	static isSameAb(abA, abB) {
		return B64.a2B(abA) === B64.a2B(abB);
	}
	static isB64(s = '') {
		return s % 4 === 0 && /[+/=0-9a-zA-Z]+/.test(s);
	}
	static s2u(s) {
		return te.encode(s);
	}
	static u2s(u) {
		return td.decode(u);
	}
	static a2B(abi) {
		const ab = abi.buffer ? abi.buffer : abi;
		return window.btoa(B64.u2b(B.u8a(ab)));
	}
	static u2B(u8a) {
		return window.btoa(B64.u2b(u8a));
	}
	static u2I(u) {
		const f = B.u8a(4);
		const l = u.length;
		const n = Math.ceil(l / 4);
		const i32a = B.i32a(n);
		for (let i = 0; i < n; i++) {
			f[0] = u[i + 0];
			f[1] = l < i + 1 ? 0 : u[i + 1];
			f[2] = l < i + 2 ? 0 : u[i + 2];
			f[3] = l < i + 3 ? 0 : u[i + 3];
			i32a[i] = B.i32a(f.buffer)[0];
		}
		return i32a;
	}
	static u8a2u32a(u) {
		const f = B.u8a(4);
		const l = u.length;
		const n = Math.ceil(l / 4);
		const u32a = B.u32a(n);
		for (let i = 0; i < n; i++) {
			f[0] = u[i + 0];
			f[1] = l < i + 1 ? 0 : u[i + 1];
			f[2] = l < i + 2 ? 0 : u[i + 2];
			f[3] = l < i + 3 ? 0 : u[i + 3];
			u32a[i] = B.u32a(f.buffer)[0];
		}
		return u32a;
	}
	static a2U(a) {
		return B64.B2U(B64.a2B(a));
	}
	static B2a(B) {
		return B64.b2u(window.atob(B));
	}
	static U2a(U) {
		return B64.B2a(B64.U2B(U));
	}
	static B2U(B) {
		return B ? B.split('+').join('-').split('/').join('_').split('=').join('') : B;
	}
	static U2B(U) {
		const l = U.length;
		const c = l % 4 > 0 ? 4 - (l % 4) : 0;
		let B = U.split('-').join('+').split('_').join('/');
		for (let i = 0; i < c; i++) B += '=';
		return B;
	}
	static jus(u8as) {
		let sl = 0;
		const c = u8as.length;
		for (let i = 0; i < c; i++) sl += u8as[i].byteLength;
		const a = B.u8a(sl);
		let o = 0;
		for (let i = 0; i < c; i++) {
			const u = u8as[i];
			a.set(u, o);
			o += u.byteLength;
		}
		return a;
	}
	static u2b(u) {
		const r = [];
		for (const e of u) r.push(String.fromCharCode(e));
		return r.join('');
	}
	static b2u(bs) {
		const l = bs.length;
		const a = B.u8a(new ArrayBuffer(l));
		for (let i = 0; i < l; i++) a[i] = bs.charCodeAt(i);
		return a;
	}
	static L2a(b) {
		return new Promise((r) => {
			const fr = new FileReader();
			fr.onload = () => r(fr.result);
			fr.onerror = () => {
				r(fr.error);
				err(fr.error);
			};
			fr.readAsArrayBuffer(b);
		});
	}
	static dpU8a(u) {
		const l = u.length;
		const n = B.u8a(l);
		for (let i = 0; i < l; i++) n[i] = u[i];
		return n;
	}
}
class Cy {
	static async getKey(pass, salt) {
		const pU8A = B64.s2u(pass).buffer;
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
		return saltI ? (isAB ? B.u8a(saltI) : B64.s2u(saltI)) : crv(B.u8a(16));
	}
	static async importKeyAESGCM(kAb, usages = ['encrypt', 'decrypt']) {
		return await crypto.subtle.importKey('raw', kAb, { name: 'AES-GCM' }, true, usages);
	}
	static getFixedField() {
		return crv(B.u8a(12)); // 96bitをUint8Arrayで表すため、96 / 8 = 12が桁数となる。
	}
	static getInvocationField() {
		return crv(B.u32a(1));
	}
	static secureMathRandom() {
		return crv(B.u32a(1))[0] / 4294967295; // 0から1の間の範囲に調整するためにUInt32の最大値(2^32 -1)で割る
	}
	static async encStrAES256GCM(s, pk) {
		return await Cy.encAES256GCM(B64.s2u(s), pk);
	}
	static async encAES256GCM(u8a, pk, saltI = null, isAB) {
		const s = Cy.getSalt(saltI, isAB);
		const k = await Cy.loadKey(pk, s);
		const fp = Cy.getFixedField();
		const ip = Cy.getInvocationField();
		const iv = Uint8Array.from([...fp, ...B.u8a(ip.buffer)]);
		const edAb = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, u8a.buffer);
		// info('encodeAES256GCM encryptedDataAB:', edAb);
		return [
			B64.a2U(edAb), // 暗号化されたデータには、必ず初期ベクトルの変動部とパスワードのsaltを添付して返す。
			B64.a2U(iv.buffer),
			B64.a2U(s.buffer),
		].join(',');
	}
	static async decAES256GCMasStr(ers, pk) {
		return B64.u2s(await Cy.decAES256GCM(ers, pk));
	}
	static async loadKey(pk, salt) {
		const s = isStr(salt) ? B.u8a(B64.U2a(salt)) : salt;
		const [key] = isStr(pk) ? await Cy.getKey(pk, s) : { passk: pk };
		return key;
	}
	static async decAES256GCM(ers, pk) {
		const [edB64U, ip, salt] = ers.split(',');
		const iv = B.u8a(B64.U2a(ip));
		const ed = B64.U2a(edB64U);
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
