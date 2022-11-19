import { ESTester } from './ESTester.js';
const testAPIc = 'https://script.google.com/macros/s/AKfycbywvRIWYhDkchpE7DFY0BsBolI5x-wsxXxGpe2RpQ1qbiOQczZggGnTNrpc9wVSbSHN/exec';
export class ESMainView {
	constructor() {
		this.hash = location.hash;
	}
	async build() {
		const frame = ViewUtil.add(null, 'div', {}, { margin: '10px' });
		const body = document.getElementsByTagName('body')[0];
		body.appendChild(frame);

		//----------------------------------------------------------------------------------------
		ViewUtil.add(frame, 'hr');
		ViewUtil.add(frame, 'h2', { text: 'Test Auto Vanilla ICE in Browser Tabse By ServerC' });
		const form = ViewUtil.add(frame, 'form', { action: './', method: 'GET', onsubmit: 'return false;' });
		const rowCurl = ViewUtil.add(form, 'div', {}, { margin: '10px' });
		////URL
		const colCurl01 = ViewUtil.add(rowCurl, 'div', {}, { margin: '1px' });
		ViewUtil.add(colCurl01, 'h4', { text: 'ServerC(Cache) GAS App URL ' }, { margin: '5px 0px 2px 0px' });
		const colCurl02 = ViewUtil.add(rowCurl, 'div', {}, { margin: '1px' });
		const inputCurl = ViewUtil.add(colCurl02, 'input', { name: 'inputUrl' }, { margin: '5px', width: '90vw' });
		inputCurl.value = testAPIc;
		////GROUP
		const colCgroup01 = ViewUtil.add(rowCurl, 'div', {}, { margin: '1px' });
		ViewUtil.add(colCgroup01, 'h4', { text: 'Group' }, { margin: '5px 0px 2px 0px' });
		const colCgroup02 = ViewUtil.add(rowCurl, 'div', {}, { margin: '1px' });
		const inputCgroup = ViewUtil.add(colCgroup02, 'input', { name: 'inputGroup' }, { margin: '5px', width: '80vw' });
		inputCgroup.value = Math.floor(Date.now() / 1000); //Group
		////DEVICENAME
		const colCdevice01 = ViewUtil.add(rowCurl, 'div', {}, { margin: '1px' });
		ViewUtil.add(colCdevice01, 'h4', { text: 'DeviceName' }, { margin: '5px 0px 2px 0px' });
		const colCdevice02 = ViewUtil.add(rowCurl, 'div', {}, { margin: '1px' });
		const inputCdevice = ViewUtil.add(colCdevice02, 'input', { name: 'inputDeviceName' }, { margin: '5px', width: '80vw' });
		// inputCdevice.value = Math.floor(Date.now() / 1000); //Group
		////Passwd
		const colCpasswd01 = ViewUtil.add(rowCurl, 'div', {}, { margin: '1px' });
		ViewUtil.add(colCpasswd01, 'h4', { text: 'Passwd' }, { margin: '5px 0px 2px 0px' });
		const colCpasswd02 = ViewUtil.add(rowCurl, 'div', {}, { margin: '1px' });
		const inputCpasswd = ViewUtil.add(colCpasswd02, 'input', { type: 'password', name: 'inputCpasswd' }, { margin: '5px', width: '80vw' });
		// inputCgroup.value = Math.floor(Date.now() / 1000); //Group
		const rowC = ViewUtil.add(form, 'div', {}, { margin: '10px' });
		ViewUtil.add(rowC, 'h4', { text: 'start' }, { margin: '5px 0px 2px 0px' });
		const colC1 = ViewUtil.add(rowC, 'div', {}, { margin: '10px' });
		const buttonICEWithSameBrowserTabsDNewWindows = ViewUtil.add(colC1, 'button', { text: 'openNewWindow' }, { margin: '1px' });
		const buttonICEWithSameBrowserTabsDSTART = ViewUtil.add(
			colC1,
			'button',
			{ text: 'testAutoSTART' },
			{ margin: '1px', padding: '2px', border: '#000 solid 1px', 'border-radius': '3px', cursor: 'pointer' }
		);
		const buttonICEWithSameBrowserTabsDSTOP = ViewUtil.add(colC1, 'button', { text: 'testSTOP' }, { margin: '1px' });
		const buttonICEWithSameBrowserTabsDCLEAR = ViewUtil.add(colC1, 'button', { text: 'testCLEAR' }, { margin: '1px' });
		const buttonICEWithSameBrowserTabsDCLOSE = ViewUtil.add(colC1, 'button', { text: 'testClose' }, { margin: '1px' });
		const statusSTART = ViewUtil.add(colC1, 'span', { text: '-stop-' }, { margin: '1px', fontSize: '120%' });
		const statusConn = ViewUtil.add(colC1, 'span', { text: '-close-' }, { margin: '1px', fontSize: '60%' });
		const rowD = ViewUtil.add(frame, 'div', {}, { margin: '10px' });
		const colClog = ViewUtil.add(rowD, 'div', {}, { margin: '12px', whiteSpace: 'pre', fontSize: '60%' });
		const est = new ESTester(colClog, inputCurl, inputCgroup, inputCpasswd, inputCdevice, statusConn);
		const colC3 = ViewUtil.add(rowD, 'div', {}, { margin: '12px', fontSize: '60%' });

		ViewUtil.setOnClick(buttonICEWithSameBrowserTabsDNewWindows, async () => {
			est.openNewWindow();
		});
		ViewUtil.setOnClick(buttonICEWithSameBrowserTabsDSTART, async () => {
			statusSTART.textContent = '-START-';
			form.submit();
		});
		ViewUtil.setEventHandler(form, 'submit', () => {
			est.start();
			return false;
		});
		ViewUtil.setOnClick(buttonICEWithSameBrowserTabsDSTOP, async () => {
			statusSTART.textContent = '-STOP-';
			est.stop();
		});
		ViewUtil.setOnClick(buttonICEWithSameBrowserTabsDCLEAR, async () => {
			est.clear();
		});
		ViewUtil.setOnClick(buttonICEWithSameBrowserTabsDCLOSE, async () => {
			statusConn.textContent = '-STOP-';
			est.close();
		});
		const textareaT6 = ViewUtil.add(colC3, 'textarea', { text: '' });
		ViewUtil.setOnInput(textareaT6, () => {
			est.broadcastMessage(textareaT6.value);
		});
	}
}
window.onload = (event) => {
	console.log(`page is fully loaded event:${event}`);
	new ESMainView().build();
};
export class TextUtil {
	static convertGebavToCamel(target = '') {
		if (target) {
			const words = target.split('-');
			for (let i = 1, len = words.length; i < len; i++) {
				const word = words[i];
				const wl = word.length;
				words[i] = wl > 0 ? word.substring(0, 1).toUpperCase() : `${wl}` > 1 ? word.substring(1) : '';
			}
			return words.join('');
		} else {
			return target;
		}
	}
}
const DIV = 'div';
export class ViewUtil {
	static addHiddenDiv(parent, attrs = {}) {
		return ViewUtil.add(parent, DIV, attrs, { display: 'none' });
	}
	static add(parent, tagName, attrs = {}, styles = {}) {
		const elm = document.createElement(tagName);
		for (const key in attrs) {
			if (key === 'text') {
				continue;
			}
			const value = attrs[key];
			elm.setAttribute(key, value);
		}
		if (attrs.text) {
			ViewUtil.text(elm, attrs.text);
		}
		ViewUtil.setStyles(elm, styles);
		if (parent) {
			parent.appendChild(elm);
		}
		return elm;
	}
	static remove(elm) {
		if (elm.parentNode) {
			elm.parentNode.removeChild(elm);
		}
	}
	static setStyles(elm, styles = {}) {
		for (const key in styles) {
			const value = styles[key];
			const styleKey = TextUtil.convertGebavToCamel(key);
			elm.style[styleKey] = value;
		}
	}
	static setOnClick(elm, callback) {
		return ViewUtil.setEventHandler(elm, 'click', callback);
	}
	static setOnChange(elm, callback) {
		return ViewUtil.setEventHandler(elm, 'change', callback);
	}
	static setOnInput(elm, callback) {
		return ViewUtil.setEventHandler(elm, 'input', callback);
	}
	static setEventHandler(elm, eventName, callback) {
		elm.addEventListener(eventName, callback);
		return callback;
	}
	static text(elm, newOne) {
		if (newOne) {
			elm.textContent = newOne;
		} else {
			return elm.textContent;
		}
	}
	static addClass(elm, className) {
		elm.classList.add(className);
	}
	static removeClass(elm, className) {
		elm.classList.remove(className);
	}
	static toggleClass(elm, className) {
		elm.classList.toggle(className);
	}
	static getBodyElm() {
		return document.getElementsByTagName('body')[0];
	}
}

export const h1 = 'h1';
export const h2 = 'h2';
export const h3 = 'h3';
export const h4 = 'h4';
export const h5 = 'h5';
export const h6 = 'h6';
export const SPAN = 'span';
export const div = 'div';
export const p = 'p';
export const hr = 'hr';
export const ul = 'ul';
export const li = 'li';
export const A = 'a';
export const BUTTON = 'button';
export const TEXTAREA = 'textarea';
export const INPUT = 'input';
