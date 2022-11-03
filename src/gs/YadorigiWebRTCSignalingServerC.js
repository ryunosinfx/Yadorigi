const CacheService = { getUserCache: () => {} };
const ContentService = {
	createTextOutput: () => ({ setMimeType: () => {}, setContent: () => {} }),
};
/////////ここより上はGAS上では取り除く/////////////////////////////////////////////////
const cache = CacheService.getUserCache();
const EXPIRE_DURATION = 1000 * 2;
const WAIT_EXPIRE_DURATION = 1000 * 20;
const parse = (event) => (!event || !event.parameter ? { cmd: null, group: null, data: null } : { group: event.parameter.group, cmd: event.parameter.cmd, data: event.parameter.data });
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
	console.log(`add A1 c key:${key}`);
	console.log(c);
	c = c ? JSON.parse(c) : { message: [], expire: now + 40000 };
	const n = [];
	console.log('add A2 c');
	console.log(c);
	for (const v of c.message) {
		if (v.expire > now) {
			n.push(v);
		}
	}
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
	if (expire < Date.now()) {
		state.isOver = true;
	}
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
			while (!state.isOver) {
				doWait(state, expire);
			}
		} else {
			put(key, value);
		}
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
