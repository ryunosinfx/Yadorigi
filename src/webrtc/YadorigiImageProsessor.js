import { Hasher } from '../util/Hasher';
import { Base64Util } from '../util/Base64Util';
import { SvgProcessor } from '../view/util/SvgProcessor';
import { TimeUtil } from '../util/TimeUtil';
import { ImageProcessor } from '../view/util/ImageProcessor';
import { YadorigiSdpFileRecord } from './YadorigiSdpFileRecord';
const pngHeader = 'data:image/png;base64,';
export class YadorigiImageProsessor {
	constructor() {
		this.imageProcessor = new ImageProcessor();
	}
	async build(imageList, senderDeviceName, sdp, expireOffset, userId, groupName) {
		const payload = { senderDeviceName, sdp, expireOffset, userId, groupName };
		const imageDataUrl = await this.imageProcessor.makeAbAsPng(payload);
		const hash = Base64Util.ab2Base64Url(Hasher.sha512(imageDataUrl));
		const fileName = this.createFileName(groupName, userId, senderDeviceName);
		const selfImage = new YadorigiSdpFileRecord(fileName, hash, YadorigiSdpFileRecord.getCurrentExpireDate());
		const imageListJsonString = JSON.stringify(this.maintainImageList(imageList, selfImage));
		const svgSeeds = [
			'<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200>',
			`<defs> <text id="list">${imageListJsonString}</text></defs>`,
			'<defs> <rect id="box" x="1" y="0" width="1" height="1"></rect></defs>',
			`<image id="sdp" width="1" height="1" href="${imageDataUrl}" ></image>`,
			'</svg>'
		];
		const svg = svgSeeds.jpoin();
		return svg;
	}
	maintainImageList(imageList, selfImage) {
		const currentList = imageList && Array.isArray(imageList) ? imageList : [];
		const newList = [selfImage.toObj()];
		newList.push(selfImage);
		for (let row of currentList) {
			//画像ファイル名、画像ハッシュ、有効期限
			const ysdp = new YadorigiSdpFileRecord(row);
			if (ysdp.isExpired()) {
				continue;
			}
			newList.unshift(ysdp.toObj());
		}
		return newList;
	}
	parse(svgData) {
		const svgProcessor = new SvgProcessor(svgData);
		const imfList = svgProcessor.getById('list');
		const sdp = svgProcessor.getById('sdp');
		return { imfList, sdp };
	}
	//ユーザーIDのハッシュとデバイス名ハッシュをキー
	createFileName(groupName, userId, senderDeviceName) {
		//512 25612864
		const userIdHash = Base64Util.ab2Base64Url(Hasher.sha512(userId)); //64
		const groupNameHash = Base64Util.ab2Base64Url(Hasher.sha512(groupName)); //64
		const senderDeviceNameHash = Base64Util.ab2Base64Url(Hasher.sha512(senderDeviceName)); //64
		const fileName = groupNameHash + '.' + userIdHash + '.' + senderDeviceNameHash + '.' + TimeUtil.getNowUnixtime() + '.svg';
		return fileName;
	}
}
