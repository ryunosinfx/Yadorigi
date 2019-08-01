const parser = new DOMParser();
export class SvgProcessor {
	constructor(svgData) {
		this.svgData = svgData;
		this.svgDoc = parser.parseFromString(svgData, 'image/svg+xml');
		if (this.svgDoc.getElementsByTagName('parsererror').length > 0) {
			this.svgDoc = null;
			throw svgData;
		}
	}
	getById(id) {
		const target = this.svgDoc ? this.svgDoc.getElementById(id) : null;
	}
}
