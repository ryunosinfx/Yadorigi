import { TimeUtil } from '../util/TimeUtil';
import { Hasher } from '../util/Hasher';
import { Base64Util } from '../util/Base64Util';
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
				console.warn(fileName);
				console.error(e);
			}
		} else if (typeof fileName === 'object') {
			this.fileName = fileName.fileName;
			this.hash = fileName.hash;
			this.expireDate = fileName.expireDate;
		}
	}
	/////////////////////////////////////////////////////////////////////////////////////////////
	static getCurrentExpireDate() {
		const current = TimeUtil.getNowUnixTimeAtUTC();
		return current + expireSpan;
	}
	static async createFileNameOffer(groupName, userId, senderDeviceName) {
		return await YadorigiSdpFileRecord.createFileName(groupName, userId, senderDeviceName, true);
	}
	static async createFileNameAnswer(groupName, userId, senderDeviceName) {
		return await YadorigiSdpFileRecord.createFileName(groupName, userId, senderDeviceName, false);
	}
	static async createFileName(groupName, userId, senderDeviceName, isOffer = true, expireTime) {
		//ユーザーIDのハッシュとデバイス名ハッシュをキー
		//512 25612864
		const userIdHash = await Hasher.sha512(userId); //64
		const groupNameHash = await Hasher.sha512(groupName); //64
		const senderDeviceNameHash = await Hasher.sha512(senderDeviceName); //64
		const fileName = groupNameHash + '.' + userIdHash + '.' + senderDeviceNameHash + '.' + expireTime + '.' + (isOffer ? 'offer' : 'ans');
		return fileName;
	}
	static createOfferFileNameRegex(groupNameHash, userIdHash, senderDeviceNameHash) {
		return YadorigiSdpFileRecord.createFileNameRegex(groupNameHash, userIdHash, senderDeviceNameHash, true);
	}
	static createAnswerFileNameRegex(groupNameHash, userIdHash, senderDeviceNameHash) {
		return YadorigiSdpFileRecord.createFileNameRegex(groupNameHash, userIdHash, senderDeviceNameHash, false);
	}
	static createFileNameRegex(groupNameHash, userIdHash, senderDeviceNameHash, isOffer = true) {
		//ユーザーIDのハッシュとデバイス名ハッシュをキー
		//512 25612864
		const fileNameRegex = groupNameHash + '.' + userIdHash + '.' + senderDeviceNameHash + '.[0-9]+.' + (isOffer ? 'offer' : 'ans');
		return new RegExp(fileNameRegex);
	}
	static parseFromFileName(fileName) {
		const splited = fileName.split('.');
		console.log('YadorigiSdpFileRecord splited:' + splited + '/' + splited.length);
		if (splited.length === 5) {
			const parsed = {
				groupNameHash: splited[0],
				userIdHash: splited[1],
				senderDeviceNameHash: splited[2],
				time: splited[3],
				isOffer: splited[4] === 'offer' ? true : splited[4] === 'ans' ? false : null
			};
			if (parsed.isOffer === null) {
				return null;
			}
			parsed.fileName = fileName;
			return parsed;
		}
		return null;
	}
	/////////////////////////////////////////////////////////////////////////////////////////////
	isExpired() {
		const current = TimeUtil.getNowUnixTimeAtUTC();
		if (this.expireDate && this.expireDate < current - expireSpan) {
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
