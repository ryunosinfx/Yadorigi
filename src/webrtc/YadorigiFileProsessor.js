import { Hasher } from '../util/Hasher';
import { Base64Util } from '../util/Base64Util';
import { Deflater } from '../util/Deflater';
import { Cryptor } from '../util/Cryptor';
import { BinaryConverter } from '../util/BinaryConverter';
import { TimeUtil } from '../util/TimeUtil';
import { YadorigiSdpFileRecord } from './YadorigiSdpFileRecord';
const expireMunits = 30;
export class YadorigiFileProsessor {
	constructor() {}
	async build(passphraseText, imageList, senderDeviceName, sdp, userId, groupName, expireOffset = expireMunits) {
		const expireTime = TimeUtil.getNowUnixTimeAtUTC() + expireOffset * 60 * 1000;
		const [u8a, hash, fileName] = await this.createPayload(senderDeviceName, sdp, expireTime, userId, groupName);
		const encryptedObj = await Cryptor.encodeAES256GCM(u8a, passphraseText);
		const data = Base64Util.objToJsonBase64Url(encryptedObj);
		const newImageList = this.maintainImageList(imageList, hash, fileName, expireOffset);
		const recordObj = { fileName, hash, data, imageList: newImageList };
		return this.convertObjToJsonDefratedBase64Url(recordObj);
	}
	async createPayload(senderDeviceName, sdp, expireTime, userId, groupName) {
		const payload = { senderDeviceName, sdp, expireTime, userId, groupName };
		const text = JSON.stringify(payload);
		const hash = Base64Util.ab2Base64Url(await Hasher.sha512(text));
		const fileName = await this.createFileName(groupName, userId, senderDeviceName);
		const u8a = BinaryConverter.stringToU8A(text);
		return [u8a, hash, fileName];
	}
	maintainImageList(imageList, hash, fileName, expireOffset) {
		const currentList = imageList && Array.isArray(imageList) ? imageList : [];
		const expireDate = this.createExpireDate(expireOffset);
		const newRow = new YadorigiSdpFileRecord(fileName, hash, expireDate);
		const newList = [newRow.toObj()];
		for (let row of currentList) {
			//画像ファイル名、画像ハッシュ、有効期限
			const ysdp = new YadorigiSdpFileRecord(row);
			if (ysdp.isExpired()) {
				continue;
			}
			newList.unshift(ysdp.toObj());
		}
		return newList;
	}
	convertObjToJsonDefratedBase64Url(obj) {
		const text = JSON.stringify(obj);
		const u8a = BinaryConverter.stringToU8A(text);
		const defratedU8a = Deflater.deflate(u8a);
		return Base64Util.ab2Base64Url(defratedU8a.buffer);
	}
	createExpireDate(expireOffset = expireMunits) {
		return TimeUtil.getNowUnixTimeAtUTC() + expireOffset * 60 * 1000;
	}
	//////////////////////////////////////////////////
	async parse(passphraseText, dataBase64url, isOffer = true) {
		const obj = this.convertJsonDefratedBase64UrlToObj(dataBase64url);
		const { fileName, hash, data, imageList } = obj;
		console.log('parse:');
		console.log(obj);
		const encryptedObj = Base64Util.jsonBase64UrlToObj(data);
		const u8a = await Cryptor.decodeAES256GCM(encryptedObj, passphraseText);
		const parsed = this.parsePayload(u8a);
		if (parsed.hash === hash) {
			const { senderDeviceName, sdp, expireTime, userId, groupName } = parsed.payload;
			const trueFileName = await this.createFileName(groupName, userId, senderDeviceName, isOffer);
			if (fileName === trueFileName && expireTime > TimeUtil.getNowUnixTimeAtUTC()) {
				return { fileName, sdp, hash, imageList, roupName, userId, senderDeviceName };
			}
			return { fileName, spd: null, hash, imageList };
		}
		return { fileName, spd: null, hash, imageList };
	}
	convertJsonDefratedBase64UrlToObj(base64Url) {
		const ab = Base64Util.base64UrlToAB(base64Url);
		const infratedU8a = Deflater.inflate(new Uint8Array(ab));
		const jsonString = BinaryConverter.abToString(infratedU8a.buffer);
		return JSON.parse(jsonString);
	}
	async parsePayload(u8a) {
		const jsonPaload = BinaryConverter.u8aToString(u8a);
		const hash = Base64Util.ab2Base64Url(await Hasher.sha512(jsonPaload));
		const payload = JSON.parse(jsonPaload);
		return { hash, payload };
	}
	createFileNameOffer(groupName, userId, senderDeviceName) {
		return this.createFileName(groupName, userId, senderDeviceName, true);
	}
	createFileNameAnswer(groupName, userId, senderDeviceName) {
		return this.createFileName(groupName, userId, senderDeviceName, false);
	}
	//ユーザーIDのハッシュとデバイス名ハッシュをキー
	async createFileName(groupName, userId, senderDeviceName, isOffer = true) {
		//512 25612864
		const userIdHash = Base64Util.ab2Base64Url(await Hasher.sha512(userId)); //64
		const groupNameHash = Base64Util.ab2Base64Url(await Hasher.sha512(groupName)); //64
		const senderDeviceNameHash = Base64Util.ab2Base64Url(await Hasher.sha512(senderDeviceName)); //64
		const fileName = groupNameHash + '.' + userIdHash + '.' + senderDeviceNameHash + '.' + TimeUtil.getNowUnixtime() + '.' + (isOffer ? 'offer' : 'ans');
		return fileName;
	}
	parseFromFileName(fileName) {
		const splited = fileName.split('.');
		if (splited.length === 5) {
			const parsed = {
				groupNameHash: splited[0],
				userIdHash: splited[1],
				senderDeviceNameHash: splited[2],
				time: splited[3],
				isOffer: splited[3] === 'offer' ? true : splited[3] === 'ans' ? false : null
			};
			if (parsed.isOffer === null) {
				return null;
			}
			return parsed;
		}
		return null;
	}
	///////////////////////////////////////////////////////////////////////
	getParsedAnswerFileNameList(imageList, isOffer = true) {
		return this.getParsedOfferFileNameList(imageList, false);
	}
	getParsedOfferFileNameList(imageList, isOffer = true) {
		const list = this.getListAsParsed(imageList);
		const result = [];
		for (let parsed of list) {
			if (parsed.isOffer === isOffer) {
				result.push(parsed);
			}
		}
		return result;
	}
	getListAsParsed(imageList) {
		const parsedList = [];
		for (let row of imageList) {
			const ysdp = new YadorigiSdpFileRecord(row);
			if (ysdp.isExpired()) {
				continue;
			}
			const parsed = this.parseFromFileName(ysdp.fileName);
			if (!parsed) {
				continue;
			}
			parsedList.push(parsed);
		}
		return parsedList;
	}
}
