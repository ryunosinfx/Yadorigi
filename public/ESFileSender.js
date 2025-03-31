import { ESWebRTCConnecterU, H } from './ESWebRTCConnecterU.js';
import { FileUtil } from './ESFileUtil.js';
const onRecieveFileCB = (name, type, dataSize) => {
	console.log(name, type, dataSize);
};
const cb = () => {};
export class ESFileSender {
	constructor(logElm, fileElm, settingElms, onSWAC, onHWAC, onInit) {
		this.logElm = logElm;
		this.fileElm = fileElm;
		this.cacheUL = new Map();
		this.cacheDL = new Map();
		this.u = new ESWebRTCConnecterU(
			'EAFileSender',
			this,
			async () => {
				this.onLs(await this.u.ls());
				onInit(await this.getAssetList());
			},
			this.getOnMessage(),
			this.getOnSettingInfo(settingElms),
			onSWAC,
			onHWAC
		);
		this.connectedList = {};
		this.u.setOnOpenFunc((event, group, targetSignalingHash, targetDeviceName) => {
			console.log(`☆☆setOnOpenFunc☆☆ targetDeviceName:${targetDeviceName}`);
			const key = JSON.stringify([group, targetDeviceName]);
			this.connectedList[key] = targetSignalingHash;
			this.onStatusChange(this.connectedList);
		});
		this.u.setOnCloseFunc((event, group, targetSignalingHash, targetDeviceName) => {
			console.log(`☆☆setOnCloseFunc☆☆ targetDeviceName:${targetDeviceName}`);
			const key = JSON.stringify([group, targetDeviceName]);
			this.connectedList[key] = null;
			this.onStatusChange(this.connectedList);
		});
		this.onRecieveFile = onRecieveFileCB;
		this.onStatusChange = cb;
	}
	async ls() {
		const a = await this.u.ls();
		console.log('ls a;', a);
		return a;
	}
	stop() {
		this.u.stopWaitAutoConnect();
	}
	close() {
		this.u.closeAll();
	}
	getOnMessage() {
		return (appName, targetDeviceName, msg, isBigData) => {
			console.log(`☆ESFileSender setOnMessage A ${appName}/targetDeviceName:${targetDeviceName}/msg:`, msg);
			if (isBigData) {
				if (Array.isArray(msg)) {
					console.log(`☆ESFileSender setOnMessage B targetDeviceName:${targetDeviceName}/msg:`, msg);
					for (const file of msg) this.doParFile(targetDeviceName, file);
				} else this.doParFile(targetDeviceName, msg);
				return;
			}
			this.log(`☆ESFileSender setOnMessage E targetDeviceName:${targetDeviceName} msg:${msg}`);
		};
	}
	doParFile(targetDeviceName, file) {
		if (!file || !file.name || !file.type || !file.hash)
			return console.log(`☆ESFileSender setOnMessage C targetDeviceName:${targetDeviceName}/file:`, file);
		console.log(`☆ESFileSender setOnMessage D targetDeviceName:${targetDeviceName}/file:`, file);
		const key = JSON.stringify([file.name, file.type]);
		this.cacheDL.set(key, { hash: file.h, size: file.s, time: Date.now() });
		this.onRecieveFile(file.name, file.type, file.size);
	}
	getOnSettingInfo(settingElms) {
		return (AppName, setting) => {
			if (!setting) return;
			//  { g: inputCgroup, p: inputCpasswd, d: inputCdevice })
			settingElms.u.value = setting.u;
			settingElms.g.value = setting.g;
			settingElms.p.value = setting.p;
			settingElms.d.value = setting.dn; //url,group,password,deviceName
		};
	}
	startConnect(url, group, deviceName, passwd) {
		this.u.init(url, group, passwd, deviceName);
		this.u.startWaitAutoConnect();
	}
	log(text, v1 = '', v2 = '') {
		if (this.logElm) {
			const v1_ = typeof v1 !== 'string' ? JSON.stringify(v1) : '';
			const v2_ = typeof v2 !== 'string' ? JSON.stringify(v2) : '';
			const m = 100;
			const lf = '\n';
			const t = this.logElm.textContent;
			const r = t ? t.split(lf) : [];
			const n = r.length > m ? r.slice(r.length - m, r.length) : r;
			this.logElm.textContent = `${n.join(lf)}${lf}${Date.now()} ${
				typeof text !== 'string' ? JSON.stringify(text) : text
			} ${v1} ${v1_}  # ${v2} ${v2_}`;
		}
		console.log(`${Date.now()} ${text}`, v1);
	}
	async test(name, type) {
		const fileKey = JSON.stringify([name, type]);
		const { hash } = this.cacheUL.get(fileKey);
		return hash ? await this.u.tranTest(console, name, type, hash) : null;
	}
	async broadcastMessage(msg) {
		await this.u.broadcastMsg(msg);
	}
	async send(group, targetDeviceName, name, type) {
		const fileKey = JSON.stringify([name, type]);
		const { hash } = this.cacheUL.get(fileKey);
		if (!hash) return this.log(`send NOT FOUND! name:${name}/type:${type}`, hash);
		const connectKey = JSON.stringify([group, targetDeviceName]);
		const targetSignalingHash = this.connectedList[connectKey];
		return await this.u.sendBigMsg(targetSignalingHash, name, type, hash);
	}
	async dl(name, type) {
		const key = JSON.stringify([name, type]);
		const { hash, size } = this.cacheDL.has(key)
			? this.cacheDL.get(key)
			: this.cacheUL.has(key)
			? this.cacheUL.get(key)
			: { hash: null, size: 0 };
		if (!hash) this.log(`NOT FOUND! name:${name}/type:${type}/size:${size}`);
		const ab = await this.u.load(name, hash);
		FileUtil.download(name, ab, type);
	}
	async getAssetList() {
		const uploadeds = [];
		const downlodables = [];
		for (const [fileKey, value] of this.cacheDL) {
			if (!value) return this.cacheDL.delete(fileKey);
			console.log('getAssetList downlodables fileKey', fileKey);
			const key = JSON.parse(fileKey);
			downlodables.push({ name: key[0], type: key[1], size: value.size, time: value.time });
		}
		for (const [fileKey, value] of this.cacheUL) {
			if (!value) return this.cacheUL.delete(fileKey);
			console.log('getAssetList uploadeds fileKey', fileKey);
			const key = JSON.parse(fileKey);
			uploadeds.push({ name: key[0], type: key[1], size: value.size, time: value.time });
		}
		return { uploadeds, downlodables };
	}
	async delete(name, type) {
		const key = JSON.stringify([name, type]);
		console.log('delete key', key);
		return this.cacheDL.has(key)
			? (await this.u.delete(name, this.cacheDL.get(key).hash)) & this.cacheDL.delete(key)
			: this.cacheUL.has(key)
			? (await this.u.delete(name, this.cacheUL.get(key).hash)) & this.cacheUL.delete(key)
			: null;
	}
	setOnRecieve(callback = onRecieveFileCB) {
		this.onRecieveFile = callback;
	}
	setOnStatusChange(callback = cb) {
		this.onStatusChange = callback;
	}
	ul() {
		return new Promise((resolve) => {
			console.log('ul2', this.fileElm);
			const f = FileUtil.getOnFileLoad(this.fileElm, async (name, type, ab) => {
				if (!ab) return resolve(false);
				console.log(`ul! name:${name}/type:${type}/size:${ab.byteLength}`);
				const hash = await this.u.upload(name, type, ab),
					size = ab.byteLength;
				console.log(`ul 2! name:${name}/type:${type}/size:${size}`);
				this.cacheUL.set(JSON.stringify([name, type]), { hash, size, time: Date.now() });
				resolve(true);
			});
			f();
		});
	}
	onLs(lsResult) {
		for (const a of lsResult) {
			const name = a.k,
				type = a.t,
				hash = a.h,
				size = a.s,
				time = a.lm;
			this.cacheUL.set(JSON.stringify([name, type]), { hash, size, time });
		}
	}
	async getHash(msg) {
		return await H.d(typeof msg === 'string' ? msg : JSON.stringify(msg));
	}
}
