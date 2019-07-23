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
	static ab2Base64(arrayBuffer) {
		return window.btoa(arrayBuffer);
	}
	static ab2Base64Url(arrayBuffer) {
		return Base64Util.toBase64Url(window.btoa(arrayBuffer));
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
		const count = len % 4;
		let resultBase64 = base64Url
			.split('+')
			.join('-')
			.split('/')
			.join('_');

		for (let i = 0; i < count; i++) {
			resultBase64 += '=';
		}
		return resultBase64;
	}
}
