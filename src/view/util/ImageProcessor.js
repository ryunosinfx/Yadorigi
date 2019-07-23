import vu from './ViewUtil';
import { BinaryConverter } from '../../util/BinaryConverter';
import { Deflater } from '../../util/Deflater';

const imgRe = /^image\/.+|application\/octet-stream/;
const padding0 = BinaryConverter.stringToU8A('aaaa');
const padding1 = BinaryConverter.stringToU8A('bbb');
const padding2 = BinaryConverter.stringToU8A('cc');
const padding3 = BinaryConverter.stringToU8A('d');
const paddingHeader = [padding0, padding1, padding2, padding3];

export class ImageProcessor {
	constructor() {
		this.canvas = vu.createCanvas(null, 'hidden');

		this.ctx = this.canvas.getContext('2d');
		window.onload = () => {
			document.body.appendChild(this.canvas);
		};
	}
	setDataURI(dataURI) {
		this.dataURI = dataURI;
	}
	async resize(ab, maxWidth, maxHeight) {
		const origin = await this.getImageDataFromArrayBuffer(ab);
		return this.resizeInMaxSize(origin, maxWidth, maxHeight);
	}
	async makeAbAsPng(ab) {
		const u8aPlane = BinaryConverter.arrayBuffer2Uint8Array(ab);
		const compressed = Deflater.deflate(u8aPlane);
		const bytelength = compressed.byteLength;
		const paddingCount = bytelength % 4;
		const width = Math.ceil(bytelength / 4);
		const padding = paddingHeader[paddingCount];
		const u8aData = BinaryConverter.arrayBuffer2Uint8Array(compressed);
		const united = BinaryConverter.joinU8as([padding, u8aData]);

		let newImage = this.ctx.createImageData(width, 1);
		const unitedLength = united.length;
		const len = newData.data.length;
		for (let i = 0; i < unitedLength; i++) {
			newImage.data[i] = united[i];
		}
		this.canvas.width = newImage.width;
		this.canvas.height = newImage.height;
		this.ctx.putImageData(newImage, 0, 0);
		const dataUri = this.exportPng();
		return dataUri;
	}
	async makePngToAb(dataUri) {
		return new Promise((resolve, reject) => {
			const imgElm = new Image();
			imgElm.src = dataUri;
			imgElm.onload = () => {
				this.canvas.height = Math.floor(imgElm.height);
				this.canvas.width = Math.floor(imgElm.width);
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				// this.ctx.scale(scale, scale);
				this.ctx.drawImage(imgElm, 0, 0);
				const imageData = this.ctx.getImageData(0, 0, imgElm.width, imgElm.height);
				const u8a = imageData.data;
				const head = BinaryConverter.u8aToString(u8a.slice(0, 1));
				let defrateData = null;
				if (head === 'a') {
					defrateData = u8a.slice(4, u8a.length);
				}
				if (head === 'b') {
					defrateData = u8a.slice(3, u8a.length);
				}
				if (head === 'c') {
					defrateData = u8a.slice(2, u8a.length);
				}
				if (head === 'd') {
					defrateData = u8a.slice(1, u8a.length);
				}
				if (defrateData) {
					const ab = Deflater.inflate(defrateData);
					resolve(ab);
				} else {
					resolve(defrateData);
				}
			};
			imgElm.onerror = e => {
				console.log('失敗');
				console.error(e);
				reject(null);
			};
		});
	}
	getImageDataFromArrayBuffer(ab) {
		// console.time('resize getImageDataFromArrayBuffer');
		return new Promise((resolve, reject) => {
			let dataUri = BinaryConverter.arrayBuffer2DataURI(ab);
			ab = null;
			const img = new Image();
			img.src = dataUri;
			img.onload = () => {
				dataUri = null;
				const width = img.width;
				const height = img.height;
				this.canvas.width = width;
				this.canvas.height = height;
				this.ctx.drawImage(img, 0, 0);
				const imageData = this.ctx.getImageData(0, 0, width, height);
				resolve(imageData);
				// console.timeEnd('resize getImageDataFromArrayBuffer');
			};
			img.onerror = e => {
				reject(e);
			};
		});
	}
	getArrayBufferFromImageBitmapDataAsJpg(iamgeBitmapData, quority) {
		const option = {
			type: 'image/jpeg',
			quority: quority
		};
		return this.getArrayBufferFromImageBitmapData(iamgeBitmapData, option);
	}
	getArrayBufferFromImageBitmapDataAsPng(iamgeBitmapData) {
		return this.getArrayBufferFromImageBitmapData(iamgeBitmapData);
	}
	getArrayBufferFromImageBitmapData(iamgeBitmapData, option) {
		console.time('resize getArrayBufferFromImageBitmapData');
		this.canvas.width = Math.floor(iamgeBitmapData.width);
		this.canvas.height = Math.floor(iamgeBitmapData.height);
		let newPaperData = this.ctx.createImageData(iamgeBitmapData.width, iamgeBitmapData.height);
		const len = iamgeBitmapData.data.length;
		for (let i = 0; i < len; i++) {
			newPaperData.data[i] = iamgeBitmapData.data[i];
		}
		this.ctx.putImageData(newPaperData, 0, 0);
		let dataUri = option ? this.canvas.toDataURL(option.type, option.quority) : this.canvas.toDataURL();
		const abResized = BinaryConverter.dataURI2ArrayBuffer(dataUri);
		// console.log('iamgeBitmapData.data.length:'+iamgeBitmapData.data.length+'/w:'+iamgeBitmapData.width+'/h:'+iamgeBitmapData.height);
		// console.log('dataUri:'+dataUri);
		// console.log(abResized);
		newPaperData = undefined;
		console.timeEnd('resize getArrayBufferFromImageBitmapData');
		return abResized;
	}
	create(arrayBuffer, width, height, type) {
		return new Promise((resolve, reject) => {
			const imgElm = new Image();
			imgElm.src = BinaryConverter.arrayBuffer2DataURI(arrayBuffer, type);
			imgElm.onload = () => {
				const widthScale = width / imgElm.width;
				const heightScale = height / imgElm.height;
				const scale = widthScale <= heightScale ? widthScale : heightScale;
				this.canvas.height = Math.floor(imgElm.height * scale);
				this.canvas.width = Math.floor(imgElm.width * scale);
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.ctx.scale(scale, scale);
				this.ctx.drawImage(imgElm, 0, 0);
				resolve(this.exportPng());
			};
			imgElm.onerror = e => {
				console.log('失敗');
				console.error(e);
				reject(null);
			};
		});
	}
	exportPng() {
		return this.canvas.toDataURL();
	}
	exportJpeg(quority = 1.0) {
		return this.canvas.toDataURL('image/jpeg', quority);
	}

	createImageNodeByData(data) {
		return new Promise((resolve, reject) => {
			let { name, ab, type } = data;
			let imgElm = vu.createImage();
			imgElm.alt = escape(name);

			if (!type) {
				type = 'application/octet-stream';
			}
			if (type && type.match(imgRe)) {
				imgElm.src = bc.arrayBuffer2DataURI(ab, type);
				imgElm.onload = () => {
					data.height = imgElm.height;
					data.width = imgElm.width;
					resolve(imgElm);
				};
				imgElm.onerror = e => {
					console.log('失敗');
					console.error(e);
					reject(e);
				};
				return;
			} else {
				resolve(imgElm);
			}
		});
	}
}
