import { TimeUtil } from './TimeUtil.js';
export class ProcessUtil {
	static wait(waitMs = 1000) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, waitMs);
		});
	}
	static async waitRandom() {
		const ms = TimeUtil.random();
		console.log(`waitRandom ms:${ms}`);
		await ProcessUtil.wait(ms + 1000);
	}
}
