import pako from 'pako';
export class Deflater {
	static deflate(u8a) {
		return pako.deflate(u8a);
	}
	static inflate(u8a) {
		return pako.inflate(u8a);
	}
}
