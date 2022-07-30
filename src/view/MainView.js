import { ViewUtil } from './util/ViewUtil.js';
// import { Base64Util } from '../util/Base64Util.js';
import { BookMarkBuilder } from './util/BookMarkBuilder.js';
import { Logger } from '../util/Logger.js';
import { TestClass } from './test/TestClass.js';
import { TestClass2 } from './test/TestClass2.js';
import { TestClass3 } from './test/TestClass3.js';
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
		ViewUtil.add(frame, 'hr');
		ViewUtil.add(frame, 'h2', { text: 'Test Vanilla ICE' });
		const tc3 = new TestClass3();

		const row1 = ViewUtil.add(frame, 'div', {}, { margin: '10px' });
		ViewUtil.add(row1, 'h4', { text: 'offerSDP' });
		const col11 = ViewUtil.add(row1, 'div', {}, { margin: '10px' });
		const buttonMakeOffer = ViewUtil.add(col11, 'button', { text: 'MakeOffer' });

		const col12 = ViewUtil.add(row1, 'div', {}, { margin: '10px' });
		ViewUtil.setOnClick(buttonMakeOffer, async () => {
			col12.textContent = JSON.stringify(await tc3.makeOffer());
		});
		const row2 = ViewUtil.add(frame, 'div', {}, { margin: '10px' });
		ViewUtil.add(row2, 'h4', { text: 'answerSDP' });
		const col21 = ViewUtil.add(row2, 'div', {}, { margin: '10px' });
		const buttonMakeAnswer = ViewUtil.add(col21, 'button', { text: 'MakeAnswer' });
		const col22 = ViewUtil.add(row2, 'div', {}, { margin: '10px' });
		const textareaAns = ViewUtil.add(col22, 'textarea', { text: 'set offer' });
		const col23 = ViewUtil.add(row2, 'div', {}, { margin: '10px' });
		const row3 = ViewUtil.add(frame, 'div', {}, { margin: '10px' });
		ViewUtil.add(row3, 'h4', { text: 'connect' });
		const col30 = ViewUtil.add(row3, 'div', {}, { margin: '10px' });
		const buttonCoonect = ViewUtil.add(col30, 'button', { text: 'Connect' });
		const col301 = ViewUtil.add(row3, 'div', {}, { margin: '10px' });
		const textareaCoonect = ViewUtil.add(col301, 'textarea', { text: 'set answer' });
		const col303 = ViewUtil.add(row3, 'div', {}, { margin: '10px' });
		const col32 = ViewUtil.add(row3, 'div', {}, { margin: '10px' });
		const col31 = ViewUtil.add(row3, 'div', {}, { margin: '10px' });
		const buttonSetCandidates = ViewUtil.add(col31, 'button', { text: 'setCandidates' });
		const col33 = ViewUtil.add(row3, 'div', {}, { margin: '10px' });
		const textareaCandidates = ViewUtil.add(col33, 'textarea', { text: 'set candidates' });

		ViewUtil.setOnClick(buttonMakeAnswer, async () => {
			col23.textContent = JSON.stringify(await tc3.makeAnswer(textareaAns.value));
			tc3.setOnCandidates(col32);
		});
		ViewUtil.setOnClick(buttonCoonect, async () => {
			col303.textContent = JSON.stringify(await tc3.connect(textareaCoonect.value));
			tc3.setOnCandidates(col32);
		});
		ViewUtil.setOnClick(buttonSetCandidates, async () => {
			col303.textContent = JSON.stringify(await tc3.setCandidates(textareaCandidates.value));
		});
		const row4 = ViewUtil.add(frame, 'div', {}, { margin: '10px' });
		ViewUtil.add(row4, 'h4', { text: 'send' });
		const col41 = ViewUtil.add(row4, 'div', {}, { margin: '10px' });
		const buttonSend = ViewUtil.add(col41, 'button', { text: 'send' });
		const col42 = ViewUtil.add(row4, 'div', {}, { margin: '10px' });
		const textareaMsg = ViewUtil.add(col42, 'textarea', { text: 'set msg' });
		ViewUtil.setOnClick(buttonSend, async () => {
			await tc3.sendMessage(textareaMsg.value);
		});
		const col44 = ViewUtil.add(row4, 'div', {}, { margin: '10px' });
		col44.textContent = '--NO-MSG--';
		tc3.setOnMessage(col44);

		ViewUtil.add(frame, 'hr');
		ViewUtil.add(frame, 'h2', { text: 'Test Auto Hand Shake' });
		const button = ViewUtil.add(frame, 'button', { text: 'test1x' });
		ViewUtil.add(frame, 'hr');
		ViewUtil.add(frame, 'h2', { text: 'Test Auto Hand Shake' });
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
				console.log('test2!!NO Hash!');
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
