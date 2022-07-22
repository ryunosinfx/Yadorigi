import { ViewUtil } from './util/ViewUtil.js';
// import { Base64Util } from '../util/Base64Util.js';
import { BookMarkBuilder } from './util/BookMarkBuilder.js';
import { Logger } from '../util/Logger.js';
import { TestClass } from './test/TestClass.js';
import { TestClass2 } from './test/TestClass2.js';
import { MultiBrowsersConnectionTestView } from './MultiBrowsersConnectionTestView.js';
import { SERVER_URL } from './test/TEST_SETTING.js';
const testAPI = SERVER_URL;
export class MainView {
	constructor(service) {
		this.hash = location.hash;
		this.service = service;
		this.MultiBrowsersConnectionTestView = new MultiBrowsersConnectionTestView(service);
	}
	async build() {
		const frame = ViewUtil.add(null, 'div', {}, { margin: '10px' });
		ViewUtil.add(frame, 'h1', { text: 'Yadorigi' });
		const row = ViewUtil.add(frame, 'div', {}, { margin: '10px' });
		const col1 = ViewUtil.add(row, 'div', {}, { margin: '10px' });
		const col2 = ViewUtil.add(row, 'div', {}, { margin: '10px' });

		const ancker = ViewUtil.add(col1, 'a', { text: 'Yadorigi Bookmarklet! bookmark me!' });
		const button = ViewUtil.add(frame, 'button', { text: 'test1x' });
		const textarea = ViewUtil.add(col2, 'textarea', { text: 'alert("Yadorigi")' });
		const callback = this.getConvertBookmarkletCallback(ancker);
		ViewUtil.setOnInput(textarea, callback);
		callback({ target: textarea });
		ViewUtil.setOnClick(button, this.getTest1CallBack());
		this.input = ViewUtil.add(frame, 'input', {}, { margin: '10px' });
		this.input.value = testAPI;
		const button2 = ViewUtil.add(frame, 'button', { text: 'test2x' });
		const logArea = ViewUtil.add(frame, 'div', { text: '' });
		const logger = new Logger(logArea);
		ViewUtil.setOnClick(button2, this.getTest2CallBack(logger));
		console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaa');
		console.log('BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB');
		const body = document.getElementsByTagName('body')[0];
		body.appendChild(frame);
		this.MultiBrowsersConnectionTestView.build();
		const func = this.getTest2CallBackU(logger);
		setTimeout(() => {
			func();
		}, 100);
	}
	getTest1CallBack() {
		return async () => {
			await TestClass.Test1();
		};
	}
	getTest2CallBack(logger) {
		return async () => {
			location.hash = '';
			const url = this.input.value;
			alert(`test2!!url:${url}`);
			TestClass2.openAnotherWindow(url);
			await TestClass2.Test2(url, logger);
		};
	}
	getTest2CallBackU(logger) {
		return async () => {
			const hash = location.hash;
			if (!hash) {
				alert('test2!!NO Hash!');
				return;
			}
			TestClass2.callFromHash(hash.replace('#', ''), logger);
		};
	}
	getConvertBookmarkletCallback(ancker) {
		return async (event) => {
			const textArea = event.target;
			const bookmarklet = BookMarkBuilder.build(textArea.value);
			console.log(bookmarklet);
			ancker.setAttribute('href', bookmarklet);
		};
	}
}
