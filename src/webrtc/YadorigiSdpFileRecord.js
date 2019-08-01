import { TimeUtil } from '../util/TimeUtil';
const expireSpan = 24 * 60 * 60 * 1000;

export class YadorigiSdpFileRecord {
	constructor(fileName, hash, expireDate) {
		if (fileName && hash && expireDate) {
			this.fileName = fileName;
			this.hash = hash;
			this.expireDate = expireDate;
		} else if (typeof fileName === 'string') {
			try {
				const obj = JSON.parse(fileName);
				this.fileName = obj.fileName;
				this.hash = obj.hash;
				this.expireDate = obj.expireDate;
			} catch (e) {
				console.error(e);
			}
		}
	}
	static getCurrentExpireDate() {
		const current = TimeUtil.getNowUnixTimeAtUTC();
		return current + expireSpan;
	}
	isExpired() {
		const current = TimeUtil.getNowUnixTimeAtUTC();
		if (this.expireDate && this.expireDate > current - expireSpan) {
			return true;
		}
		return false;
	}
	toObj() {
		const json = { fileName: this.fileName, hash: this.hash, expireDate: this.expireDate };
		return json;
	}
	toJsonString() {
		return JSON.stringify(this.toObj());
	}
}
