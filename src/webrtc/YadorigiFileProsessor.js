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
	async buildOffer(passphraseText, imageList, senderDeviceName, sdp, userId, groupName, expireOffset = expireMunits) {
		return await this.build(passphraseText, imageList, senderDeviceName, sdp, userId, groupName, true, expireOffset);
	}
	async buildAnswer(passphraseText, imageList, senderDeviceName, sdp, userId, groupName, offerSdp, expireOffset = expireMunits) {
		return await this.build(passphraseText, imageList, senderDeviceName, sdp, userId, groupName, false, expireOffset, offerSdp);
	}
	async build(passphraseText, imageList, senderDeviceName, sdp, userId, groupName, isOffer = true, expireOffset = expireMunits, offerSdp) {
		const expireTime = TimeUtil.getNowUnixTimeAtUTC() + expireOffset * 60 * 1000;
		const [u8a, hash, fileName] = await this.createPayload(senderDeviceName, sdp, expireTime, userId, groupName, isOffer, offerSdp);
		const encryptedObj = await Cryptor.encodeAES256GCM(u8a, passphraseText);
		const data = Base64Util.objToJsonBase64Url(encryptedObj);
		const newImageList = this.maintainImageList(imageList, hash, fileName, expireOffset);
		const recordObj = { fileName, hash, data, imageList: newImageList };
		return { hash, fileName, payload: this.convertObjToJsonDefratedBase64Url(recordObj) };
	}
	async createPayload(senderDeviceName, sdp, expireTime, userId, groupName, isOffer, offerSdp) {
		const payload = { senderDeviceName, sdp, expireTime, userId, groupName };
		const text = JSON.stringify(payload);
		console.log('YadorigiFileProsessor.createPayload payload:' + payload + '/text:' + text + '/senderDeviceName:' + senderDeviceName);
		const hash = await Hasher.sha512(text + (isOffer ? '' : offerSdp));
		// console.log('YadorigiFileProsessor.createPayload ab:' + ab);
		// const hash = Base64Util.ab2Base64Url(ab);
		console.log('YadorigiFileProsessor.createPayload hash:' + hash);
		const fileName = await YadorigiSdpFileRecord.createFileName(groupName, userId, senderDeviceName, isOffer, expireTime);
		const u8a = BinaryConverter.stringToU8A(text);
		console.log('YadorigiFileProsessor.createPayload fileName:' + fileName + '/hash:' + hash + '/u8a:' + u8a);
		return [u8a, hash, fileName];
	}
	maintainImageList(imageList, hash, fileName, expireOffset) {
		const currentList = imageList && Array.isArray(imageList) ? imageList : [];
		const expireDate = this.createExpireDate(expireOffset);
		console.log('YadorigiFileProsessor.maintainImageList fileName:' + fileName + '/hash:' + hash + '/expireDate:' + expireDate);
		const newRow = new YadorigiSdpFileRecord(fileName, hash, expireDate);
		const newList = [newRow.toObj()];
		console.log('YadorigiFileProsessor.maintainImageList currentList:' + currentList);
		console.log(currentList);
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
	async parseOffer(passphraseText, dataBase64url) {
		return await this.parse(passphraseText, dataBase64url, true);
	}
	async parseAnswer(passphraseText, dataBase64url, offerSdp) {
		return await this.parse(passphraseText, dataBase64url, false, offerSdp);
	}
	async parse(passphraseText, dataBase64url, isOffer = true, offerSdp) {
		const obj = this.convertJsonDefratedBase64UrlToObj(dataBase64url);
		const { fileName, hash, data, imageList } = obj;
		console.log('parse offerSdp:' + offerSdp);
		console.log(obj);
		console.log('parse A:' + passphraseText);
		const encryptedObj = Base64Util.jsonBase64UrlToObj(data);
		console.log(encryptedObj);
		console.log('parse B:' + offerSdp);
		const u8a = await Cryptor.decodeAES256GCM(encryptedObj, passphraseText);
		console.log(u8a);
		console.log('parse C:' + offerSdp);
		const parsed = await this.parsePayload(u8a, isOffer, offerSdp);
		console.log(parsed);
		console.log('parse D:' + parsed + '/parsed:' + typeof parsed);
		console.log('parse parsed.hash:' + parsed.hash + '/hash:' + hash);
		if (parsed.hash === hash) {
			const { senderDeviceName, sdp, expireTime, userId, groupName } = parsed.payload;
			const trueFileName = await YadorigiSdpFileRecord.createFileName(groupName, userId, senderDeviceName, isOffer, expireTime);
			console.log(
				'parse trueFileName:' +
					trueFileName +
					'/fileName:' +
					fileName +
					'/expireTime:' +
					expireTime +
					'/' +
					TimeUtil.getNowUnixTimeAtUTC() +
					'/' +
					(expireTime - TimeUtil.getNowUnixTimeAtUTC()) +
					'/' +
					(fileName === trueFileName)
			);
			console.log(trueFileName);
			console.log(fileName);
			if (fileName === trueFileName && expireTime > TimeUtil.getNowUnixTimeAtUTC()) {
				console.log('parse E:');
				return { fileName, sdp, hash, imageList, groupName, userId, senderDeviceName };
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
	async parsePayload(u8a, isOffer, offerSdp) {
		const jsonPaload = BinaryConverter.u8aToString(u8a);
		const hash = await Hasher.sha512(jsonPaload + (isOffer ? '' : offerSdp));
		console.log('AAAparse jsonString:' + jsonPaload);
		const payload = JSON.parse(jsonPaload);
		console.log('parse hash:' + hash + '/offerSdp:' + offerSdp);
		return { hash, payload };
	}
	///////////////////////////////////////////////////////////////////////
	getParsedAnswerFileNameList(imageList, isOffer = true) {
		return this.getParsedOfferFileNameList(imageList, false);
	}
	getParsedOfferFileNameList(imageList, isOffer = true) {
		const list = this.getListAsParsed(imageList);
		const result = [];
		for (let parsed of list) {
			console.log('getParsedOfferFileNameList parsed:' + parsed);
			console.log(parsed);
			if (parsed.isOffer === isOffer) {
				result.push(parsed);
			}
		}
		return result;
	}
	getListAsParsed(imageList) {
		const parsedList = [];
		console.log('YadorigiFileProsessor.getListAsParsed imageList:' + imageList);
		console.log(imageList);
		for (let row of imageList) {
			console.log(row);
			const ysdp = new YadorigiSdpFileRecord(row);
			console.log('YadorigiFileProsessor.getListAsParsed ysdp.isExpired():' + ysdp.isExpired());
			if (ysdp.isExpired()) {
				continue;
			}
			console.log('YadorigiFileProsessor.getListAsParsed ysdp:' + ysdp);
			const parsed = YadorigiSdpFileRecord.parseFromFileName(ysdp.fileName);
			console.log('YadorigiFileProsessor.getListAsParsed A parsed:' + parsed);
			if (!parsed) {
				continue;
			}
			console.log('YadorigiFileProsessor.getListAsParsed B parsed:' + parsed);
			parsedList.push(parsed);
		}
		return parsedList;
	}
	//////////////////////////////////////////////////////////////////
	findOffer(imageList) {
		let result = null;
		console.log('YadorigiFileProsessor.findOffer imageList:' + imageList);
		console.log(imageList);
		if (imageList && Array.isArray(imageList)) {
			const newList = [];
			for (let row of imageList) {
				//画像ファイル名、画像ハッシュ、有効期限
				const ysdp = new YadorigiSdpFileRecord(row);
				if (ysdp.isExpired()) {
					continue;
				}
				newList.unshift(ysdp);
			}
			for (let ysdp of newList) {
				const fileName = ysdp.fileName;
			}
		}
		return result;
	}
}
