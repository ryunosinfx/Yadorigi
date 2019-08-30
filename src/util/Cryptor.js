import { BinaryConverter } from './BinaryConverter';
import { Base64Util } from './Base64Util';
import { Deflater } from './Deflater';
export class Cryptor {
	constructor() {}
	static async getKey(passphraseText, saltInput = null, isAB) {
		const salt = saltInput ? (isAB ? new Uint8Array(saltInput) : BinaryConverter.stringToU8A(saltInput)) : crypto.getRandomValues(new Uint8Array(16));
		// console.log('getKey salt:' + salt + '/passphraseText:' + passphraseText);
		const passphrase = BinaryConverter.stringToU8A(passphraseText).buffer;
		const digest = await crypto.subtle.digest({ name: 'SHA-256' }, passphrase);
		const keyMaterial = await crypto.subtle.importKey('raw', digest, { name: 'PBKDF2' }, false, ['deriveKey']);
		const key = await crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt,
				iterations: 100000,
				hash: 'SHA-256'
			},
			keyMaterial,
			{ name: 'AES-GCM', length: 256 },
			false,
			['encrypt', 'decrypt']
		);
		return [key, salt];
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
	static async encodeAES256GCM(inputU8a, passphraseText) {
		const [key, salt] = await Cryptor.getKey(passphraseText);
		const fixedPart = Cryptor.getFixedField();
		const invocationPart = Cryptor.getInvocationField();
		const iv = Uint8Array.from([...fixedPart, ...new Uint8Array(invocationPart.buffer)]);
		// console.log(iv);
		const encryptedDataAB = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, inputU8a.buffer);
		// console.log('encryptedDataAB:' + encryptedDataAB);
		// console.log('iv' + Base64Util.ab2Base64Url(iv) + '/' + iv.byteLength);
		// console.log('salt' + Base64Util.ab2Base64Url(salt) + '/' + salt.byteLength);
		// console.log('Deflater.deflate(encryptedDataAB):' + Deflater.deflate(encryptedDataAB));
		// console.log('encryptedDataAB:' + Base64Util.ab2Base64Url(encryptedDataAB));
		// const encryptedData = Array.from(new Uint8Array(encryptedDataAB), char => String.fromCharCode(char)).join('');
		const dataEncrypted = await Deflater.deflate(new Uint8Array(encryptedDataAB)).buffer;
		return JSON.stringify([
			Base64Util.ab2Base64Url(dataEncrypted),
			// 暗号化されたデータには、必ず初期ベクトルの
			// 変動部とパスワードのsaltを添付して返す。
			Base64Util.ab2Base64Url(iv.buffer),
			Base64Util.ab2Base64Url(salt.buffer)
		]);
	}
	static async decodeAES256GCM(encryptedResultJSON, passphraseText) {
		const [encryptedDataBase64Url, invocationPart, salt] = JSON.parse(encryptedResultJSON);
		// console.log(salt);
		// console.log(invocationPart);
		// console.log(encryptedDataBase64Url);
		const [key, _] = await Cryptor.getKey(passphraseText, Base64Util.base64UrlToAB(salt), true);
		// console.log('decodeAES256GCM 1 salt:' + salt);
		const iv = new Uint8Array(Base64Util.base64UrlToAB(invocationPart));
		// console.log(iv);
		// console.log('decodeAES256GCM 2 iv:' + iv);
		const encryptedData = Base64Util.base64UrlToAB(encryptedDataBase64Url);
		// console.log('decodeAES256GCM 3 encryptedData:' + encryptedData);
		// console.log('decodeAES256GCM 3 key:' + key);
		const inflateData = await Deflater.inflate(new Uint8Array(encryptedData));
		const dataForDecrypt = inflateData;
		// console.log('encryptedDataAB_:' + Base64Util.ab2Base64Url(dataForDecrypt));
		// console.log('decodeAES256GCM 4 inflateData:' + inflateData);
		// encryptedData = Uint8Array.from(encryptedData.split(''), char => char.charCodeAt(0));
		const decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, dataForDecrypt);
		// console.log('decodeAES256GCM 5 decryptedData:' + decryptedData);
		// decryptedData = new TextDecoder().decode(new Uint8Array(decryptedData));
		return new Uint8Array(decryptedData);
		// return JSON.parse(decryptedData);
	}
}
