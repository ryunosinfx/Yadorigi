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
	constructor(l = console, onRcv = (tdn, m) => io(`ESWebRTCConnU trgtDevNm:${tdn},msg:${m}`)) {
		this.#i = new M(l, onRcv);
	}
	async init(u, g, p, dn) {
		await this.#i.init(u, g, p, dn);
	}
	setOnOpenFunc(fn = dcb) {
		this.#i.onO = fn;
	}
	setOnCloseFunc(fn = dcb) {
		this.#i.onC = fn;
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
}
///////////////////////////
class M {
	constructor(l = console, onRcv = (tdn, m) => io(`M trgtDevNm:${tdn},msg:${m}`)) {
		const z = this;
		z.l = l;
		z.l.log('M');
		z.c = {};
		z.thrds = [];
		z.cfs = {};
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
		return await Cy.enc(Js(o), k);
	}
	async dec(es, k = this.singHash) {
		try {
			return Jp(await Cy.dec(es, k));
		} catch (e) {
			ef(e, es, this.l);
		}
		return null;
	}
	async startWaitAutoConn() {
		const z = this;
		await z.inited;
		z.isStopAuto = z.isWaiting = false;
		let c = 3,
			isFst = true;
		while (z.isStopAuto === false) {
			const gh = z.gHash;
			await slp(WaitAutoInterval / 5);
			if (!gh) continue;
			if (c === 0 || isFst) {
				await z.sndW(gh);
				isFst = false;
				c = 3;
			} else {
				c--;
			}
			const l = await z.getWL(gh);
			if (!isArr(l)) continue;
			z.l.log(l);
			const n = now();
			for (const r of l) {
				const d = n - r.exp;
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
		const c = await z.getCf(gh, tsh, g);
		if (!c || z.isOpd(c)) return;
		await z.sndWN(gh, tsh);
		const l = await z.getWL(gh);
		if (!isArr(l) || l.length < 1) return;
		const y = [];
		const w = z.sgnlH.length;
		const q = tsh.length;
		const a = w + q;
		for (const r of l) {
			const v = pv(r.value);
			if (r.exp < now || v.hash.length < a) continue;
			y.push(Js([r.exp, v.hash]));
		}
		if (y.length < 1) return;
		y.sort();
		y.reverse();
		let isO = false,
			rc = 0,
			isHotS = false;
		for (const t of y) {
			const h = Jp(t)[1];
			if (h.indexOf(z.sgnlH) === 1 && h.indexOf(tsh) >= q) {
				isO = true;
				rc++;
			}
			if (h.indexOf(z.sgnlH) >= w && h.indexOf(tsh) === 1) {
				isO = false;
				rc++;
			}
			if (rc >= 2) break;
		}
		z.nego(c).catch(getEF(now, z.l));
		await slp(100);
		if (isO) {
			await slp(Math.floor(rnd(500)) + 750);
			z.offer(c).catch(getEF(now, z.l));
		}
		st(() => {
			isHotS = false;
			z.isStop = true;
		}, WaitAutoInterval);
		isHotS = true;
		while (isHotS) await slp(100);
		z.isStop = false;
	}
	async sndW(gh) {
		await this.post(
			gh,
			{ msg: WAIT, hash: this.sgnlH, exp: now() + WaitAutoInterval2 + WaitAutoInterval / 5 },
			WAIT
		);
	}
	async sndWN(gh, tsh) {
		await this.post(
			gh,
			{
				msg: WAIT,
				hash: `/${this.sgnlH}/${tsh}`,
				exp: now() + WaitAutoInterval2 + WaitAutoInterval / 5,
			},
			WAIT
		);
	}
	async getWL(gh) {
		const d = await this.load(gh, WAIT);
		const o = d ? Jp(d) : null;
		return o ? o.message : null;
	}
	isOpd(cf) {
		const i = cf.w.isOpened();
		this.l.log(`◆◆M isOpd conf.w.isOpd:${i}:${cf.target}`);
		return i;
	}
	async nego(cf) {
		const z = this;
		cf.isStop = false;
		st(U.getStopFn(cf), WaitAutoInterval);
		while (cf.isStop === false && z.isStopAuto === false) {
			st(() => {
				if (cf.isA) return;
				else if (z.thrds.length < 4) z.thrds.push(1);
				else return;
				z.load(cf.pxOs).then(async (d1) => {
					const ck = await H.d(cf.pxOs + d1);
					z.thrds.pop(1);
					const d = dcd(d1, cf.id, z.l);
					if (d && !cf.cache[ck]) {
						cf.cache[ck] = 1;
						z.listener(cf, OF, d);
					}
				});
			}, SlpMs);
			st(() => {
				if (!cf.isA) return;
				else if (z.thrds.length < 4) z.thrds.push(1);
				else return;
				z.load(cf.pxAs).then(async (data) => {
					const ck = await H.d(cf.pxAs + data);
					z.thrds.pop(1);
					const d = dcd(data, cf.id, z.l);
					if (d && !cf.cache[ck]) {
						cf.cache[ck] = 1;
						z.listener(cf, AN, d);
					}
				});
			}, SlpMs);
			await slp();
		}
		z.rsCf(cf);
	}
	async stopWaitAutoConn() {
		const z = this;
		for (const k in z.cfs) z.cfs[k].isStop = true;
		z.isStopAuto = true;
		for (const k in z.cfs) z.cfs[k].isStop = true;
		await slp(Math.floor(rnd(1000)) + 2500);
		for (const k in z.cfs) z.rsCf(z.cfs[k]);
	}
	async offer(cf) {
		cf.isA = false;
		const o = await cf.w.getOfferSdp();
		this.l.log('M setOnRecieve OFFER post offer:', o);
		await this.post(cf.pxAt, await this.enc(o, cf.nowHK));
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
		const d = await GA.getTxtGAS(this.url, { group: g, cmd: c });
		this.l.log(`M==${n}_${Math.floor(rnd(1000))}====load====${g}/${c} ====${now() - n} data:`, d);
		return d;
	}
	async getConKey(gh, sh) {
		const o = sh === 'test' ? { devName: 'test' } : await this.dec(sh);
		return [Js([gh, o ? o.devName : null]), o];
	}
	async getCf(gh, tsh, g) {
		const z = this;
		const [k, oT] = await z.getConKey(gh, tsh);
		if (!oT) return null;
		const [s] = await z.getConKey(gh, z.sgnlH);
		let c = z.cfs[k];
		const tdn = oT.devName;
		if (!c) {
			c = {
				trgtDevNm: tdn,
				isA: true,
				isGF: false,
				isEx: false,
				pxAt: k + AN,
				pxOt: k + OF,
				pxAs: s + AN,
				pxOs: s + OF,
				isStop: false,
				cache: {},
				id: `${now()} ${z.devName}`,
			};
			c.w = new WebRTCConn(z.l, tsh === 'test');
			c.w.setOnMsg(async (m) => {
				io('conf.w.setOnMsg((msg):', m);
				await z.onMsgByConf(c, tdn, tsh, m);
			});
			c.w.setOnOpen((e) => {
				z.l.log(`####★###OPEN！###★####trgtDevNm:${tdn}`, oT);
				z.onO(e, g, tsh, tdn);
				c.isStop = true;
			});
			c.w.setOnClose((e) => {
				z.l.log(`####☆###CLOSE###☆####trgtDevNm:${tdn}`);
				z.onC(e, g, tsh, tdn);
				c.isStop = false;
			});
			z.cfs[k] = c;
		}
		c.nowHK = oT.nowHash;
		return c;
	}
	async onMsgByConf(cf, tdn, tsh, m) {
		const z = this;
		const ab =
			m instanceof Blob ? await B64.L2a(m) : m.buffer && m.buffer.byteLength ? m.buffer : m.byteLength ? m : null;
		const dU8A = z.A.getBigSndDResFormat(tdn, ab);
		return dU8A
			? io('☆onMsgByConf A', dU8A, m, await z.onRcvBigDRes(cf, tdn, dU8A))
			: (await z.A.isBigSndD(ab, tdn))
			? io('☆onMsgByConf B', ab, m, await z.onRcvBigD(cf, tdn, ab, tsh))
			: !ab && typeof m === 'string'
			? io('☆onMsgByConf C', m, z.onRcvCB(tdn, m))
			: io('☆onMsgByConf D', m, z.onRcvCB(tdn, { ab }));
	}
	rsCf(cf) {
		cf.isA = true;
		cf.isGF = cf.isEx = cf.isStop = false;
		const c = Object.keys(cf.cache);
		for (const k of c) delete cf.cache[k];
		return null;
	}
	async listener(cf, px, ve) {
		const z = this;
		const v = await z.dec(ve, z.nowHash);
		z.l.log(
			`M====LISTENER==RECEIVE=A====px:${px}/${px === AN}//value:${v}/conf.isA:${
				cf.isA
			}/!conf.isGF:${!cf.isGF}/conf.isEx:${cf.isEx}`
		);
		if (cf.w.isOpd || cf.isStop || v === true || v === null || v === 'null')
			return z.l.log(`M====LISTENER==END====value:${v}/conf.isStop:${cf.isStop}`);
		if (cf.isA && px === AN) {
			z.l.log(`M A AS ANSWER conf.isA:${cf.isA} A px:${px} conf.isGF:${cf.isGF}`);
			if (!cf.isGF) {
				const a = await z.ans(cf, v);
				z.l.log(`M====LISTENER==answer=A====typeof answer :${typeof a}`, a);
				await z.post(cf.pxOt, await z.enc(a, cf.nowHK));
				cf.isGF = true;
			} else if (!cf.isEx) {
				cf.isEx = true;
				const c = cf.w.setCandidates(pv(v), now());
				z.l.log('M====LISTENER==answer candidats=A====', c);
			}
		} else if (!cf.isA && px === OF) {
			z.l.log(`M B AS OFFER conf.isA:${cf.isA}/B px:${px}/!conf.isGF:${!cf.isGF}`);
			if (!cf.isGF) {
				const c = await z.conn(cf, v);
				z.l.log('M====LISTENER==make offer candidates=A====', c);
				cf.isGF = true;
				await z.post(cf.pxAt, await z.enc(c, cf.nowHK));
			} else if (!cf.isEx) {
				cf.isEx = true;
				const c = v ? cf.w.setCandidates(pv(v), now()) : null;
				z.l.log('M====LISTENER==set offer candidats=A====', c);
			}
		}
	}
	async ans(cf, o) {
		st(async () => {
			if (cf.isStop) return;
			const c = await cf.w.connAns();
			while (!cf.isGF) await slp(Math.floor(rnd(200)) + 50);
			await this.post(cf.pxOt, await this.enc(c, cf.nowHK));
		});
		return cf.isStop ? null : await cf.w.ans(U.parseSdp(o, this.l));
	}
	conn(cf, si) {
		if (cf.isStop) return;
		const f = async (r) => (cf.isStop ? null : await cf.w.conn(U.parseSdp(si, this.l), (c) => r(c)));
		return new Promise(f);
	}
	closeAll() {
		for (const k in this.cfs) this.cc(this.cfs[k]);
	}
	cc(c) {
		if (c && c.w && c.w.isOpend) return c.w.close() === this.rsCf(c);
	}
	async close(tsh) {
		this.cc(await this.getCf(this.gHash, tsh, this.group));
	}
	async sndBigMsg(tsh, n, t, ab) {
		return await this.A.sndBigD(await this.getCf(this.gHash, tsh, this.group), n, t, ab, this.l);
	}
	async bcBigMsg(n, t, ab) {
		const ps = [];
		for (const k in this.cfs) ps.push(this.A.sndBigD(this.cfs[k], n, t, ab, this.l));
		return Promise.all(ps);
	}
	async sendMsg(tsh, m) {
		U.sndOnDC(await this.getCf(this.gHash, tsh, this.group), m, this.l);
	}
	bcMsg(m) {
		for (const k in this.cfs) U.sndOnDC(this.cfs[k], m, this.l);
	}
	async onRcvBigD(cf, tdn, m, tsh) {
		const z = this;
		const { files, isCmpl, res } = await z.A.rcvBigSndD(cf, m);
		io(`☆ M onRcvBigD A isArr(files):${isArr(files)}/isCmpl:${isCmpl}`, res);
		if (isCmpl && isArr(files)) {
			io(`☆ M onRcvBigD B files.byteLength:${files.byteLength}/isCmpl:${isCmpl}`);
			for (const f of files) {
				io(`☆ M onRcvBigD C file${f}/isCmpl:${isCmpl}`, f);
				if (z.A.isReq(f)) {
					io(`☆ M onRcvBigD D file${f}/isCmpl:${isCmpl}`);
					return await z.onReqD(tdn, f, tsh);
				} else if (z.A.isRes(f)) {
					io(`☆ M onRcvBigD E file${f}/isCmpl:${isCmpl}`);
					return await z.onRes(tdn, f);
				}
				io(`☆ M onRcvBigD F file${f}/isCmpl:${isCmpl}`);
			}
			io(`☆ M onRcvBigD G files:${files}/isCmpl:${isCmpl}`);
			z.onRcvCB(tdn, files);
		}
		return [];
	}
	async onReqD(tdn, f, tsh) {
		const ts = f.type.split('/');
		const PQ = ts.shift();
		const h = ts.pop();
		const { key, type, result, status } = await this.onReq(tdn, f.name, ts.join('/'), f.data);
		const nt = [PQ, status, type, h].join('/');
		return await this.sndBigMsg(tsh, key, this.A.cnvtType2Res(nt), result);
	}
	async onRcvBigDRes(cf, tdn, dU8A) {
		return this.A.isComplBigSndDRes(dU8A)
			? await this.A.rcvBigSndDCompl(dU8A)
			: this.A.isBigSndDRes(dU8A)
			? await this.A.rcvBigSndDRes(dU8A)
			: null;
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
			const c = await z.getCf(z.gHash, tsh, z.group);
			return await z.A.sndBigD(c, kp, nt, ab, z.l);
		};
		return new Promise(fn);
	}
	onRes(tdn, f) {
		const ts = f.type.split('/');
		const s = ts.shift();
		const r = this.reqM.get(ts.pop());
		return r ? r(tdn, f.name, ts.join('/'), f.data, s) : io('onRespons resolve:', r);
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
		const dn = cf.trgtDevNm;
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
		let isS = false,
			isC = false;
		while (isS === false) {
			const r = await this.sndTran(w, sAB, rh, sq, i);
			io(`★★★A sndTranApart E index:${i}/result:${r}`, p);
			if (r === S.COMPLE) isS = isC = true;
			if (r === S.OK) isS = true;
		}
		return isC;
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
		const i = B64.u2I(dU8A.subarray(33, 37))[0];
		const s = dU8A[dU8A.length - 1];
		const m = this.sndM.get(B64.u2B(dU8A.subarray(37, 69)));
		io(`☆☆☆☆A isComplBigSndDRes index:${i}/ESBSU.STATUS[status] :${S.STATUS[s]}/m:`, m);
		return Math.ceil(m.byteLength / S.SIZE) === i && S.STATUS[s] === S.COMPLE;
	}
	async rcvBigSndD(cf, dAB) {
		if (!cf || !cf.w || !cf.w.isOpd) return;
		const w = cf.w;
		const bU8A = B.u8a(dAB).subarray(33); //index,signAll,data
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
				cntr: 0,
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
			let isR = false;
			for (const m of o.m) {
				if (m.name === mt.name && m.type === mt.type) {
					isR = true;
					break;
				}
			}
			if (!isR) {
				o.m.push({ name: mt.name, type: mt.type });
				o.signature = mt.signature;
				o.byteLength = mt.byteLength;
				o.count = mt.count;
				const l = Math.ceil(mt.count / 8);
				const cc = B.u8a(l);
				cc.fill(0);
				o.cntr = cc;
				const cpc = B.u8a(l);
				cpc.fill(255);
				cpc[cc.length - 1] = mt.count % 8 ? Math.pow(2, mt.count % 8) - 1 : 255;
				o.cmpU64 = B64.u2B(cpc);
			}
		} else {
			const ci = Math.floor(i / 8);
			o.cntr[ci] = o.cntr[ci] | (1 << i % 8);
			o.data[(2147483648 + i).toFixed()] = dU8A;
		}
		io(`☆☆☆A rcvBigSndD D index:${i}/m o.cntr:${o.cntr}/o.data:`, o.data);
		io(`☆☆☆A rcvBigSndD E index:${i}/B64U.u8a2Base64(o.cntr):${B64.u2B(o.cntr)}/o.cntr:`, o.cntr);
		const isCmp = o.cmpU64 === B64.u2B(o.cntr);
		io(`☆☆☆A rcvBigSndD F index:${i}/o.cmpU64:${o.cmpU64}/isCmpl:`, isCmp);
		const r0 = await S.mkBigSndDRes(dAB, i);
		io(`☆☆☆A rcvBigSndD G index:${i}/res:`, r0);
		w.send(r0.buffer, 'arraybuffer');
		if (isCmp) {
			io(`☆☆☆A rcvBigSndD H index:${i}/isCmpl:`, isCmp);
			const { united, isValid } = await S.unitD(o);
			const r1 = await S.mkBigSndDRes(dAB, o.count + 1, isValid ? S.COMPLE : S.NG);
			w.send(r1.buffer, 'arraybuffer');
			io(`☆☆☆A rcvBigSndD I index:${i}/isCmpl:${isCmp}/isValid:${isValid}/united:`, united);
			if (isValid) {
				io(`☆☆☆A rcvBigSndD J index:${i}/isValid:`, isValid);
				const fs = [];
				for (const m of o.m) {
					if (!m.type && !m.name) continue;
					fs.push({ name: m.name, type: [m.type].join('/'), data: united });
				}
				return { files: fs, isCmpl: isCmp, res: r1 };
			}
		}
		io(`☆☆☆A rcvBigSndD K index:${i}/isCmpl:${isCmp}/res:`, r0);
		return { res: r0, isCmpl: isCmp };
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
		const f1 = B.u8a(1).fill(B64.s2u(dn)[0]);
		const bl = d.buffer.byteLength;
		const c = Math.ceil(bl / S.SIZE);
		const s = await H.d(d); //BASE64
		const sU8A = B.u8a(B64.U2a(s));
		const j = Js({ type: t, name, signature: s, byteLength: bl, count: c });
		const u = B64.jus([B.u8a(B.i32a(1).fill(-1).buffer), sU8A, B64.s2u(j)]); // 4+32=36
		const sAb = await H.d(u, 1, undefined, true);
		const r = {
			dasendDataAb: B64.jus([f1, B.u8a(sAb), u]).buffer, // 1+32=33 33+36 = 69
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
		const _f = S.bOK(f);
		io(`☆☆☆☆ ESBSU mkBigSndDRes C indexI32A:${iI32a}/signatureU8A.length:${sU8A.length}/signatureU8A:`, sU8A);
		return await S.mkResAb(f1, bU8A, iI32a.buffer, sU8A, _f);
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
		const s = Object.keys(d);
		s.sort();
		io('☆☆☆☆☆ ESBSU unitData B keys:', s);
		const a = [];
		for (const k of s) a.push(d[k]);
		const dU8A = B64.jus(a);
		io(`☆☆☆☆☆ ESBSU unitData C dU8A.length:${dU8A.length}`, dU8A);
		const u = B.u8a(o.byteLength);
		let c = 0;
		for (const k of s) {
			const g = d[k];
			u.set(g, c);
			delete d[k];
			c += g.byteLength;
		}
		s.splice(0, s.length);
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
			z.wPeer.onC = z.onCloseCB;
			z.wPeer.onMsg = z.onMsgCB;
			z.wPeer.onError = z.onErrCB;
			z.isOpd = true;
		};
		z.pA.onO = (e) => {
			z.onOpenCB(e);
			z.wPeer = z.pA;
			z.l.log('-WebRTCConn-onO--1-pAnswer----pAnswer----');
			z.wPeer.onC = z.onCloseCB;
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
		io(`Peer.onO is not Overrided name:${this.name}`, e);
	}
	onError(e) {
		io(`Peer.onError is not Overrided name:${this.name}`, e);
	}
	onMsg(m) {
		io(`Peer.onMessage is not Overrided name:${this.name}`, m);
	}
	onC() {
		io(`Peer.onC is not Overrided name:${this.name}`, 'close');
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
			this.onC();
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
	setCandidates(s) {
		for (const c of s) {
			io('Peer setCandidates candidate', c);
			this.p.addIceCandidate(c).catch((e) => ef(e, this.id, this.l));
		}
		return 'setCandidates OK';
	}
}
const cy = crypto.subtle;
export class H {
	static async d(m, sc = 1, algo = 'SHA-256', isAB = false) {
		let r = m.buffer ? (m instanceof Uint8Array ? B64.dpU8a(m) : B.u8a(m.buffer)) : te.encode(m);
		for (let i = 0; i < sc; i++) r = await cy.digest(algo, r);
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
	static a2B(i) {
		return window.btoa(B64.u2b(B.u8a(i.buffer ? i.buffer : i)));
	}
	static u2B(u) {
		return window.btoa(B64.u2b(u));
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
	static jus(s) {
		let l = 0;
		const c = s.length;
		for (let i = 0; i < c; i++) l += s[i].byteLength;
		const a = B.u8a(l);
		let o = 0;
		for (let i = 0; i < c; i++) {
			const u = s[i];
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
	static async getKey(p, s) {
		const h = await H.d(B64.s2u(p).buffer, 100, 'SHA-256', true);
		const k = await cy.deriveKey(
			{
				name: 'PBKDF2',
				salt: s,
				iterations: 100000,
				hash: 'SHA-256',
			},
			await cy.importKey('raw', h, { name: 'PBKDF2' }, false, ['deriveKey']),
			{ name: 'AES-GCM', length: 256 },
			false,
			['encrypt', 'decrypt']
		);
		return [k, s];
	}
	static getSalt(saltI, isAB) {
		return saltI ? (isAB ? B.u8a(saltI) : B64.s2u(saltI)) : crv(B.u8a(16));
	}
	static async importKeyAESGCM(kAb, usages = ['encrypt', 'decrypt']) {
		return await cy.importKey('raw', kAb, { name: 'AES-GCM' }, true, usages);
	}
	static gFF() {
		return crv(B.u8a(12)); // 96bitをUint8Arrayで表すため、96 / 8 = 12が桁数となる。
	}
	static gIF() {
		return crv(B.u32a(1));
	}
	static srand() {
		return crv(B.u32a(1))[0] / 4294967295; // 0から1の間の範囲に調整するためにUInt32の最大値(2^32 -1)で割る
	}
	static async enc(s, pk) {
		return await Cy.encAES256GCM(B64.s2u(s), pk);
	}
	static async encAES256GCM(u8a, pk, saltI = null, isAB) {
		const s = Cy.getSalt(saltI, isAB);
		const fp = Cy.gFF();
		const ip = Cy.gIF();
		const iv = Uint8Array.from([...fp, ...B.u8a(ip.buffer)]);
		const edAb = await cy.encrypt({ name: 'AES-GCM', iv }, await Cy.lk(pk, s), u8a.buffer);
		return [
			B64.a2U(edAb), // 暗号化されたデータには、必ず初期ベクトルの変動部とパスワードのsaltを添付して返す。
			B64.a2U(iv.buffer),
			B64.a2U(s.buffer),
		].join(',');
	}
	static async dec(ers, pk) {
		return B64.u2s(await Cy.decAES256GCM(ers, pk));
	}
	static async lk(pk, s) {
		const [key] = isStr(pk) ? await Cy.getKey(pk, isStr(s) ? B.u8a(B64.U2a(s)) : s) : { passk: pk };
		return key;
	}
	static async decAES256GCM(ers, p) {
		const [U, ip, s] = ers.split(',');
		try {
			return B.u8a(await cy.decrypt({ name: 'AES-GCM', iv: B.u8a(B64.U2a(ip)) }, await Cy.lk(p, s), B64.U2a(U)));
		} catch (e) {
			ef(e);
			return null;
		}
	}
}
