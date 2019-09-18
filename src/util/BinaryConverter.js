const te = new TextEncoder('utf-8');
const td = new TextDecoder('utf-8');
export class BinaryConverter {
	static binaryString2ArrayBuffer(binaryString) {
		return BinaryConverter.binaryString2Uint8Array(binaryString).buffer;
	}
	static arrayBuffer2BinaryString(buffer) {
		return BinaryConverter.uint8Array2BinaryString(new Uint8Array(buffer));
	}
	static arrayBuffer2base64(buffer) {
		return btoa(BinaryConverter.uint8Array2BinaryString(new Uint8Array(buffer)));
	}
	static arrayBuffer2DataURI(buffer, type = 'application/octet-stream') {
		const base64 = btoa(BinaryConverter.arrayBuffer2BinaryString(buffer));
		return 'data:' + type + ';base64,' + base64;
	}
	static stringToU8A(str) {
		const u8a = te.encode(str);
		return u8a;
	}
	static abToString(ab) {
		return td.decode(new Uint8Array(ab));
	}
	static u8aToString(u8a) {
		return td.decode(new Uint8Array(u8a.buffer));
	}
	static joinU8as(u8as) {
		let sumLength = 0;
		const u8asCount = u8as.length;
		for (let i = 0; i < u8asCount; i++) {
			sumLength += u8as[i].byteLength;
		}
		const united = new Uint8Array(sumLength);
		let offset = 0;
		for (let i = 0; i < u8asCount; i++) {
			const u8a = u8as[i];
			whole.set(u8a, offset);
			united += u8a.byteLength;
		}
		return united;
	}
	static binaryString2Uint8Array(binaryString) {
		const list = binaryString.split('');
		const rawLength = binaryString.length;
		const array = new Uint8Array(new ArrayBuffer(rawLength));
		for (let i = 0; i < rawLength; i++) {
			array[i] = binaryString.charCodeAt(i);
		}
		return array;
	}

	static uint8Array2BinaryString(u8a) {
		let retList = [];
		for (let e of u8a) {
			retList.push(String.fromCharCode(e));
		}
		return retList.join('');
	}

	static binaryString2DataURI(binaryString, type = 'application/octet-stream') {
		return 'data:' + type + ';base64,' + btoa(binaryString);
	}
	static base642DataURI(base64, type = 'application/octet-stream') {
		return 'data:' + type + ';base64,' + base64;
	}
	static base642binaryString(base64) {
		return atob(base64);
	}
	static base642ArrayBuffer(base64) {
		return BinaryConverter.binaryString2ArrayBuffer(atob(base64));
	}

	static dataURI2BinaryString(dataURI) {
		return atob(dataURI.split(',')[1]);
	}
	static dataURI2ArrayBuffer(dataURI) {
		return BinaryConverter.binaryString2Uint8Array(atob(dataURI.split(',')[1])).buffer;
	}

	static uintArray2ArrayBuffer(uintArray) {
		return uintArray.buffer;
	}

	static arrayBuffer2Uint8Array(arrayBuffer) {
		return new Uint8Array(arrayBuffer);
	}

	static arrayBuffer2Uint16Array(arrayBuffer) {
		return new Uint16Array(arrayBuffer);
	}
	static arrayBuffer2Uint32Array(arrayBuffer) {
		return new Uint32Array(arrayBuffer);
	}

	static ArrayBuffer2Blob(val, type = 'application/octet-stream') {
		return new Blob([val], { type: type });
	}
	static readBlob(blob) {
		const reader = new FileReader();
		const promise = new Promise((resolve, reject) => {
			reader.onload = eve => {
				resolve(reader.result);
			};
			reader.onerror = eve => {
				reject(reader.error);
			};
		});

		return {
			asArrayBuffer() {
				reader.readAsArrayBuffer(blob);
				return promise;
			},
			asBinaryString() {
				reader.readAsBinaryString(blob);
				return promise;
			},
			asDataURL() {
				reader.readAsDataURL(blob);
				return promise;
			},
			asText() {
				reader.readAsText(blob);
				return promise;
			}
		};
	}
	static convertU8aToU16a(u8a) {
		const len = u8a.length;
		if (len % 2 > 0) {
			throw new RangeError('Uint8Arrayの長さが2の倍数ではありません。');
		}
		return new Uint16Array(u8a.buffer);
	}
}
