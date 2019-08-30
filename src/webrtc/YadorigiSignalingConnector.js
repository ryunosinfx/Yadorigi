import { Fetcher } from '../util/Fetcher';
import { IframeController } from '../view/util/IframeController';
import { ENDPOINT, BLANK_PAGE } from './YadorigiSettings';
export class YadorigiSignalingConnector {
	constructor(endPoint = ENDPOINT) {
		this.endPoint = endPoint;
		this.Fetcher = new Fetcher();
	}
	async putSpd(groupName, fileName, hash, svgData) {
		const data = { groupName, fileName, hash, svgData };
		const iframeController = new IframeController();
		iframeController.build(fileName, BLANK_PAGE);
		iframeController.submit(this.endPoint, data);
	}
	async getSpd() {
		this.Fetcher.getBlob();
	}
	async getSpdByName(fileName) {}
}
