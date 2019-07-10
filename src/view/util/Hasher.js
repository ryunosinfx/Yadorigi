export class Hasher {
	static sha256(message, stretchCount = 1) {
		return Hasher.digest(message, 'SHA-256', stretchCount);
	}
	static sha384(message, stretchCount = 1) {
		return Hasher.digest(message, 'SHA-384', stretchCount);
	}
	static sha512(message, stretchCount = 1) {
		return Hasher.digest(message, 'SHA-512', stretchCount);
	}
	static sha1(message, stretchCount = 1) {
		return Hasher.digest(message, 'SHA-1', stretchCount);
	}
	static digest(message, algo = 'SHA-256', stretchCount = 1) {
		const encoder = new TextEncoder();
		let result = encoder.encode(message);
		for (let i = 0; i < stretchCount; i++) {
			result = window.crypto.subtle.digest(algo, result);
		}
		return result;
	}
}
