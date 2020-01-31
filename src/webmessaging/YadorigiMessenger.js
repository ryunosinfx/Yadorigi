import { MessageChannel } from '../view/util/MessagingChannel';
import { Cryptor } from '../util/Cryptor';
import { Hasher } from '../util/Hasher';
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
	async post(msg) {
		const encrypted = await Cryptor.encodeStrAES256GCM(msg, this.passphrase);
		const hash = await Hasher.sha512(encrypted);
		this.ms.send();
		return;
	}
	getCallBack() {
		return data => {
			this.onMessage(data);
		};
	}
	async onMessage(data) {
		if (this.isValid(data)) {
			this.onMessageCallback(data);
			const result = await this.onMessageCallback();
			this.post(result);
		}
	}
	isValid(msg) {}
	validation() {}
}
