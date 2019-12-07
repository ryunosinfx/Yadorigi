import { ViewUtil } from './util/ViewUtil';
import { TestClass } from './test/TestClass';
export class MainView {
	constructor(service) {
		this.service = service;
	}
	async build() {
		const frame = ViewUtil.add(null, 'div', {}, { margin: '10px' });
		ViewUtil.add(frame, 'h1', { text: 'Yadorigi' });
		const button = ViewUtil.add(frame, 'button', { text: 'test1' });
		const text = ViewUtil.add(frame, 'textarea', { text: 'Yadorigi' });
		ViewUtil.setOnClick(button, this.getTest1CallBack());
		console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa');
		console.log('BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB');
		const body = document.getElementsByTagName('body')[0];
		body.appendChild(frame);
	}
	getTest1CallBack() {
		return async () => {
			await TestClass.Test1();
		};
	}
}
