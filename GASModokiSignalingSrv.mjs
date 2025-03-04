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
		if (f.length === 2) {
			o[f[0]] = decodeURI(f[1]);
		}
	}
	d.splice(0, d.length);
	return o;
};
const getForm = (req) => {
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
};
class Cache {
	constructor() {
		this.a = {};
	}
	put(k, v, e) {
		this.a[k] = { value: v, expire: e };
		const list = [];
		for (const [key, value] of Object.entries(this.a)) {
			if (value.expire < Date.now()) delete this.a[key];
			else {
				const i = `${value.expire}-${key}`;
				list.push(i);
			}
		}
		if (list.length > maxSize) {
			list.sort();
			const l = list.length - maxSize;
			for (let i = 0; i < l; i++) {
				delete this.a[list[i].split('-')[1]];
			}
		}
		list.splice(0, list.length);
	}
	get(k) {
		const c = this.a[k];
		return c && c.expire > Date.now() ? c.value : null;
	}
	remove(k) {
		delete this.a[k];
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
}
const ContentService = {
	MimeType: { JSON: 'application/json' },
	createTextOutput: () => new TextOutput(),
};
/////////ここより上はGAS上では取り除く/////////////////////////////////////////////////
const cache = CacheService.getUserCache();
const EXPIRE_DURATION = 1000 * 2;
const WAIT_EXPIRE_DURATION = 1000 * 20;
const parse = (event) =>
	!event || !event.parameter
		? { cmd: null, group: null, data: null }
		: { group: event.parameter.group, cmd: event.parameter.cmd, data: event.parameter.data };
function sleep(sec = Math.floor(Math.random() * 800) + 200) {
	const expire = Date.now() + sec;
	const func = (ms) => ms > expire;
	return new Promise((resolve) => {
		while (!func(Date.now())) {
			console.log(`sleep: sec:${sec}/expire:${expire}/now:${Date.now()}`);
		}
		resolve();
	});
}
async function wait(key, value) {
	const ckey = `c%${key}`;
	const challeng = value + Date.now() + Math.floor(Math.random() * 1000000);
	let c = null;
	while (c !== challeng) {
		await sleep();
		cache.put(ckey, challeng);
		c = cache.get(ckey);
		cache.remove(ckey);
	}
}
async function add(key, value, now = Date.now()) {
	await wait(key, value);
	let c = cache.get(key);
	c = c ? JSON.parse(c) : { message: [], expire: now + 40000 };
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
function doWait(state, expire) {
	console.log(`doWait:expire;${expire}`);
	if (expire < Date.now()) state.isOver = true;
}
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
		let value = key ? cache.get(key) : null;
		value = value ? (typeof value === 'string' ? JSON.parse(value) : value) : null;
		if (key && value && (!value.expire || value.expire < Date.now())) {
			cache.remove(key);
		}
		out.setContent(JSON.stringify({ message: key ? (value ? value.message : value) : 'GET OK' }));
	} catch (e) {
		out.setContent(JSON.stringify({ message: 'ERROR', e: e.message, stack: e.stack }));
	}
	return out;
}
/////////ここより下はGAS上では取り除く/////////////////////////////////////////////////
const signaling = async (req, res) => {
	const method = req.method;
	console.log('signaling method:', method);
	if (method === 'POST' || method === 'GET') {
		const parameter = method === 'POST' ? getForm(req) : decodeFrom(req.url.split('?')[1]);
		const out = method === 'POST' ? doPost({ parameter }) : doGet({ parameter });
		res.writeHead(200, {
			'Content-Type': out.mimeType,
		});
		res.end(out.getContent());
	}
};

//
http.createServer(function (req, res) {
	const url = req.url.replace('../', '/');
	const urls = url.split('.');
	const ext = urls[urls.length - 1];
	console.log(`req url:${url}`);
	const contentType = exts[ext] ? exts[ext] : 'text/plain';
	try {
		console.log('A req:');
		if (isSignaling(req)) {
			console.log('B req:');
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
