import { Hasher } from '../util/Hasher';
import { Base64Util } from '../util/Base64Util';
import { Deflater } from '../util/Deflater';
import { Cryptor } from '../util/Cryptor';
import { BinaryConverter } from '../util/BinaryConverter';
import { TimeUtil } from '../util/TimeUtil';
import { YadorigiSdpFileRecord } from './YadorigiSdpFileRecord';
const expireMunits = 30;
export class YadorigiFileProsessor {
	constructor(key, logger = console) {
		// GCMキー
		this.key = key;
		this.l = logger;
	}
	async buildOffer(passphraseText, imageList, senderDeviceName, sdp, userId, groupName, expireOffset = expireMunits) {
		return await this.build(passphraseText, imageList, senderDeviceName, sdp, userId, groupName, true, expireOffset);
	}
	async buildAnswer(passphraseText, imageList, senderDeviceName, sdp, userId, groupName, offerSdp, expireOffset = expireMunits) {
		return await this.build(passphraseText, imageList, senderDeviceName, sdp, userId, groupName, false, expireOffset, offerSdp);
	}
	async build(passphraseText, imageList, senderDeviceName, sdp, userId, groupName, isOffer = true, expireOffset = expireMunits, offerSdp) {
		const expireTime = TimeUtil.getNowUnixTimeAtUTC() + expireOffset * 60 * 1000;
		const [u8a, hash, fileName] = await this.createPayload(senderDeviceName, sdp, expireTime, userId, groupName, isOffer, offerSdp);
		const encryptedObj = await Cryptor.encodeAES256GCM(u8a, this.key ? this.key : passphraseText);
		const data = Base64Util.objToJsonBase64Url(encryptedObj);
		this.l.log(`YadorigiFileProsessor.build1 fileName:${fileName}/hash:${hash}/data:${data}`);

		const newImageList = this.maintainImageList(imageList, hash, fileName, expireOffset);
		this.l.log(`YadorigiFileProsessor.build2 fileName:${fileName}/offerSdp:${offerSdp}/newImageList:${newImageList}`);
		const recordObj = { fileName, hash, data, imageList: newImageList };
		this.l.log(`YadorigiFileProsessor.build3 recordObj:${JSON.stringify(recordObj)}`);
		return { hash, fileName, payload: this.convertObjToJsonDefratedBase64Url(recordObj) };
	}
	async createPayload(senderDeviceName, sdp, expireTime, userId, groupName, isOffer, offerSdp) {
		const payload = { senderDeviceName, sdp, expireTime, userId, groupName };
		const text = JSON.stringify(payload);
		this.l.log(`YadorigiFileProsessor.createPayload payload:${payload}/text:${text}/senderDeviceName:${senderDeviceName}/offerSdp:${offerSdp}`);
		const hashSeed = text + (isOffer ? '' : typeof offerSdp === 'string' ? offerSdp : JSON.stringify(offerSdp));
		const hash = await Hasher.sha512(hashSeed);
		// this.l .log('YadorigiFileProsessor.createPayload ab:' + ab);
		// const hash = Base64Util.ab2Base64Url(ab);
		this.l.log(`YadorigiFileProsessor.createPayload hash:${hash}/hashSeed:${hashSeed}`);
		const fileName = await YadorigiSdpFileRecord.createFileName(groupName, userId, senderDeviceName, isOffer, expireTime);
		const u8a = BinaryConverter.stringToU8A(text);
		this.l.log(`YadorigiFileProsessor.createPayload fileName:${fileName}/hash:${hash}/u8a:${u8a}`);
		return [u8a, hash, fileName];
	}
	maintainImageList(imageList, hash, fileName, expireOffset) {
		const currentList = imageList && Array.isArray(imageList) ? imageList : [];
		const expireDate = this.createExpireDate(expireOffset);
		this.l.log(`YadorigiFileProsessor.maintainImageList fileName:${fileName}/hash:${hash}/expireDate:${expireDate}`);
		const newRow = new YadorigiSdpFileRecord(fileName, hash, expireDate);
		const newList = [newRow.toObj()];
		this.l.log(`YadorigiFileProsessor.maintainImageList currentList:${currentList}`);
		this.l.log(currentList);
		for (const row of currentList) {
			//画像ファイル名、画像ハッシュ、有効期限
			const ySdp = new YadorigiSdpFileRecord(row);
			if (ySdp.isExpired()) {
				continue;
			}
			newList.unshift(ySdp.toObj());
		}
		return newList;
	}
	mergeList(imageListA, imageListB) {
		const newList = [];
		const map = {};
		for (const row of imageListA) {
			//画像ファイル名、画像ハッシュ、有効期限
			const ySdp = new YadorigiSdpFileRecord(row);
			if (ySdp.isExpired()) {
				continue;
			}
			const key = JSON.stringify(ySdp.toObj());
			if (map[key]) {
				continue;
			}
			map[key] = 1;

			newList.unshift(ySdp.toObj());
		}
		for (const row of imageListB) {
			//画像ファイル名、画像ハッシュ、有効期限
			const ySdp = new YadorigiSdpFileRecord(row);
			if (ySdp.isExpired()) {
				continue;
			}
			const key = JSON.stringify(ySdp.toObj());
			if (map[key]) {
				continue;
			}
			map[key] = 1;

			newList.unshift(ySdp.toObj());
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
		this.l.log(`parseOffer dataBase64url:${dataBase64url}`);
		return await this.parse(passphraseText, dataBase64url, true);
	}
	async parseAnswer(passphraseText, dataBase64url, offerSdp) {
		this.l.log(`parseAnswer dataBase64url:${dataBase64url}`);
		return await this.parse(passphraseText, dataBase64url, false, offerSdp);
	}
	async parse(passphraseText, dataBase64url, isOffer = true, offerSdp) {
		this.l.log(`parse isOffer:${isOffer}/dataBase64url:${dataBase64url}`);
		if (!dataBase64url) {
			return null;
		}
		const obj = this.convertJsonDefratedBase64UrlToObj(dataBase64url);
		this.l.log(`parse obj:${obj}`);
		if (!obj) {
			return null;
		}
		const { fileName, hash, data, imageList } = obj;
		this.l.log(`parse offerSdp:${offerSdp}`);
		this.l.log(obj);
		this.l.log(`parse A:${passphraseText}`);
		// eslint-disable-next-line prefer-template
		this.l.log('data:' + data);
		const encryptedString = Base64Util.jsonBase64UrlToObj(data);
		this.l.log(`encryptedString:${encryptedString}`);
		if (!encryptedString) {
			return null;
		}
		this.l.log(`parse B:${offerSdp}`);
		const keyInfo = this.key ? this.key : passphraseText;
		this.l.log(`parse B1:${keyInfo}`);
		const u8a = await Cryptor.decodeAES256GCM(encryptedString, keyInfo);
		this.l.log(u8a);
		const sdpString = offerSdp ? (typeof offerSdp === 'string' ? offerSdp : JSON.stringify(offerSdp)) : '';
		this.l.log(`parse C:isOffer:${isOffer} offerSdp:${offerSdp}/sdpString:${sdpString}`);
		if (!u8a) {
			return null;
		}
		const parsed = await this.parsePayload(u8a, isOffer, sdpString);
		this.l.log(parsed);
		this.l.log(`parse D:${parsed}/parsed:${typeof parsed}`);
		this.l.log(`parse parsed.hash:${parsed.hash}/hash:${hash}`);
		if (parsed.hash === hash) {
			const { senderDeviceName, sdp, expireTime, userId, groupName } = parsed.payload;
			const trueFileName = await YadorigiSdpFileRecord.createFileName(groupName, userId, senderDeviceName, isOffer, expireTime);
			this.l.log(
				`parse trueFileName:${trueFileName}/fileName:${fileName}/expireTime:${expireTime}/${TimeUtil.getNowUnixTimeAtUTC()}/${expireTime - TimeUtil.getNowUnixTimeAtUTC()}/${fileName === trueFileName}`
			);
			this.l.log(trueFileName);
			this.l.log(fileName);
			if (fileName === trueFileName && expireTime > TimeUtil.getNowUnixTimeAtUTC()) {
				this.l.log('parse E:OK PARSED!');
				return { fileName, sdp, hash, imageList, groupName, userId, senderDeviceName };
			}
			this.l.log(`parse F:${fileName !== trueFileName ? 'FILE NAME NOT MATCH!' : expireTime <= TimeUtil.getNowUnixTimeAtUTC() ? 'EXPIRED!' : 'NONE'}`);
			return { fileName, sdp: null, hash, imageList };
		}
		this.l.log('parse G:HASH NOR MATCH!!');
		return { fileName, sdp: null, hash, imageList };
	}
	convertJsonDefratedBase64UrlToObj(base64Url) {
		this.l.log(`convertJsonDefratedBase64UrlToObj base64Url:${base64Url}`);
		const ab = Base64Util.base64UrlToAB(base64Url);
		this.l.log(`convertJsonDefratedBase64UrlToObj ab:${ab}`);
		const infratedU8a = Deflater.inflate(new Uint8Array(ab));
		this.l.warn(`convertJsonDefratedBase64UrlToObj infratedU8a:${infratedU8a}`);
		const jsonString = infratedU8a && infratedU8a.buffer ? BinaryConverter.abToString(infratedU8a.buffer) : infratedU8a;
		this.l.log(`convertJsonDefratedBase64UrlToObj jsonString:${jsonString}`);
		return jsonString ? JSON.parse(jsonString) : null;
	}
	async parsePayload(u8a, isOffer, offerSdp) {
		const jsonPaload = BinaryConverter.u8aToString(u8a);
		const hash = await Hasher.sha512(jsonPaload + (isOffer ? '' : offerSdp));
		this.l.log(`AAAparse jsonString:${jsonPaload}`);
		const payload = JSON.parse(jsonPaload);
		this.l.log(`parse hash:${hash}/offerSdp:${offerSdp}`);
		return { hash, payload };
	}
	///////////////////////////////////////////////////////////////////////
	getParsedAnswerFileNameList(imageList) {
		this.l.log(`getParsedAnswerFileNameList imageList:${imageList}`);
		return this.getParsedOfferFileNameList(imageList, false);
	}
	getParsedOfferFileNameList(imageList, isOffer = true) {
		const list = this.getListAsParsed(imageList);
		const result = [];
		for (const parsed of list) {
			this.l.log(`getParsedOfferFileNameList parsed:${parsed}/`);
			this.l.log(parsed);
			if (parsed.isOffer === isOffer) {
				result.push(parsed);
			}
		}
		return result;
	}
	getListAsParsed(imageList) {
		const parsedList = [];
		this.l.log(`YadorigiFileProsessor.getListAsParsed imageList:${imageList}`);
		this.l.log(imageList);
		for (const row of imageList) {
			this.l.log(row);
			const ySdp = new YadorigiSdpFileRecord(row);
			this.l.log(`YadorigiFileProsessor.getListAsParsed ySdp.isExpired():${ySdp.isExpired()}`);
			if (ySdp.isExpired()) {
				continue;
			}
			this.l.log(`YadorigiFileProsessor.getListAsParsed ySdp:${ySdp}`);
			const parsed = YadorigiSdpFileRecord.parseFromFileName(ySdp.fileName);
			this.l.log(`YadorigiFileProsessor.getListAsParsed A parsed:${parsed}`);
			if (!parsed) {
				continue;
			}
			this.l.log(`YadorigiFileProsessor.getListAsParsed B parsed:${parsed}`);
			parsedList.push(parsed);
		}
		this.l.log(`YadorigiFileProsessor.getListAsParsed C parsedList:${(parsedList, length)}`);
		return parsedList;
	}
	//////////////////////////////////////////////////////////////////
	findOffer(imageList) {
		const result = null;
		this.l.log(`YadorigiFileProsessor.findOffer imageList:${imageList}`);
		this.l.log(imageList);
		if (imageList && Array.isArray(imageList)) {
			const newList = [];
			for (const row of imageList) {
				//画像ファイル名、画像ハッシュ、有効期限
				const ySdp = new YadorigiSdpFileRecord(row);
				if (ySdp.isExpired()) {
					continue;
				}
				newList.unshift(ySdp);
			}
			for (const ySdp of newList) {
				const fileName = ySdp.fileName;
				this.l.log(fileName);
			}
		}
		return result;
	}
}
