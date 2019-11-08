import { ViewUtil } from './util/ViewUtil';
import { TestClass } from './test/TestClass';
export class MainView {
	constructor() {}
	async build() {
		const frame = ViewUtil.add(null, 'div', {}, { margin: '10px' });
		ViewUtil.add(frame, 'h1', { text: 'Yadorigi' });
		const text = ViewUtil.add(frame, 'textarea', { text: 'Yadorigi' });
		console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa');
		await TestClass.Test1();
		console.log('BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB');
		const body = document.getElementsByTagName('body')[0];
		body.appendChild(frame);
	}
}
