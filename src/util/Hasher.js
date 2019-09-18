export class Hasher {
	static async sha256(message, stretchCount = 1) {
		return await Hasher.digest(message, 'SHA-256', stretchCount);
	}
	static async sha384(message, stretchCount = 1) {
		return await Hasher.digest(message, 'SHA-384', stretchCount);
	}
	static async sha512(message, stretchCount = 1) {
		return await Hasher.digest(message, 'SHA-512', stretchCount);
	}
	static async sha1(message, stretchCount = 1) {
		return await Hasher.digest(message, 'SHA-1', stretchCount);
	}
	static async digest(message, algo = 'SHA-256', stretchCount = 1) {
		const encoder = new TextEncoder();
		let result = encoder.encode(message);
		for (let i = 0; i < stretchCount; i++) {
			result = await window.crypto.subtle.digest(algo, result);
		}
		return result;
	}
}
