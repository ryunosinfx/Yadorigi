import { BinaryConverter } from './BinaryConverter';
import { Deflater } from './Deflater';
const base64Regex = /^[0-9a-zA-Z\/+=]+$/;
const base64UrlRegex = /^[0-9a-zA-Z-_]+$/;
export class Base64Util {
	constructor() {}
	static toHex(buffer) {
		const byteArray = new Uint8Array(buffer);
		const hexCodes = [...byteArray].map((value) => {
			const hexCode = value.toString(16);
			const paddedHexCode = hexCode.padStart(2, '0');
			return paddedHexCode;
		});

		return hexCodes.join('');
	}
	static isBase64(value) {
		if (value && typeof value === 'string' && value.length % 4 === 0 && base64Regex.test(value)) {
			return true;
		}
		return false;
	}
	static isBase64Url(value) {
		if (value && typeof value === 'string' && value.length % 4 === 0 && base64UrlRegex.test(value)) {
			return true;
		}
		return false;
	}
	static objToJsonBase64Url(obj, isWithDefrate) {
		const json = JSON.stringify(obj);
		const u8a = BinaryConverter.stringToU8A(json);
		const ab = isWithDefrate ? Deflater.deflate(u8a) : u8a.buffer;
		console.log('objToJsonBase64Url');
		console.log(ab);
		return Base64Util.ab2Base64Url(ab);
	}
	static jsonBase64UrlToObj(base64url, isWithInfrate) {
		const ab = Base64Util.base64UrlToAB(base64url);
		console.log('jsonBase64UrlToObj');
		console.log(ab);
		const abInfrated = isWithInfrate ? Deflater.inflate(ab) : ab;
		const str = BinaryConverter.abToString(abInfrated);
		return JSON.parse(str);
	}
	static ab2Base64(abInput) {
		const ab = abInput.buffer ? abInput.buffer : abInput;
		return window.btoa(BinaryConverter.arrayBuffer2BinaryString(ab));
	}
	static ab2Base64Url(abInput) {
		const base64 = Base64Util.ab2Base64(abInput);
		// console.log('base64:' + base64 + ' ' + base64.length);
		return Base64Util.toBase64Url(base64);
	}
	static base64ToAB(base64) {
		const bs = atob(base64);
		return BinaryConverter.binaryString2ArrayBuffer(bs);
	}
	static base64UrlToAB(base64url) {
		const base64 = Base64Util.toBase64(base64url);
		// console.log('[' + base64 + ']' + base64.length);
		return Base64Util.base64ToAB(base64);
	}
	static toBase64Url(base64) {
		return base64 ? base64.split('+').join('-').split('/').join('_').split('=').join('') : base64;
	}
	static toBase64(base64Url) {
		const len = base64Url.length;
		const count = len % 4 > 0 ? 4 - (len % 4) : 0;
		let resultBase64 = base64Url.split('-').join('+').split('_').join('/');

		for (let i = 0; i < count; i++) {
			resultBase64 += '=';
		}
		return resultBase64;
	}
}
