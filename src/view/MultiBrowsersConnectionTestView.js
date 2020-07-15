import { ViewUtil, h1, h2, div, hr, SPAN, A, BUTTON, TEXTAREA, INPUT } from './util/ViewUtil';
import { BookMarkBuilder } from './util/BookMarkBuilder';
import { MultiBrowsersConnectionTestService } from './service/MultiBrowsersConnectionTestService';
import { TestClass } from './test/TestClass';
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

		const button = v.add(frame, BUTTON, { text: 'test1' });
		const cel1a = v.add(col2, div, {}, { margin: '10px' });
		v.add(cel1a, SPAN, { text: 'serverUrl:' });
		const serverUrl = v.add(cel1a, INPUT, { value: 'https://script.google.com/macros/s/AKfycbyEIu-LGf6EuywyQnEq41Tf21tU0iB3DCDkPBygQkukJEVe3Zo/exec' });
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
		const col1 = v.add(row, div, {}, { margin: '10px' });
		v.setOnClick(button, this.getTest1CallBack({ serverUrl, groupId, userId, pass, deviceName, targetDeviceName }, textareaIn, textareaOut));
		body.appendChild(frame);
	}
	getTest1CallBack(dataInputs, textareaIn, textareaOut) {
		return async () => {
			const data = {};
			for (let key in dataInputs) {
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
			alert('aaaa' + JSON.stringify(data));
		};
	}
	getConvertBookmarkletCallback(ancker) {
		return async (event) => {};
	}
	setSendEventListener(elm) {
		elm.addEventListener('input', (event) => {
			const data = event.target.value;
			MultiBrowsersConnectionTestService.send(data);
		});
	}
	send(event) {
		MultiBrowsersConnectionTestService.send(data);
	}
	getCallBack(elm, key = '') {
		return (event) => {
			console.log(event);
			elm.value = elm.value + '\n' + event;
		};
	}
}
