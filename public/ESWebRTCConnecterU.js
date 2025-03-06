const te = new TextEncoder('utf-8'),
	td = new TextDecoder('utf-8'),
	OF = '_OFFER',
	AN = '_ANSWER',
	SlpMs = 100,
	WAIT = 'wait',
	rnd = (a = 1) => Math.random() * a,
	WAI = 1000 * 20, //待ち時間20秒
	WAI2 = 1000 * 10 + rnd(15000), //待ち時間10秒＋ランダム15秒
	HSC = 12201,
	NullArr = [null],
	cType = 'application/x-www-form-urlencoded',
	T = true,
	F = false,
	N = null,
	J = JSON,
	Jp = (a) => J.parse(a),
	Js = (a) => J.stringify(a),
	SALT =
		'メロスは激怒した。必ず、かの邪智暴虐じゃちぼうぎゃくの王を除かなければならぬと決意した。メロスには政治がわからぬ。メロスは、村の牧人である。笛を吹き、羊と遊んで暮して来た。けれども邪悪に対しては、人一倍に敏感であった。',
	w = (...a) => console.warn(a),
	io = (...a) => console.info(a),
	err = (...a) => console.error(a),
	now = () => Date.now(),
	crv = (t) => crypto.getRandomValues(t),
	isStr = (s) => typeof s === 'string',
	isArr = (a) => Array.isArray(a),
	isFn = (s) => typeof s === 'function',
	pr = (f) => new Promise(f),
	ct = (t) => clearTimeout(t),
	st = (f, w) => setTimeout(f, w),
	gBl = (b) => b.byteLength,
	pv = (a) => (a && isStr(a) ? Jp(a) : a),
	ov = (a) => (typeof a === 'object' ? Jp(a) : a),
	cb = (a) => a,
	rsm = () => Math.floor(rnd(SlpMs)) + SlpMs,
	ef = (e, id = '', l = N) => {
		cb(w(`${id} ${e.message}`), w(e.stack));
		if (l && isFn(l)) cb(l(`${id} ${e.message}`), l(e.stack));
		return N;
	};
