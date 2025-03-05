import fs from 'fs';
import http from 'http';
const exts = {
	js: 'text/javascript',
	css: 'text/css',
	html: 'text/html',
};
const PORT = 8087;
const maxSize = 10000;
const GASsign = '/macros/s';
const isSignaling = (req) => {
	const url = req.url.replace('../', '/');
	console.log('isSignaling url:', url);
	return url.indexOf(GASsign) === 0;
};
const decodeFrom = (querystring) => {
	const d = querystring.split('&');
	const o = {};
	for (const e of d) {
		const f = e.split('=');
		if (f.length === 2) o[f[0]] = decodeURIComponent(f[1]);
	}
	d.splice(0, d.length);
	return o;
};
const getForm = (req) =>
	new Promise((resolve) => {
		const a = [];
		//POSTデータを受けとる
		req.on('data', (chunk) => {
			a.push(chunk);
		}).on('end', () => {
			const d = a.join('');
			a.splice(0, a.length);
			resolve(decodeFrom(d));
		});
	});
class Cache {
	constructor() {
		this.a = new Map();
	}
	filter(k) {
		const y = '\\';
		return k.split(`${y}`).join('');
	}
	put(k, v, e) {
		const f = this.filter(k),
			n = Date.now(),
			expire = e ? e * 1000 + n : 900000 + n; //デフォルトは900秒
		this.a.set(f, { message: v, expire });
		const list = [];
		if (f.indexOf('c%[') < 0) console.log(`PPPP Cache put:${f}/${v}/${e}/${n}/${expire}/${typeof v}`, this.a);
		for (const [key, value] of this.a.entries()) {
			if (value.expire < Date.now()) this.a.delete(key);
			else {
				const i = `${value.expire}-${key}`;
				list.push(i);
			}
		}
		if (list.length > maxSize) {
			list.sort();
			const l = list.length - maxSize;
			for (let i = 0; i < l; i++) this.a.delete(list[i].split('-')[1]);
		}
		list.splice(0, list.length);
		// if (f.indexOf('c%[') < 0) console.log(`PPPP Cache put:${f}/${v}/${e}`, this.a);
	}
	get(k) {
		const f = this.filter(k),
			c = this.a.get(f);
		if (f.indexOf('c%[') < 0)
			console.log(`GGGG Cache get:${f}/${c}/${c && c.expire > Date.now()}/${Date.now()}`, c, this.a);
		return c && c.expire > Date.now() ? c.message : null;
	}
	remove(k) {
		this.a.delete(this.filter(k));
	}
}
const CacheService = { getUserCache: () => new Cache() };
class TextOutput {
	constructor() {
		this.a = [];
	}
	setMimeType(t) {
		this.mimeType = t;
	}
	setContent(c) {
		this.a.push(c);
	}
	getContent() {
		return this.a.join('');
	}
	clear() {
		this.a.splice(0, this.a.length);
	}
}
const ContentService = {
	MimeType: { JSON: 'application/json' },
	createTextOutput: () => new TextOutput(),
};
/////////ここより上はGAS上では取り除く/////////////////////////////////////////////////
const cache = CacheService.getUserCache();
const EXPIRE_DURATION = 1000 * 40;
const WAIT_EXPIRE_DURATION = 1000 * 20;
const parse = (event) =>
	!event || !event.parameter
		? { cmd: null, group: null, data: null }
		: { group: event.parameter.group, cmd: event.parameter.cmd, data: event.parameter.data };
