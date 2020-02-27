import { YadrogiLoginManager } from './YadrogiLoginManager';
export class YadorigiSingleMessenger {
	constructor() {
		this.key = null;
	}
	init(userId, passphrase) {
		this.key = YadrogiLoginManager.isLogedIn(userId, passphrase);
	}
	login() {}
}
