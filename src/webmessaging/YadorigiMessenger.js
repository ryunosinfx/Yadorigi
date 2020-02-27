import { MessageChannel } from '../view/util/MessagingChannel';
import { Cryptor } from '../util/Cryptor';
import { Hasher } from '../util/Hasher';
import { YadrogiLoginManager } from './YadrogiLoginManager';
const TIMEOUT_MAX = 60 * 1000;
const taskMap = {};
export class YadorigiMessenger {
	constructor(url = 'dummy', group, userId, passphrase, onMessageCallback = async () => {}) {
		this.url = url;
		this.group = group;
		this.userId = userId;
		this.passphrase = passphrase;
		this.onMessageCallback = onMessageCallback;
		this.ms = new MessageChannel(this.getCallback(), url);
	}
	static getInstance(url, group, userId, passphrase, onMessageCallback) {
		return new YadorigiMessenger(url, group, userId, passphrase, onMessageCallback);
	}
	async init() {
		this.key = null;
		const loginKey = JSON.stringify([this.group, this.userId]);
		const keyData = await YadrogiLoginManager.login(loginKey, this.passphrase);
		this.key = await Cryptor.importKeyAESGCM(keyData);
	}
	async post(msg) {
		const current = Date.now();
		const encrypted = await Cryptor.encodeStrAES256GCM(msg, this.key);
		const hash = await Hasher.sha512(encrypted + '/' + current);
		this.ms.send({ encrypted, hash, current });
		return this.addQueue(hash);
	}
	addQueue(hash) {
		return new Promise(resolve => {
			const task = data => {
				resolve(data);
				delete taskMap[hash];
			};
			taskMap[hash] = task;
			setTimeout(() => {
				resolve('timeout');
				delete taskMap[hash];
			}, TIMEOUT_MAX);
		});
	}
	getCallBack() {
		return data => {
			this.onMessage(data);
		};
	}
	async onMessage(data) {
		const decoded = this.decode(data);
		if (decoded) {
			const result = await this.onMessageCallback(decoded);
			this.post(result);
		}
	}
	async decode(msg) {
		const current = Date.noe();
		try {
			let data = typeof msg === 'string' ? JSON.parse(msg) : msg;
			if (!data || !data.encrypted || !data.hash || isNaN((data.current + '') * 1) || data.current - current > 1000) {
				return false;
			}
			const hash = await Hasher.sha512(encrypted + '/' + current);
			if (hash !== data.hash) {
				return false;
			}

			const decoded = await Cryptor.decodeAES256GCMasStr(data.encrypted, this.key);
			return decoded;
		} catch (e) {
			console.warn(e);
			return false;
		}
	}
	validation() {}
}
