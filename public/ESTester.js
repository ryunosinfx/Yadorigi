import { ESWebRTCConnecterU, Hasher } from './ESWebRTCConnecterU.js';
export class ESTester {
	constructor(logElm, urlInputElm, groupInputElm, passwordInputElm, deviceNameInputElm, statusConnElm) {
		this.logElm = logElm;
		this.urlInputElm = urlInputElm;
		this.groupInputElm = groupInputElm;
		this.passwordInputElm = passwordInputElm;
		this.deviceNameInputElm = deviceNameInputElm;
		this.statusConnElm = statusConnElm;
		this.u = new ESWebRTCConnecterU(this, this.getOnMessage());
		this.cb = this.getOnUpdate();
		if (!groupInputElm.value) {
			groupInputElm.value = Date.now();
		}
		if (!passwordInputElm.value) {
			passwordInputElm.value = '1234';
		}
		if (!deviceNameInputElm.value) {
			Hasher.digest([location.origin, navigator.userAgent, Date.now()]).then((hash) => {
				deviceNameInputElm.value = hash;
			});
		}
		urlInputElm.addEventListener('input', this.cb);
		groupInputElm.addEventListener('input', this.cb);
		passwordInputElm.addEventListener('input', this.cb);
		deviceNameInputElm.addEventListener('input', this.cb);
		this.cb();
		this.connectedList = {};
		this.u.setOnOpenFunc((event, group, target) => {
			console.log('☆☆setOnOpenFunc☆☆');
			const key = JSON.stringify([group, target]);
			this.connectedList[key] = 1;
			this.onStatusChange();
		});
		this.u.setOnCloseFunc((event, group, target) => {
			console.log('☆☆setOnCloseFunc☆☆');
			const key = JSON.stringify([group, target]);
			this.connectedList[key] = 0;
			this.onStatusChange();
		});
	}
	onStatusChange() {
		const statuss = [];
		for (const key in this.connectedList) {
			const l = JSON.parse(key);
			statuss.push(`<${l[0]} / ${l[1]}:${this.connectedList[key] ? 'OPEN' : 'CLOSE'}>`);
		}
		this.statusConnElm.textContent = statuss.join(',');
	}
	log(text, value) {
		this.logElm.textContent = `${this.logElm.textContent}\n${Date.now()} ${typeof text !== 'string' ? JSON.stringify(text) : text} ${value}`;
		console.log(`${Date.now()} ${text}`, value);
	}
	async openNewWindow() {
		this.window = window.open(new URL(location.href).href, 'newOne');
		await this.sleep(1000);
	}
	start() {
		this.u.startWaitAutoConnect();
	}
	stop() {
		this.u.stopWaitAutoConnect();
	}
	close() {
		this.u.closeAll();
	}
	clear() {
		this.logElm.textContent = '';
	}
	getOnUpdate() {
		return () => {
			const url = this.urlInputElm.value;
			const group = this.groupInputElm.value;
			const passwd = this.passwordInputElm.value;
			const deviceName = this.deviceNameInputElm.value;
			this.u.init(url, group, passwd, deviceName);
		};
	}
	getOnMessage() {
		return (hash, msg) => {
			this.log(`setOnMessage hash:${hash} msg:${msg}`);
		};
	}
	sendMessage(hash, msg) {
		// this.log(`sendMessage hash:${hash} /msg:${msg}`);
		this.u.sendMessage(hash, msg);
	}
	broadcastMessage(msg) {
		// this.log(`broadcastMessage msg:${msg}`);
		this.u.broadcastMessage(msg);
	}
}
