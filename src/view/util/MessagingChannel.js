import { IframeController } from './IframeController.js';
// const MessagingQueue = [];
const funcs = [];
const targetWindows = [];
export class MessagingChannel {
	constructor(onMessageCallBack, url) {
		const now = Date.now();
		if (window !== window.parent) {
			this.window = window.parent;
			this.targetOrigin = '*';
		} else {
			this.iframe = new IframeController();
			const parser = new URL(url);
			this.iframe.build(now, url);
			this.window = this.iframe.getWindow();
			this.targetOrigin = parser.origin;
		}
		this.setUp(onMessageCallBack, this.window);
	}
	setUp(onMessageCallBack, targetWindow) {
		if (!targetWindows.includes(targetWindow)) {
			targetWindows.push(targetWindow);
		}
		if (funcs.includes(onMessageCallBack)) {
			return;
		}
		window.addEventListener(
			'message',
			(event) => {
				const msg = event.data;
				onMessageCallBack(msg);
			},
			false
		);
		funcs.push(onMessageCallBack);
	}
	send(message, targetWindow) {
		targetWindow.postMessage(message, this.targetOrigin);
	}
}
