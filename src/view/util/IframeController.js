import { ViewUtil } from './ViewUtil';
const SUBMIT_TIMEOUT = 10000;
export class IframeController {
	constructor() {
		this.iframe = null;
	}
	build(id, src, height = 0, width = 0) {
		const iframe = document.createElement('iframe');
		iframe.setAttribute('id', id);
		iframe.setAttribute('src', src);
		iframe.setAttribute('height', height);
		iframe.setAttribute('width', width);
		this.iframe = iframe;
	}
	submit(action, dataMap, method = 'POST', target = '_self') {
		const doc = this.getDoc();
		if (!doc) {
			return null;
		}
		const body = ViewUtil.getBodyElm();
		const form = ViewUtil.add(body, 'form', { action, method, target });
		for (let name in dataMap) {
			const value = dataMap[name];
			ViewUtil.add(form, 'input', { type: 'hidden', value, name });
		}
		form.submit();
		setTimeout(() => {
			this.close();
		}, SUBMIT_TIMEOUT);
	}
	close() {
		if (this.iframe) {
			ViewUtil.remove(this.iframe);
			this.iframe = null;
		}
	}
	getWindow() {
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
	getDocOnLoad() {
		return new Promise(resolve => {
			const win = this.getWin();
			if (win) {
				win.onload = () => {
					resolve(win.document);
				};
			}
			resolve(null);
		});
	}
}
