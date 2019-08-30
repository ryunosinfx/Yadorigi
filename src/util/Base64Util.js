import { BinaryConverter } from './BinaryConverter';

export class Base64Util {
	constructor() {}
	static toHex(buffer) {
		const byteArray = new Uint8Array(buffer);
		const hexCodes = [...byteArray].map(value => {
			const hexCode = value.toString(16);
			const paddedHexCode = hexCode.padStart(2, '0');
			return paddedHexCode;
		});

		return hexCodes.join('');
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
		return base64
			? base64
					.split('+')
					.join('-')
					.split('/')
					.join('_')
					.split('=')
					.join('')
			: base64;
	}
	static toBase64(base64Url) {
		const len = base64Url.length;
		const count = len % 4 > 0 ? 4 - (len % 4) : 0;
		let resultBase64 = base64Url
			.split('-')
			.join('+')
			.split('_')
			.join('/');

		for (let i = 0; i < count; i++) {
			resultBase64 += '=';
		}
		return resultBase64;
	}
}