let sleep = function (sec = Math.floor(Math.random() * 800) + 200) {
	const expire = Date.now() + sec;
	const func = (ms) => ms > expire;
	return new Promise((resolve) => {
		while (!func(Date.now())) console.log(`sleep: sec:${sec}/expire:${expire}/now:${Date.now()}`);
		resolve();
	});
};
//違う値が来るまで待つ
async function wait(key, value) {
	const ckey = `c%${key}`;
	const challeng = value + Date.now() + Math.floor(Math.random() * 1000000);
	let c = null;
	while (c !== challeng) {
		await sleep();
		cache.put(ckey, challeng, 900);
		c = cache.get(ckey);
		cache.remove(ckey);
	}
}
async function add(key, value, now = Date.now()) {
	let c = cache.get(key);
	if (c) await wait(key, value);
	try {
		c = c ? JSON.parse(c) : { message: [], expire: now + 40000 };
	} catch (e) {
		console.error(`add:error:${e}`);
	}
	const n = [];
	for (const v of c.message) if (v.expire > now) n.push(v);
	n.push({ value, expire: now + WAIT_EXPIRE_DURATION });
	cache.remove(key);
	cache.put(key, JSON.stringify({ message: n, expire: now + 40000 }), 900);
}
function put(key, value, now = Date.now()) {
	cache.remove(key);
	cache.put(key, JSON.stringify({ message: value, expire: now + EXPIRE_DURATION }));
}
let doWait = function (state, expire) {
	console.log(`doWait:expire;${expire}`);
	if (expire < Date.now()) state.isOver = true;
};
// eslint-disable-next-line no-unused-vars
function doPostTest() {
	doPost({ parameter: { group: 1122333, cmd: 'wait', data: 'wait!' } });
}
// eslint-disable-next-line no-unused-vars
function doPost(event) {
	const out = ContentService.createTextOutput();
	out.setMimeType(ContentService.MimeType.JSON);
	try {
		const { group, cmd, data } = parse(event);
		const key = JSON.stringify([group, cmd]);
		const value = typeof data !== 'string' ? JSON.stringify(data) : data;
		if (cmd === 'wait') {
			const state = { isOver: false };
			add(key, value).then(() => {
				state.isOver = true;
			});
			const expire = Date.now() + 1000;
			while (!state.isOver) doWait(state, expire);
		} else put(key, value);
		console.log('END:doPost');
		out.setContent(JSON.stringify({ message: 'POST OK' }));
	} catch (e) {
		out.setContent(JSON.stringify({ message: 'ERROR', e: e.message, stack: e.stack }));
	}
	return out;
}
// eslint-disable-next-line no-unused-vars
function doGet(event) {
	const out = ContentService.createTextOutput(); //Mime TypeをJSONに設定
	out.setMimeType(ContentService.MimeType.JSON); //JSONテキストをセットする
	try {
		const { group, cmd } = parse(event);
		const key = cmd && group ? JSON.stringify([group, cmd]) : null;
		let v = key ? cache.get(key) : null;
		// console.log(`doGet A:key:${key}/v:${v}`);
		v = v ? (typeof v === 'string' ? JSON.parse(v) : v) : null;
		if (key && v && (!v.expire || v.expire < Date.now())) {
			cache.remove(key);
		}
		console.log(`doGet B:key:${key}/v:${v}`);
		out.setContent(JSON.stringify({ message: key ? (v ? v.message : v) : 'GET OK' }));
	} catch (e) {
		out.setContent(JSON.stringify({ message: 'ERROR', e: e.message, stack: e.stack }));
	}
	return out;
}
/////////ここより下はGAS上では取り除く/////////////////////////////////////////////////
//GAS上で欠落している機能を組み込んだ処理を追記
sleep = function (sec = Math.floor(Math.random() * 800) + 200) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, sec);
	});
};
doWait = function (state, expire) {
	if (expire < Date.now()) state.isOver = true;
};
const signaling = async (req, res) => {
	const method = req.method;
	if (method === 'POST' || method === 'GET') {
		const parameter = method === 'POST' ? await getForm(req) : decodeFrom(req.url.split('?')[1]);
		const out = method === 'POST' ? doPost({ parameter }) : doGet({ parameter });
		res.writeHead(200, {
			'Content-Type': out.mimeType,
		});
		const t = out.getContent();
		out.clear();
		res.end(t);
		console.log('!!!!!!!!!!!!!!signaling method:', method, t, parameter);
	}
};
//
http.createServer(function (req, res) {
	const url = req.url.replace('../', '/');
	const urls = url.split('.');
	const ext = urls[urls.length - 1];
	// console.log(`req url:${url}`);
	const contentType = exts[ext] ? exts[ext] : 'text/plain';
	try {
		if (isSignaling(req)) {
			return signaling(req, res);
		}
		res.writeHead(200, {
			'Content-Type': contentType,
		});
		const file = fs.readFileSync(`.${url}`);
		const responseMessage = file;
		res.end(responseMessage);
	} catch (e) {
		res.writeHead(404, {
			'Content-Type': contentType,
		});
		console.log(`req e:${e}`);
		res.end('NOT FOUND');
	}
}).listen(PORT, '127.0.0.1');
