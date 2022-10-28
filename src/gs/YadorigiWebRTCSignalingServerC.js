const CacheService = { getUserCache: () => {} };
const ContentService = {
	createTextOutput: () => ({ setMimeType: () => {}, setContent: () => {} }),
};
const cache = CacheService.getUserCache();
const EXPIRE_DURATION = 1000 * 2;
const WAIT_EXPIRE_DURATION = 1000 * 20;

const parse = (event) => (!event || !event.parameter ? { cmd: null, group: null, data: null } : { group: event.parameter.group, cmd: event.parameter.cmd, data: event.parameter.data });
function sleep(sec = Math.floor(Math.random() * 800) + 200) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, sec);
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
	c = c ? JSON.parse(c) : [];
	const n = [];
	for (const v of c.a) {
		if (v.expire > now) {
			n.push(v);
		}
	}
	n.push({ value, expire: now + WAIT_EXPIRE_DURATION });
	cache.remove(key);
	cache.put(key, JSON.stringify({ message: n, expire: now + 40000 }), 900);
}
async function put(key, value, now = Date.now()) {
	const v = { value, expire: now + EXPIRE_DURATION };
	cache.remove(key);
	cache.put(key, JSON.stringify(v));
}
function doWait(now) {
	console.log(`doWait:now;${now}`);
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
			while (!state.isOver) {
				doWait(Date.now());
			}
		} else {
			put(key, value);
		}
		out.setContent(JSON.stringify({ message: 'OK' }));
	} catch (e) {
		out.setContent(JSON.stringify({ message: 'ERROR', e: e.message, stack: e.stack }));
	}
	return out;
}
// eslint-disable-next-line no-unused-vars
function doGet(event) {
	const out = ContentService.createTextOutput();
	//Mime TypeをJSONに設定
	out.setMimeType(ContentService.MimeType.JSON);
	//JSONテキストをセットする
	try {
		const { group, cmd } = parse(event);
		const key = JSON.stringify([group, cmd]);
		// out.setContent(JSON.stringify({ message: "OK"+key }));
		if (cmd && group) {
			let value = cache.get(key);
			value = value && typeof value === 'string' ? JSON.parse(value) : null;
			if (value && (!value.expire || value.expire < Date.now())) {
				cache.remove(key);
			}
			out.setContent(JSON.stringify({ message: value ? value.message : 'null' }));
		} else {
			out.setContent(JSON.stringify({ message: 'OK' }));
		}
	} catch (e) {
		out.setContent(JSON.stringify({ message: 'ERROR', e: e.message, stack: e.stack }));
	}
	return out;
}
