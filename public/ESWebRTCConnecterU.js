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
const w = (...a) => console.warn(a);
const io = (...a) => console.info(a);
const err = (...a) => console.error(a);
const now = () => Date.now();
const crv = (t) => crypto.getRandomValues(t);
const isStr = (s) => typeof s === 'string';
const isArr = (a) => Array.isArray(a);
const isFn = (s) => typeof s === 'function';
const pr = (f) => new Promise(f);
const ct = (t) => clearTimeout(t);
const st = (f, w) => setTimeout(f, w);
const gBl = (b) => b.byteLength;
const pv = (a) => (a && isStr(a) ? Jp(a) : a);
const ov = (a) => (typeof a === 'object' ? Jp(a) : a);
const cb = (a) => a;
const ef = (e, id = '', l = null) => {
	cb(w(`${id} ${e.message}`), w(e.stack));
	if (l && l.log && l !== console) cb(l.log(`${id} ${e.message}`), l.log(e.stack));
	return null;
};
function getEF(i, l) {
	return (e) => ef(e, i, l);
}
function slp(s = SlpMs) {
	return pr((r) => st(() => r(), s));
}
function dcd(d, i, l) {
	try {
		const o = pv(d);
		return o && o.message ? o.message : null;
	} catch (e) {
		return ef(e, i, l);
	}
}
function mkH(s = [location.origin, navigator.userAgent, now()], st = Math.floor(rnd(100)) + (now() % 100) + 1) {
	return H.d(Js(s), st);
}
function dcb(e, g, t) {
	return e + g + t;
}
export class ESWebRTCConnecterU {
	#i = null;
	constructor(l = console, onR = (tdn, m) => io(`ESWebRTCConnU trgtDevNm:${tdn},msg:${m}`)) {
		this.#i = new M(l, onR);
	}
	init(u, g, p, dn) {
		this.#i.init(u, g, p, dn);
	}
	setOnOpenFunc(fn = dcb) {
		this.#i.onO = fn;
	}
	setOnCloseFunc(fn = dcb) {
		this.#i.onC = fn;
	}
	startWaitAutoConnect() {
		this.#i.startWaitAutoConn();
	}
	stopWaitAutoConnect() {
		this.#i.stopWaitAutoConn();
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
	request(tsh, kp = '/', t = 'GET', m) {
		return this.#i.req(tsh, kp, t, m);
	}
	setOnRequest(c = async (kp, t, d) => cb(d, io(`keyPath:${kp}/type:${t}`, d))) {
		this.#i.setOnReq(c);
	}
}
class M {
	constructor(l = console, onR = (tdn, m) => io(`M trgtDevNm:${tdn},msg:${m}`)) {
		const z = this;
		z.l = l;
		z.l.log('M');
		z.c = {};
		z.thrds = [];
		z.cfs = {};
		z.conns = {};
		z.onRcvCB = onR;
		z.A = new A(onR);
	}
	async init(u, g, p, dn, salt = SALT) {
		const z = this;
		z.l.log('M INIT START');
		z.url = u;
		z.grp = g;
		z.pwd = p;
		z.dn = dn;
		z.hash = await mkH([u, g, p, dn], HshScrtchCnt);
		z.sHash = await mkH([u, g, p, salt], HshScrtchCnt);
		z.gHash = await mkH([u, g, p, salt], HshScrtchCnt);
		z.nHash = await mkH([now(), u, g, p, dn, salt], HshScrtchCnt);
		z.sgnlH = await z.enc({ hash: z.nHash, group: g, devName: dn });
		z.l.log(`M INIT END z.hash:${z.hash} devName:${dn}`);
		z.reqM = new Map();
	}
	enc(o, k = this.sHash) {
		return Cy.enc(Js(o), k);
	}
	async dec(es, k = this.sHash) {
		try {
			return Jp(await Cy.dec(es, k));
		} catch (e) {
			return ef(e, es, this.l);
		}
	}
	async startWaitAutoConn() {
		const z = this;
		await z.inited;
		z.isStopAuto = z.isWaiting = false;
		let c = 3,
			isF = true;
		while (z.isStopAuto === false) {
			const gh = z.gHash;
			await slp(WaitAutoInterval / 5);
			if (!gh) continue;
			if (c === 0 || isF) {
				await z.sndW(gh);
				isF = false;
				c = 3;
			} else c--;
			const l = await z.getWL(gh);
			if (!isArr(l)) continue;
			z.l.log(l);
			const n = now();
			for (const r of l) {
				const d = n - r.exp;
				if (d > 10000) continue;
				const v = pv(r.value);
				if (v.hash !== z.sgnlH && v.hash.indexOf(z.sgnlH) !== 0) {
					await z.onCatchAnother(gh, n, v.hash, z.grp);
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
		if (isO) cb(await slp(Math.floor(rnd(500)) + 750), z.offer(c).catch(getEF(now, z.l)));
		st(() => {
			isHotS = false;
			z.isStop = true;
		}, WaitAutoInterval);
		isHotS = true;
		while (isHotS) await slp(100);
		z.isStop = false;
	}
	sndW(gh) {
		this.p(gh, { msg: WAIT, hash: this.sgnlH, exp: now() + WaitAutoInterval2 + WaitAutoInterval / 5 }, WAIT);
	}
	sndWN(gh, tsh) {
		this.p(
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
		const d = await this.g(gh, WAIT);
		const o = d ? Jp(d) : null;
		return o ? o.message : null;
	}
	isOpd(cf) {
		const i = cf.w.isOpened();
		this.l.log(`◆◆M isOpd conf.w.isOpd:${i}:${cf.target}`);
		return i;
	}
	async nego(c) {
		const z = this;
		c.isStop = false;
		st(U.getStopFn(c), WaitAutoInterval);
		while (c.isStop === false && z.isStopAuto === false) {
			st(() => {
				if (c.isA) return;
				else if (z.thrds.length < 4) z.thrds.push(1);
				else return;
				z.g(c.pxOs).then(async (d1) => {
					const ck = await H.d(c.pxOs + d1);
					z.thrds.pop(1);
					const d = dcd(d1, c.id, z.l);
					if (d && !c.cache[ck]) {
						c.cache[ck] = 1;
						z.listener(c, OF, d);
					}
				});
			}, SlpMs);
			st(() => {
				if (!c.isA) return;
				else if (z.thrds.length < 4) z.thrds.push(1);
				else return;
				z.g(c.pxAs).then(async (data) => {
					const ck = await H.d(c.pxAs + data);
					z.thrds.pop(1);
					const d = dcd(data, c.id, z.l);
					if (d && !c.cache[ck]) {
						c.cache[ck] = 1;
						z.listener(c, AN, d);
					}
				});
			}, SlpMs);
			await slp();
		}
		z.rsCf(c);
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
		this.l.log('M setOnRcv OFFER post offer:', o);
		await this.p(cf.pxAt, await this.enc(o, cf.nowHK));
	}
	async p(g, o, c = 'g') {
		const n = now();
		const d = await GA.post2GAS(this.url, {
			group: g,
			cmd: c,
			data: isStr(o) ? o : Js(o),
		});
		this.l.log(`M==post==${g}/${c} d:${now() - n} data:`, d);
	}
	async g(g, c = 'g') {
		const n = now();
		const d = await GA.getTxtGAS(this.url, { group: g, cmd: c });
		return cb(d, this.l.log(`M==${n}_${Math.floor(rnd(1000))}==load==${g}/${c} ==${now() - n} data:`, d));
	}
	async getCfK(gh, sh) {
		const o = sh === 'test' ? { devName: 'test' } : await this.dec(sh);
		return [Js([gh, o ? o.devName : null]), o];
	}
	async getCf(gh, tsh, g) {
		const z = this;
		const [k, oT] = await z.getCfK(gh, tsh);
		if (!oT) return null;
		const [s] = await z.getCfK(gh, z.sgnlH);
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
				id: `${now()} ${z.dn}`,
			};
			c.w = new WebRTCConn(z.l, tsh === 'test');
			c.w.setMf(async (m) => io('conf.w.setMf((msg):', m, await z.onMsgByCf(c, tdn, tsh, m)));
			c.w.setOf((e) => {
				cb(z.l.log(`###★###OPEN！###★###trgtDevNm:${tdn}`, oT), z.onO(e, g, tsh, tdn));
				c.isStop = true;
			});
			c.w.setCf((e) => {
				cb(z.l.log(`###☆###CLOSE###☆###trgtDevNm:${tdn}`), z.onC(e, g, tsh, tdn));
				c.isStop = false;
			});
			z.cfs[k] = c;
		}
		c.nowHK = oT.nowHash;
		return c;
	}
	async onMsgByCf(c, tdn, tsh, m) {
		const z = this;
		const a = m instanceof Blob ? await Y.L2a(m) : m.buffer && gBl(m.buffer) ? m.buffer : gBl(m) ? m : null;
		const dU8A = z.A.getBigSndDResFormat(tdn, a);
		return dU8A
			? io('☆onMsgByConf A', dU8A, m, await z.onRcvBigDRes(c, tdn, dU8A))
			: (await z.A.isBSD(a, tdn))
			? io('☆onMsgByConf B', a, m, await z.onRcvBigD(c, tdn, a, tsh))
			: !a && typeof m === 'string'
			? io('☆onMsgByConf C', m, z.onRcvCB(tdn, m))
			: io('☆onMsgByConf D', m, z.onRcvCB(tdn, { ab: a }));
	}
	rsCf(c) {
		c.isA = true;
		c.isGF = c.isEx = c.isStop = false;
		const s = Object.keys(c.cache);
		for (const k of s) delete c.cache[k];
		return null;
	}
	async listener(c, px, ve) {
		const z = this;
		const v = await z.dec(ve, z.nHash);
		z.l.log(
			`M==LISTENER==RECEIVE=A==px:${px}/${px === AN}//value:${v}/conf.isA:${
				c.isA
			}/!conf.isGF:${!c.isGF}/conf.isEx:${c.isEx}`
		);
		if (c.w.isOpd || c.isStop || v === true || v === null || v === 'null')
			return z.l.log(`M==LISTENER==END==value:${v}/conf.isStop:${c.isStop}`);
		if (c.isA && px === AN) {
			z.l.log(`M A AS ANSWER conf.isA:${c.isA} A px:${px} conf.isGF:${c.isGF}`);
			if (!c.isGF) {
				const a = await z.ans(c, v);
				z.l.log(`M==LISTENER==answer=A==typeof answer :${typeof a}`, a);
				await z.p(c.pxOt, await z.enc(a, c.nowHK));
				c.isGF = true;
			} else if (!c.isEx) {
				c.isEx = true;
				z.l.log('M==LISTENER==answer candidats=A==', c.w.setCs(pv(v), now()));
			}
		} else if (!c.isA && px === OF) {
			z.l.log(`M B AS OFFER conf.isA:${c.isA}/B px:${px}/!conf.isGF:${!c.isGF}`);
			if (!c.isGF) {
				const o = await z.conn(c, v);
				z.l.log('M==LISTENER==make offer candidates=A==', o);
				c.isGF = true;
				await z.p(c.pxAt, await z.enc(o, c.nowHK));
			} else if (!c.isEx) {
				c.isEx = true;
				z.l.log('M==LISTENER==set offer candidats=A==', v ? c.w.setCs(pv(v), now()) : null);
			}
		}
	}
	async ans(c, o) {
		st(async () => {
			if (c.isStop) return;
			const o = await c.w.connAns();
			while (!c.isGF) await slp(Math.floor(rnd(200)) + 50);
			await this.p(c.pxOt, await this.enc(o, c.nowHK));
		});
		return c.isStop ? null : await c.w.ans(U.pSdp(o, this.l));
	}
	conn(c, si) {
		return c.isStop ? null : pr(async (r) => (c.isStop ? null : await c.w.conn(U.pSdp(si, this.l), (c) => r(c))));
	}
	closeAll() {
		for (const k in this.cfs) this.cc(this.cfs[k]);
	}
	cc(c) {
		if (c && c.w) return c.w.close() === this.rsCf(c);
	}
	async close(h) {
		this.cc(await this.getCf(this.gHash, h, this.grp));
	}
	async sndBigMsg(h, n, t, b) {
		return await this.A.sBD(await this.getCf(this.gHash, h, this.grp), n, t, b, this.l);
	}
	async bcBigMsg(n, t, b) {
		const ps = [];
		for (const k in this.cfs) ps.push(this.A.sBD(this.cfs[k], n, t, b, this.l));
		return Promise.all(ps);
	}
	async sendMsg(h, m) {
		U.sndOnDC(await this.getCf(this.gHash, h, this.grp), m, this.l);
	}
	bcMsg(m) {
		for (const k in this.cfs) U.sndOnDC(this.cfs[k], m, this.l);
	}
	async onRcvBigD(c, d, m, h) {
		const z = this;
		const { files, isCmpl, res } = await z.A.rcvBSD(c, m);
		io(`☆ M onRcvBigD A isArr(files):${isArr(files)}/isCmpl:${isCmpl}`, res);
		if (isCmpl && isArr(files)) {
			io(`☆ M onRcvBigD B files.byteLength:${gBl(files)}/isCmpl:${isCmpl}`);
			for (const f of files) {
				io(`☆ M onRcvBigD C file${f}/isCmpl:${isCmpl}`, f);
				if (z.A.isRq(f)) {
					io(`☆ M onRcvBigD D file${f}/isCmpl:${isCmpl}`);
					return await z.onReqD(d, f, h);
				} else if (z.A.isRs(f)) {
					io(`☆ M onRcvBigD E file${f}/isCmpl:${isCmpl}`);
					return await z.onRes(d, f);
				}
				io(`☆ M onRcvBigD F file${f}/isCmpl:${isCmpl}`);
			}
			io(`☆ M onRcvBigD G files:${files}/isCmpl:${isCmpl}`);
			z.onRcvCB(d, files);
		}
		return [];
	}
	async onReqD(n, f, h) {
		const ts = f.type.split('/');
		const PQ = ts.shift();
		const s = ts.pop();
		const { key, type, result, status } = await this.onReq(n, f.name, ts.join('/'), f.data);
		const nt = [PQ, status, type, s].join('/');
		return await this.sndBigMsg(h, key, this.A.cnvtType2Res(nt), result);
	}
	async onRcvBigDRes(c, n, u) {
		return this.A.isCBSDRs(u)
			? await this.A.rcvBigSndDCompl(u)
			: this.A.isBSDRs(u)
			? await this.A.rcvBSDRs(u)
			: null;
	}
	req(h, kp, t, m) {
		const z = this;
		return pr(async (r) => {
			const a = isStr(m) ? Y.s2u(m) : gBl(m) ? m : m.buffer ? m.buffer : Y.s2u(Js(m));
			const h = await H.d(now() + rnd() + h + kp + SALT + t);
			const th = gBl(m) ? 'arraybuffer' : m.buffer ? 'typedarray' : typeof m;
			const n = `${S.RqH}${th}/${h}`; // PorQ/type/hash
			z.reqM.set(h, r);
			st(() => cb(z.reqM.delete(h), r(S.T_OUT)), S.MaxWaitMs);
			return await z.A.sBD(await z.getCf(z.gHash, h, z.grp), kp, n, a, z.l);
		});
	}
	onRes(n, f) {
		const t = f.type.split('/');
		const s = t.shift();
		const r = this.reqM.get(t.pop());
		return r ? r(n, f.name, t.join('/'), f.data, s) : io('onRespons resolve:', r);
	}
	setOnReq(c = (k, t, d) => cb({ key: k, type: t, result: d, status: 404 }, io(`key:${k}/type:${t}`, d))) {
		this.onReq = c;
	}
}
class A {
	constructor(onCmpCB) {
		this.sM = new Map();
		this.rM = new Map();
		this.onCmpCB = onCmpCB;
	}
	isRq(f) {
		return this.isR(f, S.RqH);
	}
	isRs(f) {
		return this.isR(f, S.RsH);
	}
	isR(f, h) {
		return (
			f && f.type && f.type.indexOf(h) === 0 && f.type.split('/').length >= 3 && Y.isB64(f.type.split('/').pop())
		);
	}
	cnvtType2Res(t) {
		return t ? (t.indexOf(S.RqH) === 0 ? t.replace(S.RqH, S.RsH) : t) : t;
	}
	async isBSD(a, n) {
		const M = S.MIN;
		io(`☆☆A isBSD A devName:${n}/MIN:${M}`, a);
		if (!a || isStr(a) || (!gBl(a) && !a.buffer) || (!a.buffer && gBl(a) < M) || (a.buffer && gBl(a.buffer) < M))
			return false; // 1,256/8=32byte,data
		const b = Y.s2u(n);
		io(`☆☆A isBSD B devName:${n}`, b);
		const f1 = b[0] * 1;
		const d = gBl(a) && gBl(a) > 0 ? B.u8(a) : a.buffer ? B.u8(a.buffer) : NullArr;
		io(`☆☆A isBSD C data.byteLength:${gBl(a)}/f1:${f1}/dU8A[0]:${d[0]}`, d);
		if (f1 !== d[0] * 1) {
			io(`☆☆A isBSD C1 data.byteLength:${gBl(a)}/f1:${f1}/dU8A[0]:${d[0]}/type:${typeof f1}`);
			return false;
		}
		const u = d.subarray(1, 33);
		const z = d.subarray(33);
		const h = Y.a2B(await H.d(z, 1, undefined, true));
		const j = Y.u2B(u);
		const r = j === h;
		io(`☆☆A isBSD D data.byteLength:${gBl(a)}/hU8A:${u}/result:${r}/hB64:${j}/hash:${h}/dhU8A:`, z);
		return r;
	}
	async sBD(c, n, t, a, l = console) {
		l.log(`★★A sBD A sndMsg msg:${a}/${c.w}/${c.w.isOpend}`);
		if (!c || !c.w || !c.w.isOpd) return;
		const w = c.w;
		const dn = c.trgtDevNm;
		const u = B.u8(a);
		const { dasendDataAb, signatureU8A, count, f1 } = await S.mkBSDM(u, dn, t, n);
		io(`★★A sBD B dasendDataAb:${dasendDataAb}`, dasendDataAb);
		const s = Y.a2B(signatureU8A.buffer);
		const q = new Map();
		const i = B.i32(1).fill(-1);
		const h = Y.a2B(await S.mkResAb(f1, B.u8(dasendDataAb).subarray(69), i.buffer, signatureU8A));
		this.sM.set(s, {
			sq: q,
			t,
			n,
			byteLength: gBl(a),
			status: S.SENDING,
		});
		io(`★★A sBD C01 resHashB64:${h}/i:`, h);
		const r = await this.sT(w, dasendDataAb, h, q, -1);
		io(`★★A sBD C02 result:${r}/i:`, i);
		if (r === S.COMPLE) return true;
		if (r === S.T_OUT) return false;
		const b = [];
		for (let i = 0, f = 0; i < count; i++) {
			io(`★★A sBD D count:${count}/i:${i}/offset:`, f);
			const e = i === count - 1 ? gBl(a) : f + S.SZ;
			const p = u.subarray(f, e);
			b.push(this.sTA(w, p, f1, signatureU8A, q, i));
			f = f += S.SZ;
		}
		await Promise.all(b);
		io(`★★A sBD E result:${r}`, r);
	}
	async sTA(w, p, f1, s, sq, i) {
		const a = B.i32(1);
		a.fill(i);
		io(`★★★A sTranA A idx:${i}`, a);
		const rh = Y.u2B(await S.mkResAb(f1, p, a.buffer, s));
		const b = await S.mkBSD(p, f1, s, i);
		io(`★★★A sTranA B resHashB64:${rh}`, rh);
		io(`★★★A sTranA C partU8A:${p}`, p);
		io(`★★★A sTranA D signatureU8A:${s}`, s);
		let isS = false,
			isC = false;
		while (isS === false) {
			const r = await this.sT(w, b, rh, sq, i);
			io(`★★★A sTranA E idx:${i}/result:${r}`, p);
			if (r === S.COMPLE) isS = isC = true;
			if (r === S.OK) isS = true;
		}
		return isC;
	}
	sT(w, a, h = '', q = new Map(), i) {
		ct(q.has(h) ? q.get(h).tm : null);
		return pr((r) => {
			q.set(h, { idx: i, timer: st(() => r(S.T_OUT), S.WaitMs), resolve: r });
			io(`★★★★A snedTran idx:${i}/resHashB64:${h}/ ${a}`, a);
			w.send(a, 'arraybuffer');
		});
	}
	getBigSndDResFormat(n, d) {
		const M = S.MIN;
		io(`☆☆A A getBigSndDResFormat devName:${n}/data:`, d);
		if (
			d === null ||
			isStr(d) ||
			(!gBl(d) && !d.buffer) ||
			(gBl(d) && gBl(d) < M) ||
			(d.buffer && gBl(d.buffer) < M)
		)
			return false;
		io(`☆☆A B getBigSndDResFormat devName:${n}/data:`, d);
		const a = Y.s2u(n);
		const f1 = a[0];
		const b = !isArr(d) && gBl(d) && gBl(d) > 0 ? B.u8(d) : B.u8(d.buffer);
		io(`☆☆A C getBigSndDResFormat f1:${f1}/data:`, d);
		if (f1 !== b[0]) return false;
		const ix = Y.u2I(b.subarray(33, 37))[0];
		io(`☆☆A D getBigSndDResFormat idx:${ix}/f1:`, f1);
		const s = Y.u2B(b.subarray(37, 69));
		const m = this.sM.get(s);
		io(`☆☆A E getBigSndDResFormat signatureB64:${s}/m:`, m);
		return m && m.sq && gBl(m) >= ix * S.SZ && ix >= -1 ? b : null;
	}
	isBSDRs(d) {
		const h = Y.u2B(d);
		const i = Y.u2I(d.subarray(33, 37))[0];
		const s = Y.u2B(d.subarray(37, 69));
		const m = this.sM.get(s);
		const q = m && m.sq ? m.sq : null;
		io(`☆☆☆☆A isBSDRs  A idx:${i}/signatureB64:${s} /hashB64:${h} sq.get(hashB64):/m:`, q.get(h), m);
		const t = q && q.get(h) ? q.get(h) : { idx: null };
		return t.idx === i
			? cb(true, io(`☆☆☆☆A isBSDRs B idx:${i}`), ct(t.timer))
			: cb(false, io(`☆☆☆☆A isBSDRs C idx:${i} task:`, t));
	}
	isCBSDRs(d) {
		const i = Y.u2I(d.subarray(33, 37))[0];
		const s = d[d.length - 1];
		const m = this.sM.get(Y.u2B(d.subarray(37, 69)));
		io(`☆☆☆☆A isCBSDRs idx:${i}/ESBSU.STATUS[status] :${S.ST[s]}/m:`, m);
		return Math.ceil(gBl(m) / S.SZ) === i && S.ST[s] === S.COMPLE;
	}
	async rcvBSD(c, b) {
		if (!c || !c.w || !c.w.isOpd) return;
		const w = c.w;
		const a = B.u8(b).subarray(33); //idx,signAll,data
		const i = Y.u2I(a.subarray(0, 4))[0]; //idx,signAll,data
		const s = Y.u2B(a.subarray(4, 36)); //idx,signAll,data
		const d = a.subarray(36); //idx,signAll,data
		let o = this.rM.get(s);
		io(`☆☆☆A rcvBSD A idx:${i}/signatureB64:`, s);
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
			this.rM.set(s, o);
		}
		io(`☆☆☆A rcvBSD B idx:${i}/o:`, o);
		if (i === -1) {
			io('☆☆☆A rcvBSD C B64U.u8a2str(dU8A):', Y.u2s(d));
			const t = Jp(Y.u2s(d));
			let isR = false;
			for (const m of o.m)
				if (m.name === t.name && m.type === t.type) {
					isR = true;
					break;
				}
			if (!isR) {
				o.m.push({ name: t.name, type: t.type });
				o.signature = t.signature;
				o.byteLength = gBl(t);
				o.count = t.count;
				const l = Math.ceil(t.count / 8);
				const cc = B.u8(l);
				cc.fill(0);
				o.cntr = cc;
				const cpc = B.u8(l);
				cpc.fill(255);
				cpc[cc.length - 1] = t.count % 8 ? Math.pow(2, t.count % 8) - 1 : 255;
				o.cmpU64 = Y.u2B(cpc);
			}
		} else {
			const ci = Math.floor(i / 8);
			o.cntr[ci] = o.cntr[ci] | (1 << i % 8);
			o.data[(2147483648 + i).toFixed()] = d;
		}
		io(`☆☆☆A rcvBSD D idx:${i}/m o.cntr:${o.cntr}/o.data:`, o.data);
		io(`☆☆☆A rcvBSD E idx:${i}/B64U.u8a2Base64(o.cntr):${Y.u2B(o.cntr)}/o.cntr:`, o.cntr);
		const isC = o.cmpU64 === Y.u2B(o.cntr);
		io(`☆☆☆A rcvBSD F idx:${i}/o.cmpU64:${o.cmpU64}/isCmpl:`, isC);
		const r0 = await S.mkBSDRs(b, i);
		io(`☆☆☆A rcvBSD G idx:${i}/res:`, r0);
		w.send(r0.buffer, 'arraybuffer');
		if (isC) {
			io(`☆☆☆A rcvBSD H idx:${i}/isCmpl:`, isC);
			const { united, isV } = await S.unitD(o);
			const r1 = await S.mkBSDRs(b, o.count + 1, isV ? S.COMPLE : S.NG);
			w.send(r1.buffer, 'arraybuffer');
			io(`☆☆☆A rcvBSD I idx:${i}/isCmpl:${isC}/isV:${isV}/united:`, united);
			if (isV) {
				io(`☆☆☆A rcvBSD J idx:${i}/isV:`, isV);
				const fs = [];
				for (const m of o.m)
					if (!m.type && !m.name) continue;
					else fs.push({ name: m.name, type: [m.type].join('/'), data: united });
				return { files: fs, isCmpl: isC, res: r1 };
			}
		}
		io(`☆☆☆A rcvBSD K idx:${i}/isCmpl:${isC}/res:`, r0);
		return { res: r0, isCmpl: isC };
	}
	async rcvBSDRs(d) {
		const li = d.length - 1;
		io(`☆☆☆☆A rcvBSDRs A lastIndex:${li}`);
		const s = S.ST[d[li]];
		d[li] = S.ST.indexOf(S.OK);
		const h = Y.u2B(d);
		const m = this.sM.get(Y.u2B(d.subarray(37, 69)));
		const t = m && m.sq && m.sq.get(h) ? m.sq.get(h) : { idx: null };
		const r = t.resolve;
		return isFn(r) ? r(s) !== true : false;
	}
	async rcvBigSndDCompl(d) {
		const m = this.sM.get(Y.u2B(d.subarray(37, 69)));
		if (m && m.sq)
			for (const [k, v] of m.sq) {
				if (isFn(v)) v(S.COMPLE);
				m.sq.delete(k);
			}
	}
}
class S {
	static SZ = 8000;
	static MIN = 1 + 32 + 4 + 32 + 1;
	static WaitMs = 30000;
	static MaxWaitMs = 60000;
	static RqH = 'Q/';
	static RsH = 'P/';
	static OK = 'OK';
	static NG = 'NG';
	static COMPLE = 'COMPLE';
	static SENDING = 'SENDING';
	static T_OUT = 'TIME_OUT';
	static ST = [S.T_OUT, S.OK, S.NG, S.COMPLE, S.SENDING];
	static async mkBSDM(d, o, t, n) {
		const f1 = B.u8(1).fill(Y.s2u(o)[0]);
		const b = gBl(d.buffer);
		const c = Math.ceil(b / S.SZ);
		const s = await H.d(d); //BASE64
		const a = B.u8(Y.U2a(s));
		const j = Js({ type: t, name: n, signature: s, byteLength: b, count: c });
		const u = Y.jus([B.u8(B.i32(1).fill(-1).buffer), a, Y.s2u(j)]); // 4+32=36
		const h = await H.d(u, 1, undefined, true);
		const r = {
			dasendDataAb: Y.jus([f1, B.u8(h), u]).buffer, // 1+32=33 33+36 = 69
			signatureU8A: a,
			count: c,
			f1,
		};
		return r;
	}
	static async mkBSD(u, f1, s, i) {
		const a = B.i32(1).fill(i);
		const b = Y.jus([B.u8(a.buffer), s, u]);
		const c = await H.d(b, 1, undefined, true);
		const d = Y.jus([f1, B.u8(c), b]);
		const r = d.buffer;
		io('□□ESBigSndUtil mkBSD A result', r);
		return r;
	}
	static async mkBSDRs(d, i = -1, f = S.OK) {
		io(`☆☆☆☆ ESBSU mkBSDRs A idx:${i}/flg:${f}/data:`, d);
		const u = !isArr(d) && gBl(d) && gBl(d) > 0 ? B.u8(d) : B.u8(d.buffer);
		io(`☆☆☆☆ ESBSU mkBSDRs B isArr(d):${isArr(d)}/dU8A.length:${u.length}/dU8A:`, u);
		const f1 = B.u8(1);
		f1[0] = u[0];
		const a = Y.u2I(i > 0 ? B.u8(B.i32(1).fill(i).buffer) : u.subarray(33, 37));
		const s = u.subarray(37, 69);
		const b = u.subarray(69);
		const _f = S.bOK(f);
		io(`☆☆☆☆ ESBSU mkBSDRs C idxI32A:${a}/signatureU8A.length:${s.length}/signatureU8A:`, s);
		return await S.mkResAb(f1, b, a.buffer, s, _f);
	}
	static bOK(f = S.OK) {
		return B.u8(1).fill(S.ST.indexOf(f));
	}
	static async mkResAb(f1, u, iA, s, f = S.bOK()) {
		io(`☆☆☆☆☆ ESBSU mkResAb A f1:${f1}/idxAb:${B.i32(iA)[0]}/signatureU8A:${s.length}/signatureU8A:`, s);
		const h = B.u8(await H.d(u, 1, undefined, true)); //ab
		io(`☆☆☆☆☆ ESBSU mkResAb B f1:${f1}/dU8A.length:${u.length}/hashU8A:${h.length} ${Y.u2B(h)} /dU8A:`, u);
		return Y.jus([f1, h, B.u8(iA), s, f]);
	}
	static async unitD(o) {
		io('☆☆☆☆☆ ESBSU unitD A map:', o);
		if (o.full) return { united: o.full, isV: true };
		const d = o.data;
		const s = Object.keys(d);
		s.sort();
		io('☆☆☆☆☆ ESBSU unitD B keys:', s);
		const a = [];
		for (const k of s) a.push(d[k]);
		const b = Y.jus(a);
		io(`☆☆☆☆☆ ESBSU unitD C dU8A.length:${b.length}`, b);
		const u = B.u8(gBl(o));
		let c = 0;
		for (const k of s) {
			const g = d[k];
			u.set(g, c);
			delete d[k];
			c += gBl(g);
		}
		s.splice(0, s.length);
		const h = await H.d(u);
		io(`☆☆☆☆☆ ESBSU unitD D map.signature:${o.signature} /digest:${h} /united:`, u);
		const i = h === o.signature;
		o.full = i ? u : null;
		return { united: u, isV: i };
	}
}
class U {
	static getStopFn(c) {
		return () => (c.isStop = true);
	}
	static sndOnDC(c, m, l = console, bt = 'blob') {
		return cb(c && c.w && c.w.isOpd ? c.w.send(m, bt) : null, l.log(`Mtil sndMsg msg:${m}`));
	}
	static pSdp(i, l = console) {
		const s = pv(i);
		l.log(`M parseSdp ${typeof i}/sdpInput:${i}`);
		if (!s.sdp) return null;
		s.sdp = s.sdp.replace(/\\r\\n/g, '\r\n');
		l.log(s);
		return s.sdp;
	}
}
const GAB = {
	method: 'POST',
	redirect: 'follow',
	Accept: 'application/json',
	'Content-Type': cType,
	headers: {
		'Content-Type': cType,
	},
};
class GA {
	static c(d) {
		return d && typeof d === 'object'
			? Object.keys(d)
					.map((k) => `${k}=${encodeURIComponent(d[k])}`)
					.join('&')
			: d;
	}
	static async getTxtGAS(p, d = {}) {
		io('GA--getTxtGAS--A--');
		const a = Jp(Js(GAB));
		a.method = 'GET';
		return await (await fetch(`${p}?${GA.c(d)}`, a)).text();
	}
	static async post2GAS(p, d) {
		w('GA--post2GAS--A--', d);
		const a = Jp(Js(GAB));
		a.body = `${GA.c(d)}`;
		return await (await fetch(`${p}`, a)).text();
	}
}
const sS = [
	{
		urls: 'stun:stun.l.google.com:19302',
	},
];
class WebRTCConn {
	constructor(l = console, isTM = false, stunSrv = sS) {
		const z = this;
		z.isTestMode = isTM;
		z.pO = new Peer('OFFER', stunSrv);
		z.pA = new Peer('ANSWER', stunSrv);
		z.p = null;
		z.oOf = z.oCf = z.oMf = z.oEf = () => {};
		z.isOpd = isTM ? true : false;
		z.l = l;
		z.ip = z.init();
	}
	async init() {
		const z = this;
		z.l.log('-WebRTCConn-init--0--WebRTCConn--');
		z.close();
		z.pO.oO = (e) => {
			z.oOf(e);
			z.p = z.pO;
			z.l.log('-WebRTCConn-onO--1-pOffer--WebRTCConn--');
			z.p.oC = z.oCf;
			z.p.oM = z.oMf;
			z.p.oE = z.oEf;
			z.isOpd = true;
		};
		z.pA.oO = (e) => {
			z.oOf(e);
			z.p = z.pA;
			z.l.log('-WebRTCConn-onO--1-pAns--pAns--');
			z.p.oC = z.oCf;
			z.p.oM = z.oMf;
			z.p.oE = z.oEf;
			z.isOpd = true;
		};
		z.l.log(`-WebRTCConn-init--3--WebRTCConn--pOffer:${z.pO.n} --pAns:${z.pA.n}`);
		return true;
	}
	async getOfferSdp() {
		return (await this.ip) ? await this.pO.mkO() : '';
	}
	setOf(f) {
		this.oOf = (e) => w(`-WebRTCConn-onOpenCallBack--1--event:${e}`, f(e));
	}
	setCf(f) {
		this.oCf = (e) => w(`-WebRTCConn-onCloseCallBack--1--event:${e}`, f(e));
	}
	setMf(f) {
		this.oMf = (m) => w(`-WebRTCConn-onMessageCallBack--1--msg:${m}`, f(m));
	}
	setEf(f) {
		this.oEf = (e) => w(`-WebRTCConn-onErrorCallBack--1--error:${e}`, f(e));
	}
	send(m, t = 'blob') {
		io(`WebRTCConn send msg:${m}/binaryType:${t}`);
		return this.isTestMode
			? this.oMf(!isStr(m) && m instanceof Blob ? (m.buffer ? new Blob(m) : gBl(m) ? B.u8(m) : m) : m)
			: this.p.s(m, t);
	}
	async ans(sdp) {
		return !sdp ? null : (await this.ip) ? await this.pA.sOA(sdp) : null;
	}
	async conn(sdp, f) {
		if (!sdp) return null;
		const r = await this.pO.sA(sdp).catch(getEF(now(), this.l));
		this.p = this.pO;
		if (r && f) this.setOnCandidates(f);
		return r;
	}
	connAns() {
		return pr((r) => {
			this.p = this.pA;
			this.setOnCandidates(async (c) => {
				await slp(Math.floor(rnd(400)) + 200);
				r(c);
			});
		});
	}
	async setOnCandidates(f) {
		let c = 1;
		while (c < 100 && !this.isOpd) {
			await slp(Math.floor(rnd(20 * c)) + 100);
			c += 1;
			if (!this.p) continue;
			const cs = this.p.gCs();
			io(`WebRTCConn setOnCandidates count:${c}/candidates:${cs}`);
			if (isArr(cs) && cs.length > 0) {
				f(cs);
				break;
			}
		}
	}
	setCs(i) {
		const c = pv(i);
		return !isArr(c) ? `setCandidates candidates:${c}` : this.p.sCs(c);
	}
	close() {
		this.pO.c();
		this.pA.c();
	}
	isOpened() {
		return this.isTestMode ? true : this.p ? this.p.isO() : false;
	}
}
const opt = { optional: [{ DtlsSrtpKeyAgreement: true }, { RtpDataChannels: true }] };
class Peer {
	constructor(n, stunSrvs, l = null) {
		this.n = n;
		this.p = null;
		this.cs = [];
		this.cf = { iceServers: stunSrvs };
		this.l = l;
		this.id = `${now()} ${this.n}`;
		this.q = [];
		this.isOD = false;
	}
	pNC(isWithDataChannel) {
		return new Promise((rv, rj) => {
			w('-Peer-prepareNewConn--0--');
			const p = new RTCPeerConnection(this.cf, opt);
			w('-Peer-prepareNewConn--1--');
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
					io(`-Peer1--onnegotiationneeded--createOffer() OK in promise name:${this.n}`);
					const o = await p.createOffer();
					io(
						`-Peer2--onnegotiationneeded--createOffer() OK in promise;iceConnectionState;${p.iceConnectionState}`
					);
					await p.setLocalDescription(o);
					io(
						`-Peer3--onnegotiationneeded--setLocalDescription() OK in promise;iceConnectionState${p.iceConnectionState}`
					);
					rv(p);
				} catch (e) {
					rj(e);
					ef(e, this.id, this.l);
				}
			};
			p.oniceconnectionstatechange = () => {
				io(`Peer ICE conn Status has changed to ${p.iceConnectionState}`);
				switch (p.iceConnectionState) {
					case 'closed':
					case 'failed':
						if (this.p && this.isO) {
							this.c();
						}
						break;
					case 'disconnected':
						break;
				}
			};
			p.ondatachannel = (e) => {
				w(`-Peer-ondatachannel--1--evt:${e}`);
				this.dS(e.channel);
			};
			w(`-Peer-prepareNewConn--2--isWithDataChannel:${isWithDataChannel}`);
			if (isWithDataChannel) this.dS(p.createDataChannel(`chat${now()}`));
		});
	}
	oO(e) {
		io(`Peer.onO is not Overrided name:${this.n}`, e);
	}
	oE(e) {
		io(`Peer.onError is not Overrided name:${this.n}`, e);
	}
	oM(m) {
		io(`Peer.onMessage is not Overrided name:${this.n}`, m);
	}
	oC() {
		io(`Peer.onC is not Overrided name:${this.n}`, 'close');
	}
	dS(c) {
		io(`Peer The DataChannel opend. readyState:${c.id} !== ${c.id}`);
		if (this.dc && c.id !== this.dc.id && this.isOD)
			io(`Peer The DataChannel be Closed. readyState:${this.dc.readyState} /${c.id} !== ${this.dc.id}`);
		c.onerror = (e) => cb(err('Peer D C Error:', e), this.oE(e));
		c.onmessage = (e) =>
			cb(io(`Peer Got D C Msg:${typeof e.data}/isBlob:${e.data instanceof Blob}`, e.data), this.oM(e.data));
		c.onopen = (e) => {
			w(e);
			if (!this.isOD) {
				c.send(
					`Peer dataChannel Hello World! OPEN OK! dc.id:${c.id} label:${c.label} ordered:${c.ordered} protocol:${c.protocol} binaryType:${c.binaryType} maxPacketLifeTime:${c.maxPacketLifeTime} maxRetransmits:${c.maxRetransmits} negotiated:${c.negotiated}`
				);
				this.oO(e);
				this.isOD = true;
			}
		};
		c.onclose = () => {
			io('Peer The DataChannel is Closed');
			this.oC();
			c.isOpen = false;
		};
		this.dc = c;
	}
	async mkO() {
		this.p = await this.pNC(true);
		return this.p.localDescription;
	}
	async mkA() {
		const z = this;
		io('Peer mkAns sending Ans. Creating remote session description...');
		if (!z.p) return err('Peer mkAns peerConnection NOT exist!');
		try {
			const a = await z.p.createAnswer();
			io('Peer mkAns createAnswer() ok in promise ans:', a);
			await z.p.setLocalDescription(a);
			io(`Peer mkAns setLocalDescription() ok in promise${z.p.localDescription}`);
			return z.p.localDescription;
		} catch (e) {
			return ef(e, z.id, z.l);
		}
	}
	async sOA(s) {
		w(`Peer setOfferAndAns sdp ${s}`);
		w(s);
		try {
			while (this.cs.length < 1) {
				const o = new RTCSessionDescription({
					type: 'offer',
					sdp: s,
				});
				if (this.p) err('Peer setOfferAndAns peerConnection alreay exist!');
				this.p = await this.pNC(true);
				w(`Peer setOfferAndAns this.p${this.p} offer:`, o);
				await this.p.setRemoteDescription(o);
				io(`Peer setOfferAndAns setRemoteDescription(ans) ok in promise name:${this.n}`);
				const a = await this.mkA();
				w(`Peer setOfferAndAns ans ${a}`);
				if (this.cs.length < 1 || a) return a;
				await slp(Math.floor(rnd(1000)) + 1000);
			}
		} catch (e) {
			return ef(e, this.id, this.l);
		}
	}
	async sA(s) {
		const a = new RTCSessionDescription({
			type: 'answer',
			sdp: ov(s),
		});
		if (!this.p) throw 'Peer peerConnection NOT exist!';
		await this.p.setRemoteDescription(a);
		io('Peer setRemoteDescription(answer) ok in promise');
		return true;
	}
	isO() {
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
	s(m, t = 'blob') {
		const z = this;
		const d = z.dc;
		if (!d) return false;
		d.binaryType = t;
		io(`Conn SEND!; dc.binaryType : ${d.binaryType}`);
		switch (d.readyState) {
			case 'connecting':
				io(`Conn not open; queueing: ${m}`);
				z.q.push(m);
				break;
			case 'open':
				z.sOQ(t);
				d.send(m, t);
				z.lastSnd = now();
				break;
			case 'closing':
				io(`Attempted to send message while closing: ${m}`);
				z.q.push(m);
				break;
			case 'closed':
				w('Error! Attempt to send while connection closed.');
				z.q.push(m);
				z.c();
				break;
		}
		return d.readyState;
	}
	sOQ(bt) {
		const l = this.q.length;
		for (let i = 0; i < l; i++) this.dc.send(this.q.shift(), bt);
	}
	c() {
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
	gCs() {
		return this.cs;
	}
	sCs(s) {
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
		let r = m.buffer ? (m instanceof Uint8Array ? Y.dpU(m) : B.u8(m.buffer)) : te.encode(m);
		for (let i = 0; i < sc; i++) r = await cy.digest(algo, r);
		return isAB ? r : Y.a2U(r);
	}
}
class B {
	static u8(a) {
		return new Uint8Array(a);
	}
	static u32(a) {
		return new Uint32Array(a);
	}
	static i32(a) {
		return new Int32Array(a);
	}
}
class Y {
	static isSameAb(abA, abB) {
		return Y.a2B(abA) === Y.a2B(abB);
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
		return window.btoa(Y.u2b(B.u8(i.buffer ? i.buffer : i)));
	}
	static u2B(u) {
		return window.btoa(Y.u2b(u));
	}
	static u2I(u) {
		const f = B.u8(4);
		const l = u.length;
		const n = Math.ceil(l / 4);
		const i32a = B.i32(n);
		for (let i = 0; i < n; i++) {
			f[0] = u[i + 0];
			f[1] = l < i + 1 ? 0 : u[i + 1];
			f[2] = l < i + 2 ? 0 : u[i + 2];
			f[3] = l < i + 3 ? 0 : u[i + 3];
			i32a[i] = B.i32(f.buffer)[0];
		}
		return i32a;
	}
	static u8a2u32a(u) {
		const f = B.u8(4);
		const l = u.length;
		const n = Math.ceil(l / 4);
		const u32a = B.u32(n);
		for (let i = 0; i < n; i++) {
			f[0] = u[i + 0];
			f[1] = l < i + 1 ? 0 : u[i + 1];
			f[2] = l < i + 2 ? 0 : u[i + 2];
			f[3] = l < i + 3 ? 0 : u[i + 3];
			u32a[i] = B.u32(f.buffer)[0];
		}
		return u32a;
	}
	static a2U(a) {
		return Y.B2U(Y.a2B(a));
	}
	static B2a(B) {
		return Y.b2u(window.atob(B));
	}
	static U2a(U) {
		return Y.B2a(Y.U2B(U));
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
		for (let i = 0; i < c; i++) l += gBl(s[i]);
		const a = B.u8(l);
		let o = 0;
		for (let i = 0; i < c; i++) {
			const u = s[i];
			a.set(u, o);
			o += gBl(u);
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
		const a = B.u8(new ArrayBuffer(l));
		for (let i = 0; i < l; i++) a[i] = bs.charCodeAt(i);
		return a;
	}
	static L2a(b) {
		return new Promise((r) => {
			const fr = new FileReader();
			fr.onload = () => r(fr.result);
			fr.onerror = () => cb(r(fr.error), err(fr.error));
			fr.readAsArrayBuffer(b);
		});
	}
	static dpU(u) {
		const l = u.length;
		const n = B.u8(l);
		for (let i = 0; i < l; i++) n[i] = u[i];
		return n;
	}
}
class Cy {
	static async gK(p, s) {
		const k = await cy.deriveKey(
			{
				name: 'PBKDF2',
				salt: s,
				iterations: 100000,
				hash: 'SHA-256',
			},
			await cy.importKey('raw', await H.d(Y.s2u(p).buffer, 100, 'SHA-256', true), { name: 'PBKDF2' }, false, [
				'deriveKey',
			]),
			{ name: 'AES-GCM', length: 256 },
			false,
			['encrypt', 'decrypt']
		);
		return [k, s];
	}
	static gS(saltI, isAB) {
		return saltI ? (isAB ? B.u8(saltI) : Y.s2u(saltI)) : crv(B.u8(16));
	}
	static async importKeyAESGCM(kAb, usages = ['encrypt', 'decrypt']) {
		return await cy.importKey('raw', kAb, { name: 'AES-GCM' }, true, usages);
	}
	static gFF() {
		return crv(B.u8(12)); // 96bitをUint8Arrayで表すため、96 / 8 = 12が桁数となる。
	}
	static gIF() {
		return crv(B.u32(1));
	}
	static srand() {
		return crv(B.u32(1))[0] / 4294967295; // 0から1の間の範囲に調整するためにUInt32の最大値(2^32 -1)で割る
	}
	static async enc(s, pk) {
		return await Cy.encAES256GCM(Y.s2u(s), pk);
	}
	static async encAES256GCM(u, pk, saltI = null, isAB) {
		const s = Cy.gS(saltI, isAB);
		const iv = Uint8Array.from([...Cy.gFF(), ...B.u8(Cy.gIF().buffer)]);
		const edAb = await cy.encrypt({ name: 'AES-GCM', iv }, await Cy.lk(pk, s), u.buffer);
		return [
			Y.a2U(edAb), // 暗号化されたデータには、必ず初期ベクトルの変動部とパスワードのsaltを添付して返す。
			Y.a2U(iv.buffer),
			Y.a2U(s.buffer),
		].join(',');
	}
	static async dec(ers, pk) {
		return Y.u2s(await Cy.decAES256GCM(ers, pk));
	}
	static async lk(pk, s) {
		return (isStr(pk) ? await Cy.gK(pk, isStr(s) ? B.u8(Y.U2a(s)) : s) : [pk])[0];
	}
	static async decAES256GCM(ers, p) {
		const [U, ip, s] = ers.split(',');
		try {
			return B.u8(await cy.decrypt({ name: 'AES-GCM', iv: B.u8(Y.U2a(ip)) }, await Cy.lk(p, s), Y.U2a(U)));
		} catch (e) {
			return ef(e);
		}
	}
}
const PX = '_A_';
const cache = {};
class LSM {
	static send(cp, i, l = console) {
		this.i = i;
		l.log('===SEND=A=====');
		const m = typeof i === 'string' ? i : Js(i);
		l.log(`send prefix:"${cp}"/message:${m}`);
		const key = `${PX + cp}_${Date.now()}`;
		localStorage.setItem(key, m);
		l.log('===SEND=B=====');
	}
	static setOnRcv(
		cp,
		func = (p, e) => {
			io(p, e);
		},
		l = console
	) {
		l.log(`setOnRcv prefix:${cp}`);
		cache.listene = (event) => {
			// l.log(`OnRecieve prefix:${prefix} "${JSON.stringify(event)}"`);
			// l.log(event);
			const k = event.key;
			// l.log(`key:${key}`);
			const px = `${PX + cp}_`;
			// l.log(px);
			if (k.indexOf(px) === 0) {
				l.log(`OnRecieve callfunc prefix:${cp}`);
				func(cp, event);
			}
		};
		window.addEventListener('storage', cache.listene);
	}
	static rmOnRcv() {
		window.removeEventListener('storage', cache.listene);
	}
}
