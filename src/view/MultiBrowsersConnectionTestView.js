import { ViewUtil, div, hr, SPAN, BUTTON, TEXTAREA, INPUT } from './util/ViewUtil';
// import { BookMarkBuilder } from './util/BookMarkBuilder';
import { MultiBrowsersConnectionTestService } from './service/MultiBrowsersConnectionTestService';
import { TestClass2 } from './test/TestClass2';
import { SERVER_URL } from './test/TEST_SETTING.js';
// import { TestClass } from './test/TestClass';
const v = ViewUtil;
export class MultiBrowsersConnectionTestView {
	constructor(service) {
		this.service = service;
	}
	async build(body = document.getElementsByTagName('body')[0]) {
		const frame = v.add(null, div, {}, { margin: '10px' });
		v.add(frame, hr, { text: 'TEST2' });
		const row = v.add(frame, div, {}, { margin: '10px' });
		const col2 = v.add(row, div, {}, { margin: '10px' });

		const button = v.add(frame, BUTTON, { text: 'test1a' });
		const button2 = v.add(frame, BUTTON, { text: 'test2a' });
		const cel1a = v.add(col2, div, {}, { margin: '10px' });
		v.add(cel1a, SPAN, { text: 'serverUrl:' });
		const serverUrl = v.add(cel1a, INPUT, { value: SERVER_URL });
		const cel1 = v.add(col2, div, {}, { margin: '10px' });
		v.add(cel1, SPAN, { text: 'groupId:' });
		const groupId = v.add(cel1, INPUT, { value: 'a1' });
		const cel2 = v.add(col2, div, {}, { margin: '10px' });
		v.add(cel2, SPAN, { text: 'deviceName:' });
		const deviceName = v.add(cel2, INPUT, { value: 'device1' });
		const cel2a = v.add(col2, div, {}, { margin: '10px' });
		v.add(cel2a, SPAN, { text: 'userId:' });
		const userId = v.add(cel2a, INPUT, { value: 'alert("Yadorigi")' });
		const cel3 = v.add(col2, div, {}, { margin: '10px' });
		v.add(cel3, SPAN, { text: 'pass:' });
		const pass = v.add(cel3, INPUT, { value: 'alert("Yadorigi")' });
		const cel2b = v.add(col2, div, {}, { margin: '10px' });
		v.add(cel2b, SPAN, { text: 'targetDeviceName:' });
		const targetDeviceName = v.add(cel2b, INPUT, { value: 'device2' });
		const cel4 = v.add(col2, div, {}, { margin: '10px' });
		v.add(cel4, SPAN, { text: 'input' });
		const textareaIn = v.add(cel4, TEXTAREA, { text: 'alert("Yadorigi")' });
		const cel5 = v.add(col2, div, {}, { margin: '10px' });
		v.add(cel5, SPAN, { text: 'output' });
		const textareaOut = v.add(cel5, TEXTAREA, { text: 'alert("Yadorigi")' });
		// const col1 = v.add(row, div, {}, { margin: '10px' });
		v.setOnClick(button, this.getTest1CallBack({ serverUrl, groupId, userId, pass, deviceName, targetDeviceName }, textareaIn, textareaOut));
		v.setOnClick(button2, this.getTest2CallBack({ serverUrl, groupId, userId, pass, deviceName, targetDeviceName }, textareaIn, textareaOut));
		body.appendChild(frame);
	}
	getTest1CallBack(dataInputs, textareaIn, textareaOut) {
		return async () => {
			const data = {};
			for (const key in dataInputs) {
				const elm = dataInputs[key];
				data[key] = elm.value;
			}
			const callback = this.getCallBack(textareaOut);

			data.onOpenCallBack = callback;
			data.onCloseCallBack = callback;
			data.onMessageCallBack = callback;
			data.onErrorCallBack = callback;
			this.setSendEventListener(textareaIn);
			MultiBrowsersConnectionTestService.connect(data);
			// alert('aaaa' + JSON.stringify(data));
		};
	}
	getTest2CallBack() {
		return async () => {
			const hash = location.hash;
			alert(`test2!!${hash}`);
			if (hash) {
				TestClass2.TestCall();
			}
		};
	}
	getConvertBookmarkletCallback(ancker) {
		console.log(ancker);
		return async (event) => {
			console.log(event);
		};
	}
	setSendEventListener(elm) {
		elm.addEventListener('input', (event) => {
			const data = event.target.value;
			MultiBrowsersConnectionTestService.send(data);
		});
	}
	send(event) {
		MultiBrowsersConnectionTestService.send(event);
	}
	getCallBack(elm, key = '') {
		return (event) => {
			console.log(`event + ' ' + ${key}`);
			elm.value = `${elm.value}+ '\n' + ${event}`;
		};
	}
}
