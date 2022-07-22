import pako from 'pako';
export class Deflater {
	static deflateP(u8Input) {
		const u32a = u8Input.byteLength ? new Uint32Array(u8Input) : new Uint32Array(u8Input.buffer);
		return pako.deflate(u32a);
	}
	static inflateP(u8Input) {
		const u32a = u8Input.byteLength ? new Uint32Array(u8Input) : new Uint32Array(u8Input.buffer);
		return pako.inflate(u32a);
	}

	static deflate(u8Input) {
		const u32a = u8Input.byteLength ? new Uint32Array(u8Input) : new Uint32Array(u8Input.buffer);
		return pako.deflate(u32a);
	}
	static inflate(u8Input) {
		console.log(`Deflater inflate u8Input:${u8Input.byteLength}`);
		let result = null;
		try {
			const u32a = u8Input.byteLength ? new Uint32Array(u8Input) : new Uint32Array(u8Input.buffer);
			result = pako.inflate(u32a);
			console.log(`Deflater inflate result:${result}`);
		} catch (e) {
			console.log(e);
		}
		return result;
	}
}
