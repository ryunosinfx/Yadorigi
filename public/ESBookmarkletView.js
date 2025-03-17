import { BK } from './BookmarkletTest.js';
import { Vw } from './Vw.js';
export class ESBookmarkletView {
	constructor() {
		this.hash = location.hash;
	}
	async build() {
		const frame = Vw.add(null, 'div', {}, { margin: '10px' });
		const body = document.getElementsByTagName('body')[0];
		body.appendChild(frame);

		//----------------------------------------------------------------------------------------
		Vw.add(frame, 'hr');
		Vw.add(frame, 'h2', { text: 'Test as View' });
		const form = Vw.add(frame, 'form', { action: './', method: 'GET', onsubmit: 'return false;' });
		const rowCurl = Vw.add(form, 'div', {}, { margin: '10px' });
		////URL
		const colCurlA01 = Vw.add(rowCurl, 'div', {}, { margin: '1px' });
		Vw.add(colCurlA01, 'h4', { text: 'BookMarklet' }, { margin: '5px 0px 2px 0px' });
		BK.build(colCurlA01);
	}
}
window.onload = () => {
	new ESBookmarkletView().build();
};
