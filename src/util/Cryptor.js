import { BinaryConverter } from './BinaryConverter.js';
import { Base64Util } from './Base64Util.js';
import { Deflater } from './Deflater.js';
export class Cryptor {
	constructor() {}
	static async getKey(passphraseText, salt) {
		console.log(`getKey salt:${salt}/passphraseText:${passphraseText}`);
		const passphrase = BinaryConverter.stringToU8A(passphraseText).buffer;
		const digest = await crypto.subtle.digest({ name: 'SHA-256' }, passphrase);
		console.log(`digest:${digest}`);
		const keyMaterial = await crypto.subtle.importKey('raw', digest, { name: 'PBKDF2' }, false, ['deriveKey']);
		console.log(`keyMaterial:${keyMaterial}`);
		const key = await crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt,
				iterations: 100000,
				hash: 'SHA-256',
			},
			keyMaterial,
			{ name: 'AES-GCM', length: 256 },
			false,
			['encrypt', 'decrypt']
		);
		console.log(`key:${key}`);
		return [key, salt];
	}
	static getSalt(saltInput, isAB) {
		const salt = saltInput ? (isAB ? new Uint8Array(saltInput) : BinaryConverter.stringToU8A(saltInput)) : crypto.getRandomValues(new Uint8Array(16));
		return salt;
	}
	static async importKeyAESGCM(keyArrayBuffer, usages = ['encrypt', 'decrypt']) {
		const algorithm = { name: 'AES-GCM' };
		const result = await crypto.subtle.importKey('raw', keyArrayBuffer, algorithm, true, usages);
		return result;
	}
	static getFixedField() {
		// 96bitをUint8Arrayで表すため、96 / 8 = 12が桁数となる。
		const value = crypto.getRandomValues(new Uint8Array(12));
		return value;
	}
	static getInvocationField() {
		return window.crypto.getRandomValues(new Uint32Array(1));
	}
	static secureMathRandom() {
		// 0から1の間の範囲に調整するためにUInt32の最大値(2^32 -1)で割る
		return window.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
	}
	static async encodeStrAES256GCM(inputStr, passphraseTextOrKey) {
		const u8a = BinaryConverter.stringToU8A(inputStr);
		return await Cryptor.encodeAES256GCM(u8a, passphraseTextOrKey);
	}
	static async encodeAES256GCM(inputU8a, passphraseTextOrKey, saltInput = null, isAB) {
		const salt = Cryptor.getSalt(saltInput, isAB);
		const key = await Cryptor.loadKey(passphraseTextOrKey, salt);
		const fixedPart = Cryptor.getFixedField();
		const invocationPart = Cryptor.getInvocationField();
		const iv = Uint8Array.from([...fixedPart, ...new Uint8Array(invocationPart.buffer)]);
		console.log(iv);
		console.log(`encodeAES256GCM 0 inputU8a:${inputU8a}`);
		const encryptedDataAB = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, inputU8a.buffer);
		console.log(`encodeAES256GCM 1 encryptedDataAB:${encryptedDataAB}`);
		console.log(`encodeAES256GCM 2 iv${Base64Util.ab2Base64Url(iv)}/${iv.byteLength}`);
		console.log(`encodeAES256GCM 3 salt${Base64Util.ab2Base64Url(salt)}/${salt.byteLength}`);
		// console.log('encodeAES256GCM 4 Deflater.deflate(encryptedDataAB):' + Deflater.deflate(encryptedDataAB));
		console.log(`encodeAES256GCM 5 encryptedDataAB:${Base64Util.ab2Base64Url(encryptedDataAB)}`);
		// const encryptedData = Array.from(new Uint8Array(encryptedDataAB), (char) => String.fromCharCode(char)).join('');
		const dataEncrypted = Deflater.deflate(new Uint8Array(encryptedDataAB)).buffer;
		return JSON.stringify([
			Base64Util.ab2Base64Url(dataEncrypted),
			// 暗号化されたデータには、必ず初期ベクトルの
			// 変動部とパスワードのsaltを添付して返す。
			Base64Util.ab2Base64Url(iv.buffer),
			Base64Util.ab2Base64Url(salt.buffer),
		]);
	}
	static async decodeAES256GCMasStr(encryptedResultJSON, passphraseTextOrKey) {
		const decoedU8a = await Cryptor.decodeAES256GCM(encryptedResultJSON, passphraseTextOrKey);
		return BinaryConverter.u8aToString(decoedU8a);
	}
	static async loadKey(passphraseTextOrKey, salt) {
		console.log(`loadKey passphraseTextOrKey:${passphraseTextOrKey}`);
		console.log(`loadKey salt:${salt}`);
		const saltU8A = typeof salt === 'string' ? new Uint8Array(Base64Util.base64UrlToAB(salt)) : salt;
		// const [key, _] = await Cryptor.getKey(passphraseText, Base64Util.base64UrlToAB(salt), true);
		const [key] = typeof passphraseTextOrKey === 'string' ? await Cryptor.getKey(passphraseTextOrKey, saltU8A) : { passphraseTextOrKey };
		return key;
	}
	static async decodeAES256GCM(encryptedResultJSON, passphraseTextOrKey) {
		const [encryptedDataBase64Url, invocationPart, salt] = JSON.parse(encryptedResultJSON);
		console.log(salt);
		console.log(invocationPart);
		console.log('encryptedDataBase64Url.length');
		console.log(encryptedDataBase64Url.length);
		console.log(encryptedDataBase64Url);
		console.log(encryptedResultJSON.length);
		console.log(encryptedResultJSON);
		console.log(`decodeAES256GCM 1 salt:${salt}`);
		const iv = new Uint8Array(Base64Util.base64UrlToAB(invocationPart));
		console.log(iv);
		console.log(`decodeAES256GCM 2 iv:${iv}`);
		const encryptedData = Base64Util.base64UrlToAB(encryptedDataBase64Url);
		console.log(`decodeAES256GCM 3 encryptedData:${encryptedData}`);
		const key = await Cryptor.loadKey(passphraseTextOrKey, salt);
		console.log(`decodeAES256GCM 4 key:${key}`);
		const dataForDecrypt = await Deflater.inflate(new Uint8Array(encryptedData));
		// const dataForDecrypt = inflateData;
		console.log(`encryptedDataAB_:${Base64Util.ab2Base64Url(dataForDecrypt.buffer)}`);
		console.log(`decodeAES256GCM 5 dataForDecrypt:${dataForDecrypt}`);
		// const decrepted = Uint8Array.from(dataForDecrypt.split(''), (char) => char.charCodeAt(0));
		// console.log('decodeAES256GCM 4 decrepted:' + decrepted);
		const decrepteduAB = dataForDecrypt.buffer; //BinaryConverter.binaryString2ArrayBuffer(dataForDecrypt);
		console.log(`decodeAES256GCM 6 decrepteduAB:${Base64Util.ab2Base64Url(decrepteduAB)}`);
		let decryptedData = null;
		try {
			decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, decrepteduAB);
		} catch (e) {
			console.warn(e);
			return null;
		}
		console.log(`decodeAES256GCM 7 decryptedData:${decryptedData}`);
		console.log(`decodeAES256GCM 7 decryptedData:${Base64Util.ab2Base64Url(decryptedData)}`);
		// decryptedData = new TextDecoder().decode(new Uint8Array(decryptedData));
		console.log(`decodeAES256GCM 8 decryptedData:${decryptedData}`);
		console.log(`decodeAES256GCM 8 decryptedData:${BinaryConverter.u8aToString(new Uint8Array(decryptedData))}`);
		return new Uint8Array(decryptedData);
		// return JSON.parse(decryptedData);
	}
}
