import { ViewUtil } from './util/ViewUtil';
import { BookMarkBuilder } from './util/BookMarkBuilder';
import { TestClass } from './test/TestClass';
import { MultiBrowsersConnectionTestView } from './MultiBrowsersConnectionTestView';
export class MainView {
	constructor(service) {
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
		const button = ViewUtil.add(frame, 'button', { text: 'test1' });
		const textarea = ViewUtil.add(col2, 'textarea', { text: 'alert("Yadorigi")' });
		const callback = this.getConvertBookmarkletCallback(ancker);
		ViewUtil.setOnInput(textarea, callback);
		callback({ target: textarea });
		ViewUtil.setOnClick(button, this.getTest1CallBack());
		console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa');
		console.log('BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB');
		const body = document.getElementsByTagName('body')[0];
		body.appendChild(frame);
		this.MultiBrowsersConnectionTestView.build();
	}
	getTest1CallBack() {
		return async () => {
			await TestClass.Test1();
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
