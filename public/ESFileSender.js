import { ESWebRTCConnecterU, H } from './ESWebRTCConnecterU.js';
import { FileUtil } from './ESFileUtil.js';
const onRecieveFileCB = (name, type, dataAb) => {
	console.log(name, type, dataAb);
};
const cb = () => {};
export class ESFileSender {
	constructor(logElm, fileElm, settingElms, onSWAC, onHWAC) {
		this.logElm = logElm;
		this.fileElm = fileElm;
		this.cacheUL = new Map();
		this.cacheDL = new Map();
		this.u = new ESWebRTCConnecterU(
			'EAFileSender',
			this,
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
	stop() {
		this.u.stopWaitAutoConnect();
	}
	close() {
		this.u.closeAll();
	}
	getOnMessage() {
		return (targetDeviceName, msg) => {
			console.log(`☆ESFileSender setOnMessage A targetDeviceName:${targetDeviceName}/msg:`, msg);
			if (Array.isArray(msg)) {
				console.log(`☆ESFileSender setOnMessage B targetDeviceName:${targetDeviceName}/msg:`, msg);
				for (const file of msg) {
					if (!file || !file.name || !file.type || !file.data) {
						console.log(`☆ESFileSender setOnMessage C targetDeviceName:${targetDeviceName}/file:`, file);
						return;
					}
					console.log(`☆ESFileSender setOnMessage D targetDeviceName:${targetDeviceName}/file:`, file);
					const key = JSON.stringify([file.name, file.type]);
					this.cacheDL.set(key, { ab: file.data, time: Date.now() });
					this.onRecieveFile(file.name, file.type, file.data);
				}
				return;
			}
			this.log(`☆ESFileSender setOnMessage E targetDeviceName:${targetDeviceName} msg:${msg}`);
		};
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
		const { ab } = this.cacheUL.get(fileKey);
		if (!ab) {
			return;
		}
		return await this.u.tranTest(console, name, type, ab);
	}
	async broadcastMessage(msg) {
		await this.u.broadcastMessage(msg);
	}
	async send(group, targetDeviceName, name, type) {
		const fileKey = JSON.stringify([name, type]);
		const { ab } = this.cacheUL.get(fileKey);
		if (!ab) {
			this.log(`send NOT FOUND! name:${name}/type:${type}`, ab);
			return;
		}
		const connectKey = JSON.stringify([group, targetDeviceName]);
		const targetSignalingHash = this.connectedList[connectKey];
		return await this.u.sendBigMessage(targetSignalingHash, name, type, ab);
	}
	dl(name, type) {
		const key = JSON.stringify([name, type]);
		const { ab } = this.cacheDL.has(key)
			? this.cacheDL.get(key)
			: this.cacheUL.has(key)
			? this.cacheUL.get(key)
			: { ab: null };
		if (!ab) {
			this.log(`NOT FOUND! name:${name}/type:${type}`);
		}
		FileUtil.download(name, ab, type);
	}
	getAssetList() {
		const uploadeds = [];
		const downlodables = [];
		for (const [fileKey, value] of this.cacheDL) {
			if (!value) {
				return this.cacheDL.delete(fileKey);
			}
			console.log('downlodables fileKey', fileKey);
			const key = JSON.parse(fileKey);
			downlodables.push({ name: key[0], type: key[1], size: value.ab.byteLength, time: value.time });
		}
		for (const [fileKey, value] of this.cacheUL) {
			if (!value) {
				return this.cacheUL.delete(fileKey);
			}
			console.log('uploadeds fileKey', fileKey);
			const key = JSON.parse(fileKey);
			uploadeds.push({ name: key[0], type: key[1], size: value.ab.byteLength, time: value.time });
		}
		return { uploadeds, downlodables };
	}
	delete(name, type) {
		const key = JSON.stringify([name, type]);
		return this.cacheDL.has(key)
			? this.cacheDL.delete(key)
			: this.cacheUL.has(key)
			? this.cacheUL.delete(key)
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
			const f = FileUtil.getOnFileLoad(this.fileElm, (name, type, ab) => {
				if (!ab) {
					resolve(false);
					return;
				}
				this.cacheUL.set(JSON.stringify([name, type]), { ab, time: Date.now() });
				resolve(true);
			});
			f();
		});
	}
	async getHash(msg) {
		return await H.d(typeof msg === 'string' ? msg : JSON.stringify(msg));
	}
}
