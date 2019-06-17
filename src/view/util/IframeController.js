export class IframeController {
	constructor() {
		this.iframe = null;
	}
	build(src, method = 'get') {
		const iframe = document.createElement('iframe');
	}
	getWin() {
		if (this.iframe) {
			return this.iframe.contentWindow;
		}
		return null;
	}
	getDoc() {
		const win = this.getWin();
		if (win) {
			return win.document;
		}
		return null;
	}
}