function getEF(i, l) {
	return (e) => ef(e, i, l);
}
function slp(s = rsm()) {
	return pr((r) => st(() => r(), s));
}
function dcd(d, i, l) {
	try {
		const o = pv(d); //parseValue
		return o && o.message ? o.message : N; //メッセージだけ取り出す
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
	#i = N; //Private
	constructor(l = console, onR = (tdn, m) => io(`ESWebRTCConnU trgtDevNm:${tdn},msg:${m}`)) {
		this.#i = new M(l, onR); //ここで実処理モジュールをNew
	}
	init(u, g, p, dn) {
		this.#i.init(u, g, p, dn);
	}
	initAsServer(apis = { 200: [], 500: [] }) {
		this.#i.initAsSrv(apis);
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
//WebRTCモジュール
class M {
	constructor(l = console, onR = (tdn, m) => io(`M trgtDevNm:${tdn},msg:${m}`)) {
		const z = this;
		z.l = (a, b, c) => l.log(a, b, c);
		z.l('M');
		z.c = {};
		z.thrds = [];
		z.cfs = {};
		z.conns = {};
		z.onRcvCB = onR;
		z.A = new A(onR);
	}
	async init(u, g, p, dn, salt = SALT) {
		const z = this;
		z.url = u.indexOf('http') < 0 ? location.origin + (u.indexOf('/') === 0 ? '' : '/') + u : u; //url
		z.grp = g; //group
		z.pwd = p; //password
		z.dn = dn; //デバイス名
		z.hash = await mkH([u, g, p, dn], HSC);
		z.sHash = await mkH([u, g, p, salt], HSC);
		z.gHash = await mkH([u, g, p, salt], HSC); //グループハッシュ
		z.nHash = await mkH([now(), u, g, p, dn, salt], HSC); //デバイス名ハッシュ
		z.sgnlH = await z.enc({ hash: z.nHash, group: g, devName: dn }); //自身のシグナルヘッダー
		z.l(`M INIT z.hash:${z.hash} devName:${dn}`);
		z.reqM = new Map();
	}
	initAsSvr(apis) {
		this.apis = apis;
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
	//コネクション
	async startWaitAutoConn() {
		const z = this;
		await z.inited; //初期化Promiseを待つ
		z.isStopAuto = z.isWaiting = F;
		let c = 3,
			isF = T;
		while (z.isStopAuto === F) {
			const gh = z.gHash;
			await slp(WAI / 5);
			if (!gh) continue;
			if (c === 0 || isF) {
				await z.sndW(gh); //待機情報を送信
				isF = F;
				c = 3;
			} else c--;
			const l = await z.getWL(gh); //待機リストを取得
			if (!isArr(l)) continue;
			z.l('M--getWL--l', l);
			const n = now(); //ループ突入時刻
			for (const r of l) {
				const d = n - r.exp;
				if (d > 10000) continue;
				const v = pv(r.value); //parseValue
				if (v.hash !== z.sgnlH && v.hash.indexOf(z.sgnlH) !== 0) {
					await z.onCatchAnother(gh, n, v.hash, z.grp); //別の何かをキャッチしたとき
					break;
				}
			}
		}
	}
	async onCatchAnother(gh, now, h, g) {
		const z = this,
			hs = h.split('/'), //hashList
			tsh = h.indexOf(z.sgnlH) < 0 ? h : hs[1] !== z.sgnlH ? hs[1] : hs[2], //targetSignalingHash
			c = await z.getCf(gh, tsh, g); //接続設定取得
		if (!c || z.isOpd(c)) return; //接続設定がないか、既に接続中なら離脱
		await z.sndWN(gh, tsh);
		const l = await z.getWL(gh); //待機配列取得
		if (!isArr(l) || l.length < 1) return; //何もないなら離脱
		const y = [],
			w = z.sgnlH.length, //SignalingHashの長さ
			q = tsh.length, //targetSignalingHashの長さ
			a = w + q; //全体の長さ
		for (const r of l) {
			const v = pv(r.value); //parseValue
			if (r.exp < now || v.hash.length < a) continue; //期限切れやおかしい長さは排除
			y.push(Js([r.exp, v.hash]));
		}
		if (y.length < 1) return; //何もないなら離脱
		y.sort();
		y.reverse();
		let isO = F, //isOffer
			rc = 0,
			isHotS = F;
		for (const t of y) {
			const h = Jp(t)[1]; //hashを取得
			if (h.indexOf(z.sgnlH) === 1 && h.indexOf(tsh) >= q) {
				isO = T;
				rc++;
			}
			if (h.indexOf(z.sgnlH) >= w && h.indexOf(tsh) === 1) {
				isO = F;
				rc++;
			}
			if (rc >= 2) break; //2回以上は離脱
			// z.l(`M===onCatchAnother=1=hash:${h}`);
		}
		// z.l(`M===onCatchAnother=1=isOffer:${isO}`);
		z.nego(c).catch(getEF(now, z.l));
		await slp();
		z.l(`M===onCatchAnother=2=isOffer:${isO}`);
		if (isO) cb(await slp(Math.floor(rnd(500)) + 750), z.offer(c).catch(getEF(now, z.l)));
		st(() => {
			isHotS = F;
			z.isStop = T;
		}, WAI);
		isHotS = T;
		while (isHotS) await slp();
		z.isStop = F;
	}
	sndW(gh) {
		return this.p(gh, { msg: WAIT, hash: this.sgnlH, exp: now() + WAI2 + WAI / 5 }, WAIT); //sendWaitingData
	}
	sndWN(gh, tsh) {
		return this.p(
			gh,
			{
				msg: WAIT,
				hash: `/${this.sgnlH}/${tsh}`,
				exp: now() + WAI2 + WAI / 5,
			},
			WAIT
		); //別ノード指定待機情報送信
	}
	async getWL(gh) {
		const d = await this.g(gh, WAIT), //待機リスト取得
			o = d ? Jp(d) : N;
		return o ? o.message : N;
	}
	isOpd(c) {
		const i = c.w.isOp();
		this.l(`◆◆M isOpd conf.w.isOpd:${i}:${c.trgtDevNm}`);
		return i;
	}
	//シグナリングネゴシエーション
	async nego(c) {
		const z = this;
		c.isStop = F; //停止フラグ
		st(U.getStopFn(c), WAI);
		while (c.isStop === F && z.isStopAuto === F) {
			st(async () => {
				if (c.isA) return; //Answerの場合はスキップ
				else if (z.thrds.length < 4) z.thrds.push(1);
				else return; //スレッドが4以上ならスキップ
				const d1 = await z.g(c.pxOs),
					k = await H.d(c.pxOs + d1);
				z.thrds.pop();
				const d = dcd(d1, c.id, z.l);
				z.l(`M--nego offer d:${d}/c.cache[k]:${c.cache[k]}`);
				if (d && !c.cache[k]) {
					c.cache[k] = 1;
					z.lsnr(c, OF, d);
				}
			}, rsm());
			st(async () => {
				if (!c.isA) return; //Offerの場合はスキップ
				else if (z.thrds.length < 4) z.thrds.push(1);
				else return; //スレッドが4以上ならスキップ
				const d2 = await z.g(c.pxAs),
					k = await H.d(c.pxAs + d2); //ハッシュ化
				z.thrds.pop();
				const d = dcd(d2, c.id, z.l);
				z.l(`M--nego ans d:${d}/c.cache[k]:${c.cache[k]}`);
				if (d && !c.cache[k]) {
					c.cache[k] = 1;
					z.lsnr(c, AN, d);
				}
			}, rsm());
			await slp();
		}
		await z.rsCf(c);
	}
	async stopWaitAutoConn() {
		const z = this, //待機停止
			p = [];
		for (const k in z.cfs) z.cfs[k].isStop = T;
		z.isStopAuto = T;
		for (const k in z.cfs) z.cfs[k].isStop = T;
		await slp(Math.floor(rnd(1000)) + 2500);
		for (const k in z.cfs) p.push(z.rsCf(z.cfs[k]));
		await Promise.all(p);
	}
	async offer(c) {
		c.isA = F; //Answerではない
		const o = await c.w.getOfferSdp(); //初回Offer作成
		this.l('M-- OFFER post! offer:', o);
		await this.p(c.pxAt, await this.enc(o, c.nowHK)); //POST to GAS
	}
	async p(g, o, c = 'g') {
		const n = now(), //POST to GAS
			f = {
				group: g,
				cmd: c,
				data: isStr(o) ? o : Js(o),
			},
			d = await GA.p(this.url, f); //POST to GAS
		this.l(`M==post==${g}/${c} d:${now() - n} data:`, d, f);
	}
	async g(g, c = 'g') {
		const n = now(), //GET form GAS
			d = await GA.g(this.url, { group: g, cmd: c });
		return cb(d, this.l(`M==get==${n}_${Math.floor(rnd(1000))}==load==${g}/${c} ==${now() - n} data:`, d));
	}
	async getCfK(gh, sh) {
		const o = sh === 'test' ? { devName: 'test' } : await this.dec(sh); //接続情報キー作成 引数はgroupHashとsignalingHash
		return [Js([gh, o ? o.devName : N]), o];
	}
	async getCf(gh, tsh, g) {
		const z = this, //getConf ネゴシエーション設定取得処理
			[k, oT] = await z.getCfK(gh, tsh); //getConKey
		if (!oT) return N;
		const [s] = await z.getCfK(gh, z.sgnlH), //getConKey
			tdn = oT.devName;
		let c = z.cfs[k];
		if (!c) {
			c = {
				trgtDevNm: tdn,
				isA: T, //isAnaswer
				isGF: F, //isGetFirst
				isEx: F, //isExcangedCandidates
				pxAt: k + AN, // Answer Prefix target
				pxOt: k + OF, // Offer Prefix target
				pxAs: s + AN, //Answer Prefix self
				pxOs: s + OF, //Offer Prefix self
				isStop: F,
				cache: {},
				id: `${now()} ${z.dn}`,
			};
			z.l(`M--1--Create New Conf! tsh:${tsh} # gh:${gh} #`, g);
			z.l(`M--2--Create New Conf! tdn:${tdn} # k:${k} #`, c);
			c.w = new WebRTCConn(z.l, tsh === 'test');
			c.w.setMf(async (m) => io('conf.w.setMf((msg):', m, await z.onMsgByCf(c, tdn, tsh, m)));
			c.w.setOf((e) => {
				cb(z.l(`###★###OPEN！###★###trgtDevNm:${tdn}`, oT), z.onO(e, g, tsh, tdn));
				c.isStop = T;
			});
			c.w.setCf((e) => {
				cb(z.l(`###☆###CLOSE###☆###trgtDevNm:${tdn}`), z.onC(e, g, tsh, tdn));
				z.close(tsh);
				c.isStop = F;
			});
			z.cfs[k] = c;
		}
		c.nowHK = oT.nHash; //nowHashKey
		return c;
	}
	async onMsgByCf(c, tdn, tsh, m) {
		const z = this, //onMsgByConf 接続情報別メッセージ受信処理
			a = m instanceof Blob ? await Y.L2a(m) : m.buffer && gBl(m.buffer) ? m.buffer : gBl(m) ? m : N,
			dU8A = z.A.getBigSndDResFormat(tdn, a);
		return dU8A
			? io('☆onMsgByConf A', dU8A, m, await z.onRcvBigDRes(c, tdn, dU8A))
			: (await z.A.isBSD(a, tdn))
			? io('☆onMsgByConf B', a, m, await z.onRcvBigD(c, tdn, a, tsh))
			: !a && typeof m === 'string'
			? io('☆onMsgByConf C', m, z.onRcvCB(tdn, m))
			: io('☆onMsgByConf D', m, z.onRcvCB(tdn, { ab: a }));
	}
	async rsCf(c) {
		c.isA = T; // resetConf 接続情報リセット
		c.isGF = c.isEx = c.isStop = F;
		const s = Object.keys(c.cache);
		for (const k of s) delete c.cache[k];
		await slp(WAI);
		return M;
	}
	async lsnr(c, px, ve) {
		const z = this, //listener sdp情報リスナー（接続条、prefix、暗号化済み情報）
			v = await z.dec(ve, z.nHash);
		z.l(
			`M==LISTENER==RECEIVE=A==px:${px}/${px === AN}//value:${v}/conf.isA:${
				c.isA
			}/!conf.isGF:${!c.isGF}/conf.isEx:${c.isEx}/c.isStop:${c.isStop}/c.w.isOpd:${c.w.isOpd}`
		);
		if (c.w.isOpd || c.isStop || v === T || v === N || v === 'null')
			return z.l(`M==LISTENER==END==value:${v}/conf.isStop:${c.isStop}`); //値なしは即座に終了
		if (c.isA && px === AN) {
			z.l(`M==LISTENER=A AS ANSWER conf.isA:${c.isA} A px:${px} conf.isGF:${c.isGF}`); //ANSWERの場合
			if (!c.isGF) {
				const a = await z.ans(c, v);
				z.l(`M==LISTENER==answer=A==typeof answer :${typeof a}`, a);
				await z.p(c.pxOt, await z.enc(a, c.nowHK));
				c.isGF = T;
			} else if (!c.isEx) {
				c.isEx = T;
				z.l('M==LISTENER==answer candidats=A==', c.w.setCs(pv(v), now()));
			}
		} else if (!c.isA && px === OF) {
			z.l(`M==LISTENER=B AS OFFER conf.isA:${c.isA}/B px:${px}/!conf.isGF:${!c.isGF}`); //OFFERの場合
			if (!c.isGF) {
				const o = await z.conn(c, v);
				z.l('M==LISTENER==make offer candidates=A==', o);
				c.isGF = T;
				await z.p(c.pxAt, await z.enc(o, c.nowHK));
			} else if (!c.isEx) {
				c.isEx = T;
				z.l('M==LISTENER==set offer candidats=A==', v ? c.w.setCs(pv(v), now()) : N);
			}
		}
	}
	async ans(c, o) {
		st(async () => {
			if (c.isStop) return;
			const o = await c.w.connAns();
			while (!c.isGF) await slp(Math.floor(rnd(300)) + 50);
			await this.p(c.pxOt, await this.enc(o, c.nowHK));
		});
		return c.isStop ? N : await c.w.ans(U.pSdp(o, this.l));
	}
	conn(c, si) {
		return c.isStop ? N : pr(async (r) => (c.isStop ? N : await c.w.conn(U.pSdp(si, this.l), (c) => r(c))));
	}
	closeAll() {
		for (const k in this.cfs) this.cc(k); //全体接続クローズ
	}
	async cc(k) {
		const z = this, //接続クローズ処理
			c = z.cfs[k];
		z.l(`M==CLOSE==c:${c}/k:${k}`);
		delete z.cfs[k];
		return c && c.w ? c.w.close() === (await z.rsCf(c)) : N;
	}
	async close(h) {
		await this.cc((await this.getCfK(this.gHash, h))[0]);
	}
	async sndBigMsg(h, n, t, b) {
		const z = this;
		return await z.A.sBD(await z.getCf(z.gHash, h, z.grp), n, t, b, z.l);
	}
	async bcBigMsg(n, t, b) {
		const z = this,
			ps = [];
		for (const k in z.cfs) ps.push(z.A.sBD(z.cfs[k], n, t, b, z.l));
		return Promise.all(ps);
	}
	async sendMsg(h, m) {
		U.sndOnDC(await this.getCf(this.gHash, h, this.grp), m, this.l);
	}
	bcMsg(m) {
		for (const k in this.cfs) U.sndOnDC(this.cfs[k], m, this.l);
	}
	async onRcvBigD(c, d, m, h) {
		const z = this, //大容量データ受信処理
			{ files, isCmpl, res } = await z.A.rcvBSD(c, m);
		io(`☆ M onRcvBigD A isArr(files):${isArr(files)}/isCmpl:${isCmpl}`, res);
		if (isCmpl && isArr(files)) {
			io(`☆ M onRcvBigD B files.byteLength:${gBl(files)}/isCmpl:${isCmpl}`);
			for (const f of files) {
				io(`☆ M onRcvBigD C file${f}/isCmpl:${isCmpl}`, f);
				if (A.isRq(f)) {
					io(`☆ M onRcvBigD D file${f}/isCmpl:${isCmpl}`);
					return await z.onReqD(d, f, h);
				} else if (A.isRs(f)) {
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
		const ts = f.type.split('/'),
			PQ = ts.shift(),
			s = ts.pop(),
			{ key, type, result, status } = await this.onReq(n, f.name, ts.join('/'), f.data),
			nt = [PQ, status, type, s].join('/');
		return await this.sndBigMsg(h, key, A.cnvtType2Res(nt), result);
	}
	async onRcvBigDRes(c, n, u) {
		return this.A.isCBSDRs(u) ? await this.A.rcvBigSndDCompl(u) : this.A.isBSDRs(u) ? await this.A.rcvBSDRs(u) : N;
	}
	req(h, kp, t, m) {
		const z = this;
		return pr(async (r) => {
			const a = isStr(m) ? Y.s2u(m) : gBl(m) ? m : m.buffer ? m.buffer : Y.s2u(Js(m)),
				h = await H.d(now() + rnd() + h + kp + SALT + t),
				th = gBl(m) ? 'arraybuffer' : m.buffer ? 'typedarray' : typeof m,
				n = `${S.RqH}${th}/${h}`; // PorQ/type/hash
			z.reqM.set(h, r);
			st(() => cb(z.reqM.delete(h), r(S.T_OUT)), S.MaxWaitMs);
			return await z.A.sBD(await z.getCf(z.gHash, h, z.grp), kp, n, a, z.l);
		});
	}
	onRes(n, f) {
		const t = f.type.split('/'),
			s = t.shift(),
			r = this.reqM.get(t.pop());
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
	static isRq = (f) => A.isR(f, S.RqH); //リクエストかどうか
	static isRs = (f) => A.isR(f, S.RsH); //レスポンスかどうか
	static isR = (f, h) =>
		f && f.type && f.type.indexOf(h) === 0 && f.type.split('/').length >= 3 && Y.isB64(f.type.split('/').pop());
	static cnvtType2Res = (t) => (t ? (t.indexOf(S.RqH) === 0 ? t.replace(S.RqH, S.RsH) : t) : t);
	async isBSD(a, n) {
		const M = S.MIN; //大容量データ送信。※データ分割して送信する
		io(`☆☆A isBSD A devName:${n}/MIN:${M}`, a);
		if (!a || isStr(a) || (!gBl(a) && !a.buffer) || (!a.buffer && gBl(a) < M) || (a.buffer && gBl(a.buffer) < M))
			return F; // 1,256/8=32byte,data
		const b = Y.s2u(n);
		io(`☆☆A isBSD B devName:${n}`, b);
		const f1 = b[0] * 1,
			d = gBl(a) && gBl(a) > 0 ? B.u8(a) : a.buffer ? B.u8(a.buffer) : NullArr;
		io(`☆☆A isBSD C data.byteLength:${gBl(a)}/f1:${f1}/dU8A[0]:${d[0]}`, d);
		if (f1 !== d[0] * 1) {
			io(`☆☆A isBSD C1 data.byteLength:${gBl(a)}/f1:${f1}/dU8A[0]:${d[0]}/type:${typeof f1}`);
			return F;
		}
		const u = d.subarray(1, 33),
			z = d.subarray(33),
			h = Y.a2B(await H.d(z, 1, undefined, T)),
			j = Y.u2B(u),
			r = j === h;
		io(`☆☆A isBSD D data.byteLength:${gBl(a)}/hU8A:${u}/result:${r}/hB64:${j}/hash:${h}/dhU8A:`, z);
		return r;
	}
	async sBD(c, n, t, a, l) {
		l(`★★A sBD A sndMsg msg:${a}/${c.w}/${c.w.isOpend}`); //大容量データ送信
		if (!c || !c.w || !c.w.isOpd) return; //接続がない場合は離脱
		const w = c.w,
			dn = c.trgtDevNm,
			u = B.u8(a),
			{ dasendDataAb, signatureU8A, count, f1 } = await S.mkBSDM(u, dn, t, n);
		io(`★★A sBD B dasendDataAb:${dasendDataAb}`, dasendDataAb);
		const s = Y.a2B(signatureU8A.buffer),
			q = new Map(),
			i = B.i32(1).fill(-1),
			h = Y.a2B(await S.mkResAb(f1, B.u8(dasendDataAb).subarray(69), i.buffer, signatureU8A));
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
		if (r === S.COMPLE) return T; //送信完了
		if (r === S.T_OUT) return F;
		const b = [];
		for (let i = 0, f = 0; i < count; i++) {
			io(`★★A sBD D count:${count}/i:${i}/offset:`, f);
			const e = i === count - 1 ? gBl(a) : f + S.SZ,
				p = u.subarray(f, e); //送信データを分割切り出し
			b.push(this.sTA(w, p, f1, signatureU8A, q, i));
			f = f += S.SZ;
		}
		const g = await Promise.all(b);
		io(`★★A sBD E result:${r}`, r);
		for (const r of g) if (!r) return F; //一個でも空があれば送信失敗
		return T;
	}
	async sTA(w, p, f1, s, sq, i) {
		const a = B.i32(1); //大容量データ送信sendTranApart 1部分送信(wwbrtc接続, partU8A, f1シグネチャ, signatureU8A, sendQueue, index)
		a.fill(i);
		io(`★★★A sTranA A idx:${i}`, a);
		const rh = Y.u2B(await S.mkResAb(f1, p, a.buffer, s)), //予想返信データを作成
			b = await S.mkBSD(p, f1, s, i); //送信データ作成
		io(`★★★A sTranA B resHashB64:${rh}`, rh);
		io(`★★★A sTranA C partU8A:${p}`, p);
		io(`★★★A sTranA D signatureU8A:${s}`, s);
		let isS = F, //送信成功フラグ
			isC = F; //完了フラグ
		while (isS === F) {
			const r = await this.sT(w, b, rh, sq, i); //送信
			io(`★★★A sTranA E idx:${i}/result:${r}`, p);
			if (r === S.COMPLE) isS = isC = T;
			if (r === S.OK) isS = T;
		}
		return isC;
	}
	sT(w, a, h = '', q = new Map(), i) {
		ct(q.has(h) ? q.get(h).tm : N); //タイマーをクリア
		return pr((r) => {
			q.set(h, { idx: i, timer: st(() => r(S.T_OUT), S.WaitMs), resolve: r }); //キューに受信タスクを設定
			io(`★★★★A snedTran idx:${i}/resHashB64:${h}/ ${a}`, a);
			w.send(a, 'arraybuffer'); //実送信
		});
	}
	getBigSndDResFormat(n, d) {
		const M = S.MIN;
		io(`☆☆A A getBigSndDResFormat devName:${n}/data:`, d);
		if (d === N || isStr(d) || (!gBl(d) && !d.buffer) || (gBl(d) && gBl(d) < M) || (d.buffer && gBl(d.buffer) < M))
			return F;
		io(`☆☆A B getBigSndDResFormat devName:${n}/data:`, d);
		const a = Y.s2u(n),
			f1 = a[0],
			b = !isArr(d) && gBl(d) && gBl(d) > 0 ? B.u8(d) : B.u8(d.buffer);
		io(`☆☆A C getBigSndDResFormat f1:${f1}/data:`, d);
		if (f1 !== b[0]) return F;
		const ix = Y.u2I(b.subarray(33, 37))[0];
		io(`☆☆A D getBigSndDResFormat idx:${ix}/f1:`, f1);
		const s = Y.u2B(b.subarray(37, 69)),
			m = this.sM.get(s);
		io(`☆☆A E getBigSndDResFormat signatureB64:${s}/m:`, m);
		return m && m.sq && gBl(m) >= ix * S.SZ && ix >= -1 ? b : N;
	}
	isBSDRs(d) {
		const h = Y.u2B(d), //isBigSendDataResponse,大量データ応答なのかチェック
			i = Y.u2I(d.subarray(33, 37))[0],
			s = Y.u2B(d.subarray(37, 69)),
			m = this.sM.get(s),
			q = m && m.sq ? m.sq : N,
			t = q && q.get(h) ? q.get(h) : { idx: N };
		io(`☆☆☆☆A isBSDRs  A idx:${i}/signatureB64:${s} /hashB64:${h} sq.get(hashB64):/m:`, q.get(h), m);
		return t.idx === i
			? cb(T, io(`☆☆☆☆A isBSDRs B idx:${i}`), ct(t.timer))
			: cb(F, io(`☆☆☆☆A isBSDRs C idx:${i} task:`, t));
	}
	isCBSDRs(d) {
		const i = Y.u2I(d.subarray(33, 37))[0], //isComplBigSendDataRes,大量データ完了応答なのかチェック
			s = d[d.length - 1],
			m = this.sM.get(Y.u2B(d.subarray(37, 69)));
		io(`☆☆☆☆A isCBSDRs idx:${i}/ESBSU.STATUS[status] :${S.ST[s]}/m:`, m);
		return Math.ceil(gBl(m) / S.SZ) === i && S.ST[s] === S.COMPLE;
	}
	async rcvBSD(c, b) {
		if (!c || !c.w || !c.w.isOpd) return; //recieveBigSendData,大容量データ受信
		const w = c.w,
			a = B.u8(b).subarray(33), //idx,signAll,data
			i = Y.u2I(a.subarray(0, 4))[0], //idx,signAll,data
			s = Y.u2B(a.subarray(4, 36)), //idx,signAll,data
			d = a.subarray(36); //idx,signAll,data
		let o = this.rM.get(s);
		io(`☆☆☆A rcvBSD A idx:${i}/signatureB64:`, s);
		if (!o) {
			o = {
				m: [{ type: N, name: N }],
				signature: N,
				byteLength: N,
				count: N,
				cntr: 0,
				data: {},
				full: N,
				cmpU64: N,
			};
			this.rM.set(s, o);
		}
		io(`☆☆☆A rcvBSD B idx:${i}/o:`, o);
		if (i === -1) {
			io('☆☆☆A rcvBSD C B64U.u8a2str(dU8A):', Y.u2s(d));
			const t = Jp(Y.u2s(d));
			let isR = F;
			for (const m of o.m)
				if (m.name === t.name && m.type === t.type) {
					isR = T;
					break;
				}
			if (!isR) {
				o.m.push({ name: t.name, type: t.type });
				o.signature = t.signature;
				o.byteLength = gBl(t);
				o.count = t.count;
				const l = Math.ceil(t.count / 8),
					cc = B.u8(l),
					cpc = B.u8(l);
				cc.fill(0);
				o.cntr = cc;
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
			const { united, isV } = await S.unitD(o),
				r1 = await S.mkBSDRs(b, o.count + 1, isV ? S.COMPLE : S.NG);
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
		const h = Y.u2B(d),
			m = this.sM.get(Y.u2B(d.subarray(37, 69))),
			t = m && m.sq && m.sq.get(h) ? m.sq.get(h) : { idx: N },
			r = t.resolve;
		return isFn(r) ? r(s) !== T : F;
	}
	async rcvBigSndDCompl(d) {
		const m = this.sM.get(Y.u2B(d.subarray(37, 69))); //大容量データ完了化処理※問答無用
		if (m && m.sq)
			for (const [k, v] of m.sq) {
				if (isFn(v)) v(S.COMPLE);
				m.sq.delete(k);
			}
	}
}
//各種定数分
class S {
	static SZ = 8000; //分割サイズByte
	static MIN = 1 + 32 + 4 + 32 + 1; //最小サイズ
	static WaitMs = 30000;
	static MaxWaitMs = 60000;
	static RqH = 'Q/'; //REQUEST_HEADER
	static RsH = 'P/'; //RESPONSE_HEADER
	static OK = 'OK';
	static NG = 'NG';
	static COMPLE = 'COMPLE';
	static SENDING = 'SENDING';
	static T_OUT = 'TIME_OUT';
	static ST = [S.T_OUT, S.OK, S.NG, S.COMPLE, S.SENDING];
	static async mkBSDM(d, o, t, n, p, r) {
		//大規模データ
		const f1 = B.u8(1).fill(Y.s2u(o)[0]),
			b = gBl(d.buffer),
			c = Math.ceil(b / S.SZ),
			s = await H.d(d), //BASE64
			a = B.u8(Y.U2a(s)),
			j = Js({ type: t, name: n, signature: s, byteLength: b, count: c, path: p, rid: r }),
			u = Y.jus([B.u8(B.i32(1).fill(-1).buffer), a, Y.s2u(j)]), // 4+32=36
			h = await H.d(u, 1, undefined, T);
		return {
			dasendDataAb: Y.jus([f1, B.u8(h), u]).buffer, // 1+32=33 33+36 = 69
			signatureU8A: a,
			count: c,
			f1,
		};
	}
	static async mkBSD(u, f1, s, i) {
		const a = B.i32(1).fill(i), //大容量データ送信単位作成
			b = Y.jus([B.u8(a.buffer), s, u]),
			c = await H.d(b, 1, undefined, T),
			d = Y.jus([f1, B.u8(c), b]),
			r = d.buffer;
		io('□□ESBigSndUtil mkBSD A result', r);
		return r;
	}
	static async mkBSDRs(d, i = -1, f = S.OK) {
		io(`☆☆☆☆ ESBSU mkBSDRs A idx:${i}/flg:${f}/data:`, d);
		const u = !isArr(d) && gBl(d) && gBl(d) > 0 ? B.u8(d) : B.u8(d.buffer); //大容量データ送信単位リスト作成
		io(`☆☆☆☆ ESBSU mkBSDRs B isArr(d):${isArr(d)}/dU8A.length:${u.length}/dU8A:`, u);
		const f1 = B.u8(1), //ヘッダー
			a = Y.u2I(i > 0 ? B.u8(B.i32(1).fill(i).buffer) : u.subarray(33, 37)),
			s = u.subarray(37, 69),
			b = u.subarray(69),
			_f = S.bOK(f); //flag
		f1[0] = u[0];
		io(`☆☆☆☆ ESBSU mkBSDRs C idxI32A:${a}/signatureU8A.length:${s.length}/signatureU8A:`, s);
		return await S.mkResAb(f1, b, a.buffer, s, _f); //ArrayBufferに変換
	}
	static bOK = (f = S.OK) => B.u8(1).fill(S.ST.indexOf(f));
	static async mkResAb(f1, u, iA, s, f = S.bOK()) {
		io(`☆☆☆☆☆ ESBSU mkResAb A f1:${f1}/idxAb:${B.i32(iA)[0]}/signatureU8A:${s.length}/signatureU8A:`, s);
		const h = B.u8(await H.d(u, 1, undefined, T)); //ab//大容量データ送信単位のレスポンスバイナリ作成
		io(`☆☆☆☆☆ ESBSU mkResAb B f1:${f1}/dU8A.length:${u.length}/hashU8A:${h.length} ${Y.u2B(h)} /dU8A:`, u);
		return Y.jus([f1, h, B.u8(iA), s, f]); //バイナリ連結
	}
	static async unitD(o) {
		io('☆☆☆☆☆ ESBSU unitD A map:', o);
		if (o.full) return { united: o.full, isV: T }; //データ連結が必要ない場合はそのまま返す
		const d = o.data,
			s = Object.keys(d),
			a = [];
		s.sort();
		io('☆☆☆☆☆ ESBSU unitD B keys:', s);
		for (const k of s) a.push(d[k]);
		const b = Y.jus(a), //バイナリ連結
			u = B.u8(gBl(o));
		io(`☆☆☆☆☆ ESBSU unitD C dU8A.length:${b.length}`, b);
		let c = 0;
		for (const k of s) {
			const g = d[k];
			u.set(g, c);
			delete d[k];
			c += gBl(g);
		}
		s.splice(0, s.length);
		const h = await H.d(u); //送信情報のハッシュ値を取得
		io(`☆☆☆☆☆ ESBSU unitD D map.signature:${o.signature} /digest:${h} /united:`, u);
		const i = h === o.signature;
		o.full = i ? u : N;
		return { united: u, isV: i };
	}
}
class U {
	static getStopFn = (c) => () => (c.isStop = T); //停止関数取得
	static sndOnDC = (c, m, l, bt = 'arraybuffer') =>
		cb(c && c.w && c.w.isOpd ? c.w.send(m, bt) : N, l(`Mtil sndMsg msg:${m}`));
	static pSdp(i, l) {
		const s = pv(i); // parseValue
		l(`U parseSdp ${typeof i}/sdpInput:${i}`);
		if (!s.sdp) return N; //sdpがない場合はnullを返す
		s.sdp = s.sdp.replace(/\\r\\n/g, '\r\n');
		l(s);
		return s.sdp;
	}
}
//GAS用APIコール
const GAB = `{"method": "POST","redirect": "follow","Accept": "application/json","Content-Type": "${cType}","RequestMode":"no-cors","headers": {"Content-Type": "${cType}"}}`;
class GA {
	static m = (u) => (u && u.indexOf(location.origin) > 0 ? 'no-cors' : 'cors');
	static c = (d) =>
		d && typeof d === 'object'
			? Object.keys(d)
					.map((k) => `${k}=${encodeURIComponent(d[k])}`)
					.join('&')
			: d;

	static async g(p, d = {}) {
		io('GA--getTxtGAS--A--');
		const a = Jp(GAB);
		a.method = 'GET';
		a.mode = GA.m(p);
		return await (await fetch(`${p}?${GA.c(d)}`, a)).text();
	}
	static async p(p, d) {
		w('GA--post2GAS--A--', d, p);
		const a = Jp(GAB);
		a.body = `${GA.c(d)}`;
		a.mode = GA.m(p);
		try {
			const b = await fetch(`${p}`, a);
			return await b.text();
		} catch (e) {
			w('GA--post2GAS--B--', e);
		}
	}
}
const sS = [
	{
		urls: 'stun:stun.l.google.com:19302', //STUNサーバー
	},
];
class WebRTCConn {
	constructor(l, isTM = F, stunSrv = sS) {
		const z = this;
		z.isTestMode = isTM;
		z.pO = new Peer('OFFER', stunSrv);
		z.pA = new Peer('ANSWER', stunSrv);
		z.p = N;
		z.oOf = z.oCf = z.oMf = z.oEf = () => {};
		z.isOpd = isTM ? T : F;
		z.l = l;
		z.ip = z.init();
	}
	async init() {
		const z = this;
		z.l('-WebRTCConn-init--0--');
		z.close();
		z.pO.oO = (e) => {
			z.oOf(e);
			z.p = z.pO;
			z.p.oC = z.oCf;
			z.p.oM = z.oMf;
			z.p.oE = z.oEf;
			z.l('-WebRTCConn-onO--1-pOffer--');
			z.isOpd = T;
		};
		z.pA.oO = (e) => {
			z.oOf(e);
			z.p = z.pA;
			z.p.oC = z.oCf;
			z.p.oM = z.oMf;
			z.p.oE = z.oEf;
			z.l('-WebRTCConn-onO--1-pAns--');
			z.isOpd = T;
		};
		z.l(`-WebRTCConn-init--3--pOffer:${z.pO.n}/${z.pO.oO} --pAns:${z.pA.n}/${z.pA.oO}`);
		return T;
	}
	async getOfferSdp() {
		return (await this.ip) ? await this.pO.mkO() : '';
	}
	onC() {
		this.isOpd = this.isOp();
	}
	setOf(f) {
		this.oOf = (e) => w(`-WebRTCConn-onOpenCB--1--event:${e}`, f(e));
	}
	setCf(f) {
		this.oCf = (e) => w(`-WebRTCConn-onCloseCB--1--event:${e}`, this.onC(), f(e));
	}
	setMf(f) {
		this.oMf = (m) => w(`-WebRTCConn-onMessageCB--1--msg:${m}`, f(m));
	}
	setEf(f) {
		this.oEf = (e) => w(`-WebRTCConn-onErrorCB--1--error:${e}`, f(e));
	}
	send(m, t = 'arraybuffer') {
		io(`WebRTCConn send msg:${m}/binaryType:${t}`);
		return this.isTestMode
			? this.oMf(!isStr(m) && m instanceof Blob ? (m.buffer ? new Blob(m) : gBl(m) ? B.u8(m) : m) : m)
			: this.p.s(m, t);
	}
	async ans(sdp) {
		return !sdp ? N : (await this.ip) ? await this.pA.sOA(sdp) : N;
	}
	async conn(sdp, f) {
		if (!sdp) return N;
		const z = this,
			r = await z.pO.sA(sdp).catch(getEF(now(), z.l));
		z.p = z.pO;
		if (r && f) z.setOnCandidates(f);
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
			c++;
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
	isOp() {
		return this.isTestMode ? T : this.p ? this.p.isO() : F;
	}
}
const opt = { optional: [{ DtlsSrtpKeyAgreement: T }, { RtpDataChannels: T }] };
class Peer {
	constructor(n, stunSrvs, l = N) {
		const z = this;
		z.n = n;
		z.p = N;
		z.cs = [];
		z.cf = { iceServers: stunSrvs };
		z.l = l;
		z.id = `${now()} ${z.n}`;
		z.q = [];
		z.isOD = F;
		z.isCo = F;
	}
	pNC(isWDC = 1) {
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
					: io(`-Peer--onicecandidate--- empty ice event:${p.localDescription}/e.candidate:${e.candidate}`);
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
			p.oniceconnectionstatechange = (e) => {
				const z = this,
					i = p.iceConnectionState;
				io(`Peer ICE conn Status has changed to ${i}/name:${z.n}`, e);
				if (i === 'connected') {
					st(() => (z.dc.readyState !== 'open' ? z.c() : N), 100);
					z.isCo = T;
				} else if (i === 'checking') z.isCo = T;
				else if (i === 'closed' || i === 'failed') {
					if (z.p && z.isO) z.c();
					z.isCo = F;
				} else if (i === 'disconnected') z.isCo = F;
			};
			p.ondatachannel = (e) => {
				w(`-Peer-ondatachannel--1--evt:${e}`);
				this.dS(e.channel);
			};
			w(`-Peer-prepareNewConn--2--isWithDataChannel:${isWDC}`);
			if (isWDC) this.dS(p.createDataChannel(`chat${now()}`));
		});
	}
	oO(e) {
		io(`Peer.onO is no setting name:${this.n}`, e);
	}
	oE(e) {
		io(`Peer.onError is no setting name:${this.n}`, e);
	}
	oM(m) {
		io(`Peer.onMessage is no setting name:${this.n}`, m);
	}
	oC() {
		io(`Peer.onC is no setting name:${this.n}`, 'close');
	}
	dS(c) {
		const z = this;
		io(`Peer The DataChannel SetupStart. readyState:${c.id} !== ${c.id}`);
		if (z.dc && c.id !== z.dc.id && z.isOD)
			io(`Peer The DataChannel be Closed. readyState:${z.dc.readyState} /${c.id} !== ${z.dc.id}`);
		c.onerror = (e) => cb(err('Peer D C Error:', e), z.oE(e));
		c.onmessage = (e) =>
			cb(io(`Peer Got D C Msg:${typeof e.data}/isBlob:${e.data instanceof Blob}`, e.data), z.oM(e.data));
		c.onopen = (e) => {
			w('dc onopen', e, z.dc.readyState);
			if (!z.isOD) {
				c.send(
					`Peer dataChannel Hello World! OPEN OK! dc.id:${c.id} label:${c.label} ordered:${c.ordered} protocol:${c.protocol} binaryType:${c.binaryType} maxPacketLifeTime:${c.maxPacketLifeTime} maxRetransmits:${c.maxRetransmits} negotiated:${c.negotiated}`
				);
				z.oO(e);
				z.isOD = T;
			}
		};
		c.onclose = () => {
			io('Peer The DataChannel is Closed');
			z.oC();
			c.isOpen = F;
		};
		z.dc = c;
	}
	async mkO() {
		this.p = await this.pNC(); //Offer作るよ
		return this.p.localDescription;
	}
	async mkA() {
		const z = this; //Answer作るよ
		io('Peer mkAns sending Ans. Creating remote session description...');
		if (!z.p) return err('Peer mkAns peerConnection NOT exist!');
		try {
			const a = await z.p.createAnswer();
			io('Peer mkAns createAnswer() ok in promise ans:', a);
			await z.p.setLocalDescription(a);
			io(`Peer mkAns setLocalDescription() ok in promise${z.p.localDescription}`);
			return z.p.localDescription;
		} catch (e) {
			return ef(e, z.id, z.l); //エラーレポート
		}
	}
	async sOA(s) {
		w(`Peer setOfferAndAns sdp ${s}`, s);
		const z = this; //Offer設定してAnswer作るよ
		try {
			while (z.cs.length < 1) {
				const o = new RTCSessionDescription({
					type: 'offer',
					sdp: s,
				});
				if (z.p) err('Peer setOfferAndAns peerConnection alreay exist!');
				z.p = await z.pNC();
				w(`Peer setOfferAndAns z.p${z.p} offer:`, o);
				await z.p.setRemoteDescription(o);
				io(`Peer setOfferAndAns setRemoteDescription(ans) ok in promise name:${z.n}`);
				const a = await z.mkA();
				w(`Peer setOfferAndAns ans ${a}`);
				if (z.cs.length < 1 || a) return a;
				await slp(Math.floor(rnd(1000)) + 1000);
			}
		} catch (e) {
			return ef(e, z.id, z.l);
		}
	}
	async sA(s) {
		const a = new RTCSessionDescription({
			type: 'answer',
			sdp: ov(s),
		}); // Answer設定するよ
		if (!this.p) throw 'Peer peerConnection NOT exist!';
		await this.p.setRemoteDescription(a);
		io('Peer setRemoteDescription(answer) ok in promise');
		return T;
	}
	isO() {
		const z = this,
			d = z.dc,
			r = d ? d.readyState : N;
		if (!d || r === 'closing' || r === 'closed') return F;
		if (r === 'connecting') return now() - this.lastSnd < 20000;
		else if (r === 'open') {
			this.lastSnd = now();
			return T;
		}
		return F;
	}
	s(m, t = 'arraybuffer') {
		const z = this,
			d = z.dc,
			r = d ? d.readyState : N;
		if (!d) return F;
		d.binaryType = t;
		io(`Conn SEND!; dc.binaryType : ${d.binaryType}`);
		if (r === 'connecting') z.q.push(m); //io(`Conn not open; queueing: ${m}`);
		else if (r === 'open') {
			z.sOQ(t);
			d.send(m, t);
			z.lastSnd = now();
		} else if (r === 'closing') z.q.push(m); //io(`Attempted to send message while closing: ${m}`);
		else if (r === 'closed') {
			w('Error! Attempt to send while connection closed.'); //io(`Attempted to send message while connection closed: ${m}`);
			z.q.push(m);
			z.c();
		}
		return r;
	}
	sOQ(bt) {
		const l = this.q.length;
		for (let i = 0; i < l; i++) this.dc.send(this.q.shift(), bt);
	}
	c() {
		const z = this; //クローズするよ
		if (z.p || z.dc) {
			if (z.p && z.p.iceConnectionState !== 'closed') {
				z.p.close();
				z.p = N;
			}
			if (z.dc && z.dc.readyState !== 'closed') {
				z.dc.close();
				z.dc = N;
			}
			io('Peer peerConnection is closed.');
		}
	}
	gCs() {
		return this.cs;
	}
	sCs(s) {
		if (this.isCo) return;
		for (const c of s) {
			io(`Peer setCandidates candidate${Js(c)}`, c);
			this.p.addIceCandidate(c).catch((e) => ef(e, this.id, this.l));
		}
		return 'setCandidates OK';
	}
}
const cy = crypto.subtle;
export class H {
	static async d(m, sc = 1, algo = 'SHA-256', isAB = F) {
		let r = m.buffer ? (m instanceof Uint8Array ? Y.dpU(m) : B.u8(m.buffer)) : te.encode(m);
		for (let i = 0; i < sc; i++) r = await cy.digest(algo, r);
		return isAB ? r : Y.a2U(r);
	}
}
class B {
	static u8 = (a) => new Uint8Array(a);
	static u32 = (a) => new Uint32Array(a);
	static i32 = (a) => new Int32Array(a);
}
class Y {
	static isSameAb = (abA, abB) => Y.a2B(abA) === Y.a2B(abB);
	static isB64 = (s = '') => s % 4 === 0 && /[+/=0-9a-zA-Z]+/.test(s);
	static s2u = (s) => te.encode(s);
	static u2s = (u) => td.decode(u);
	static a2B = (i) => window.btoa(Y.u2b(B.u8(i.buffer ? i.buffer : i)));
	static u2B = (u) => window.btoa(Y.u2b(u));
	static u2I(u) {
		const f = B.u8(4),
			l = u.length,
			n = Math.ceil(l / 4),
			i32a = B.i32(n);
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
		const f = B.u8(4),
			l = u.length,
			n = Math.ceil(l / 4),
			u32a = B.u32(n);
		for (let i = 0; i < n; i++) {
			f[0] = u[i + 0];
			f[1] = l < i + 1 ? 0 : u[i + 1];
			f[2] = l < i + 2 ? 0 : u[i + 2];
			f[3] = l < i + 3 ? 0 : u[i + 3];
			u32a[i] = B.u32(f.buffer)[0];
		}
		return u32a;
	}
	static a2U = (a) => Y.B2U(Y.a2B(a));
	static B2a = (B) => Y.b2u(window.atob(B));
	static U2a = (U) => Y.B2a(Y.U2B(U));
	static B2U = (B) => (B ? B.split('+').join('-').split('/').join('_').split('=').join('') : B);
	static U2B(U) {
		const l = U.length,
			c = l % 4 > 0 ? 4 - (l % 4) : 0;
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
		const l = bs.length,
			a = B.u8(new ArrayBuffer(l));
		for (let i = 0; i < l; i++) a[i] = bs.charCodeAt(i);
		return a;
	}
	static L2a(b) {
		return pr((r) => {
			const fr = new FileReader();
			fr.onload = () => r(fr.result);
			fr.onerror = () => cb(r(fr.error), err(fr.error));
			fr.readAsArrayBuffer(b);
		});
	}
	static dpU(u) {
		const l = u.length,
			n = B.u8(l);
		for (let i = 0; i < l; i++) n[i] = u[i];
		return n;
	}
	static N2u(n) {
		let a = n;
		const p = [];
		while (Math.abs(a) > 0) {
			p.unshift(a % 256);
			a = a >> 8;
		}
		const l = p.length;
		const u = B.u8(l);
		for (let i = 0; i < l; i++) u[i] = p[i];
		return u;
	}
}
//AES-GCM暗号化
class Cy {
	static async gK(p, s) {
		const k = await cy.deriveKey(
			{
				name: 'PBKDF2',
				salt: s,
				iterations: 100000,
				hash: 'SHA-256',
			},
			await cy.importKey('raw', await H.d(Y.s2u(p).buffer, 100, 'SHA-256', T), { name: 'PBKDF2' }, F, [
				'deriveKey',
			]),
			{ name: 'AES-GCM', length: 256 },
			F,
			['encrypt', 'decrypt']
		);
		return [k, s];
	}
	static gS = (saltI, isAB) => (saltI ? (isAB ? B.u8(saltI) : Y.s2u(saltI)) : crv(B.u8(16)));
	static importKeyAESGCM = async (kAb, usages = ['encrypt', 'decrypt']) =>
		await cy.importKey('raw', kAb, { name: 'AES-GCM' }, T, usages);
	static gFF = () => crv(B.u8(12));
	static gIF = () => crv(B.u32(1));
	static srand = () => crv(B.u32(1))[0] / 4294967295;
	static enc = async (s, pk) => await Cy.encAES256GCM(Y.s2u(s), pk);
	static async encAES256GCM(u, pk, saltI = N, isAB) {
		const s = Cy.gS(saltI, isAB);
		const iv = Uint8Array.from([...Cy.gFF(), ...B.u8(Cy.gIF().buffer)]);
		const edAb = await cy.encrypt({ name: 'AES-GCM', iv }, await Cy.lk(pk, s), u.buffer);
		return [Y.a2U(edAb), Y.a2U(iv.buffer), Y.a2U(s.buffer)].join(',');
	}
	static dec = async (ers, pk) => Y.u2s(await Cy.decAES256GCM(ers, pk));
	static lk = async (pk, s) => (isStr(pk) ? await Cy.gK(pk, isStr(s) ? B.u8(Y.U2a(s)) : s) : [pk])[0];
	static async decAES256GCM(ers, p) {
		const [U, ip, s] = ers.split(',');
		try {
			return B.u8(await cy.decrypt({ name: 'AES-GCM', iv: B.u8(Y.U2a(ip)) }, await Cy.lk(p, s), Y.U2a(U)));
		} catch (e) {
			return ef(e);
		}
	}
}

const b12 = 16 * 256;
const b30 = Math.pow(2, 30);
const b32 = Math.pow(2, 32);
const mc = { cnt: 0 };
const tc = navigator.hardwareConcurrency;
const bt = now();
class BC {
	static i = N;
	static q = {};
	static w = {};
	static f = {};
	static b(l = console, onR = (tdn, m) => io(`ESWebRTCConnU trgtDevNm:${tdn},msg:${m}`)) {
		BC.i = new M(l, onR);
		BC.i.onO = (e) => {
			BC.onO(e);
		};
		BC.i.onC = (e) => {
			BC.onC(e);
		};
	}
	i(u, g, p, dn) {
		BC.s.inf = { u, g, p, dn };
		BC.i.init(u, g, p, dn);
	}
	static oO(e) {
		//OnOpen From MainTab
		BC.p(Js({ t: 'OP', id: BC.s.id, s: now(), c: e }));
	}
	static oC(e) {
		//OnClose From MainTab
		BC.p(Js({ t: 'CL', id: BC.s.id, s: now(), c: e }));
	}
	sOOF(fn = dcb) {
		BC.f.onO = fn;
	}
	sOCF(fn = dcb) {
		BC.f.onC = fn;
	}
	sNego() {
		BC.p(Js({ t: 'sN', id: BC.s.id, s: now() }));
	}
	eNego() {
		BC.p(Js({ t: 'eN', id: BC.s.id, s: now() }));
	}
	closeAll() {
		BC.i.closeAll();
	}
	close(tsh) {
		BC.i.close(tsh);
	}
	async sendBigMessage(tsh, n, t, ab) {
		await BC.o(Js({ t: 'SM', id: BC.s.id, s: now(), c: { tsh, n, t, ab: Y.a2U(ab) } }));
	}
	broadcastBigMessage(m) {
		BC.i.bcBigMsg(m);
	}
	async sndMsg(tsh, m) {
		await BC.o(Js({ t: 'SM', id: BC.s.id, s: now(), c: { tsh, m } }));
	}
	broadcastMessage(m) {
		BC.i.bcMsg(m);
	}
	request(tsh, kp = '/', t = 'GET', m) {
		return BC.i.req(tsh, kp, t, m);
	}
	setOnRequest(c = async (kp, t, d) => cb(d, io(`keyPath:${kp}/type:${t}`, d))) {
		BC.i.setOnReq(c);
	}

	static s = { h: {}, w: F };
	static uuidv7() {
		const v7 = 7 * b12;
		mc.cnt++;
		const b = v7 + mc.cnt;
		const c = 2 * b30 + Math.floor(rnd(b30));
		const d = Math.floor(rnd(b32));
		return B.u2B(B.jus([B.N2u(now()), B.N2u(b), B.N2u(c), B.N2u(d)]));
	}
	static async mi(c = '') {
		return await H.d(`${BC.s.id}${c}${BC.uuidv7}`);
	}
	static async cTH() {
		return await H.d(`${location.origin}/${SALT}`);
	}
	static async startHartBeat() {
		BC.s.id = BC.uuidv7(); //selfid
		BC.s.s = 1;
		BC.s.cTH = await BC.cTH(); //channelhash
		BC.s.c = new BroadcastChannel(BC.HBs.cTH);
		while (BC.s.s) {
			BC.p(Js({ t: 'HB', id: BC.s.id, s: now() }));
			await slp(100);
			if (!BC.w && now() - bt > 1000) {
				BC.w = 1;
			}
			const fid = BC.s.id;
			if (BC.w) {
				const ids = Object.keys(BC.h); // hasConnect
				ids.sort();
				let c = 0;
				const n = now();
				for (const sid of ids) {
					if (c >= tc) {
						break; //all connected
					}
					c++;
					//find targets
					const s = BC.h[sid];
					if (sid > BC.s.id && n - s < 1000) {
						//h is A
						const w = BC.w[sid];
						if (!w) {
							const w = new Peer('Mesh', sS);
							BC.w[sid] = w;
							w.t = now();
							BC.p({ t: 'O', sid, fid, c: await w.mkO() });
						} else if (!w.isO() && n - w.t > 10000) {
							w.t = now();
							BC.p({ t: 'O', sid, fid, c: await w.mkO() });
						}
					}
				}
				//Connect WebRTC
			}
		}
	}
	static async oMM() {
		return async (m) => {
			try {
				const f = d.fid; //formId
				const d = Jp(m);
				const t = d.t;
				const c = d.c;
				if (t === 'HB') BC.s.h[d.id] = d.s;
				else if (d.sid === BC.s.id) {
					//forMe
					if (t === 'sN') {
						BC.i.startWaitAutoConn(); //StartNego To MainTab
					} else if (t === 'eN') {
						BC.i.stopWaitAutoConn(); //StopNego To MainTab
					} else if (t === 'CA') {
						BC.i.closeAll(); //closeAll To MainTab
					} else if (t === 'CL') {
						BC.i.close(); //close To MainTab
					} else if (t === 'SM' && c) {
						BC.i.sendMsg(c.tsh, c.m); //sendData To MainTab
						BC.p(Js({ t: 'RC', fid: d.sid, sid: f, c: { r: 'OK' }, r: d.r }));
					} else if (t === 'RC' && d.r && BC.q[d.r]) {
						const { v, j } = BC.q[d.r]; // recieve
						io(c && c.r === 'OK' ? v(c) : j(c));
						delete BC.q[d.r];
					} else if (t === 'BS' && c) {
						const r = await BC.i.sndBigMsg(c.tsh, c.n, tc.t, Y.U2a(c.ab)); //BigSendData To MainTab
						BC.p(Js({ t: 'RC', fid: d.sid, sid: f, c: { r: r ? 'OK' : '' }, r: d.r }));
					} else if (t === 'O') {
						const p = BC.w[f] ? BC.w[f] : new Peer(f, sS); //A Tab recieveOffer
						BC.w[f] = p;
						await BC.o('A', f, await p.sOA(c));
					} else if (t === 'A') {
						const p = BC.w[f]; //A Tab recieveAnswer
						const r = await p.sA(U.pSdp(c)).catch(getEF(now()));
						const c = await pr(async (r) => await BC.cnn(p, (c) => r(c)));
						if (r) await BC.o('C', f, c);
					} else if (t === 'C') {
						const p = BC.w[f];
						p.sCs(pv(c));
					}
				} else {
					if (t === 'RS') {
						//RceiveSendMsg
					} else if (t === 'OP') {
						BC.f.onO(c); //open From MainTab()
					} else if (t === 'CL') {
						BC.f.onC(c); //close From MainTab
					}
				}
			} catch (e) {
				ef(e);
			}
		};
	}
	static async cnn(p, f) {
		let c = 1;
		while (c < 100 && !p.isOpd) {
			await slp(Math.floor(rnd(20 * c)) + 100);
			c++;
			const cs = p.gCs();
			io(`WebRTCConn setOnCandidates count:${c}/candidates:${cs}`);
			if (isArr(cs) && cs.length > 0) {
				f(cs);
				break;
			}
		}
	}

	static m() {
		const l = Object.keys(BC.s.h);
		l.sort();
		return l.shift();
	}
	static o(t, s, c) {
		return pr((v, j) => {
			const r = BC.mi(Js([t, s, c])); //reqid
			BC.p(Js({ t, sid: s, fid: BC.s.id, c, r }));
			BC.q[r] = { v, j };
			st(() => {
				v(null);
			}, 30000);
		});
	}
	static async cP(t, c) {
		return await BC.o(t, BC.m(), c);
	}
	static async oM(f) {
		BC.s.c.onmessage = f;
	}
	static async p(m) {
		// Raw Post
		BC.s.c.postMessage(m);
	}
	static h() {}
	static c() {
		BC.s.s = F;
		BC.s.c.close();
	}
}
const PX = '_A_';
const cache = {};
//locastrage mamager
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
