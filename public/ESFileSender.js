import { ESWebRTCConnecterU } from './ESWebRTCConnecterU.js';
const onRecieveFileCB = (name, type, dataAb) => {
	console.log(name, type, dataAb);
};
const cb = () => {};
export class ESFileSender {
	constructor(logElm, fileElm) {
		this.logElm = logElm;
		this.fileElm = fileElm;
		this.cacheUL = new Map();
		this.cacheDL = new Map();
		this.u = new ESWebRTCConnecterU(this, this.getOnMessage());
		this.connectedList = {};
		this.u.setOnOpenFunc((event, group, targetSignalingHash, targetDeviceName) => {
			console.log(`☆☆setOnOpenFunc☆☆ targetDeviceName:${targetDeviceName}`);
			const key = JSON.stringify([group, targetDeviceName]);
			this.connectedList[key] = targetSignalingHash;
			this.onStatusChange();
		});
		this.u.setOnCloseFunc((event, group, targetSignalingHash, targetDeviceName) => {
			console.log(`☆☆setOnCloseFunc☆☆ targetDeviceName:${targetDeviceName}`);
			const key = JSON.stringify([group, targetDeviceName]);
			this.connectedList[key] = null;
			this.onStatusChange();
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
			if (Array.isArray(msg)) {
				for (const file of msg) {
					if (!file || !file.name || !file.type || !file.data) {
						return;
					}
					const key = JSON.stringify([file.name, file.type]);
					this.cacheDL.set(key, { ab: file.data, time: Date.now() });
					this.onRecieveFile(file.name, file.type, file.data);
				}
			}
			this.log(`setOnMessage file.typetargetDeviceName:${targetDeviceName} msg:${msg}`);
		};
	}
	startConnect(url, group, deviceName, passwd) {
		this.u.init(url, group, passwd, deviceName);
		this.u.startWaitAutoConnect();
	}
	log(text, value) {
		if (this.logElm) {
			this.logElm.textContent = `${this.logElm.textContent}\n${Date.now()} ${typeof text !== 'string' ? JSON.stringify(text) : text} ${value}`;
		}
		console.log(`${Date.now()} ${text}`, value);
	}
	async send(group, targetDeviceName, name, type) {
		const fileKey = JSON.stringify([name, type]);
		const { ab } = this.cacheUL.get(fileKey);
		if (!ab) {
			return;
		}
		const connectKey = JSON.stringify([group, targetDeviceName]);
		const targetSignalingHash = this.connectedList[connectKey];
		return await this.u.sendBigMessage(targetSignalingHash, name, type, ab);
	}
	dl(name, type) {
		const key = JSON.stringify([name, type]);
		const { ab } = this.cacheDL.has(key) ? this.cacheDL.get(key) : this.cacheUL.has(key) ? this.cacheUL.get(key) : { ab: null };
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
		return this.cacheDL.has(key) ? this.cacheDL.delete(key) : this.cacheUL.has(key) ? this.cacheUL.delete(key) : null;
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
}
class FileUtil {
	static getOnFileLoad(elm, cb) {
		return () => {
			const [file] = elm.files;
			if (file) {
				const name = file.name;
				const type = file.type;
				const reader = new FileReader();
				reader.addEventListener('load', () => {
					cb(name, type, reader.result);
				});
				reader.addEventListener('error', (event) => {
					console.error(`Error occurred reading file: ${name}`, event);
					cb(name, type, null);
				});
				reader.readAsArrayBuffer(file);
			} else {
				cb(null, null, null);
			}
		};
	}

	static download(fileName, content, mimeType = 'text/plain') {
		const blob = new Blob([content], { type: mimeType });
		const ancker = document.createElement('a');
		ancker.style.display = 'none';
		ancker.download = fileName;
		ancker.href = window.URL.createObjectURL(blob);
		ancker.dataset.downloadurl = [mimeType, fileName, ancker.href].join(':');
		document.body.appendChild(ancker);
		ancker.click();
		setTimeout(() => {
			document.body.removeChild(ancker);
		});
	}
}
