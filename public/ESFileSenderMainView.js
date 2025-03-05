import { ESFileSender } from './ESFileSender.js';
// const testAPIc =
// 	'https://script.google.com/macros/s/AKfycbywvRIWYhDkchpE7DFY0BsBolI5x-wsxXxGpe2RpQ1qbiOQczZggGnTNrpc9wVSbSHN/exec';
const testAPIc =
	'http://localhost:8087/macros/s/AKfycbywvRIWYhDkchpE7DFY0BsBolI5x-wsxXxGpe2RpQ1qbiOQczZggGnTNrpc9wVSbSHN/exec';
const names = [
	'PONTA',
	'PONKICHI',
	'PONSUKE',
	'PONJIRO',
	'PONKO',
	'PONMI',
	'PONPON',
	'PONKEI',
	'PONSHIROU',
	'PONPOKO',
	'PONYA',
	'PONKA',
	'PONMURA',
	'PONGAMI',
	'PONBARA',
	'PONNAKA',
	'PONCHAN',
	'PONSAMA',
	'PONYAROU',
	'PONZAWA',
	'PONYAMA',
	'PONKAWA',
	'PONROU',
	'PONNOMIYA',
	'PONAKI',
	'PONHIRO',
	'PONMASA',
	'PONJI',
	'PONKAGA',
	'PONNOSE',
	'PONGAWARA',
	'PONGI',
	'PONNOKI',
	'PONJOU',
	'PONJIMA',
	'PONGASHIRA',
	'PONNOJOU',
	'PONSUGI',
	'PONNOIN',
	'PONBAYASHI',
	'PNMORI',
	'PONTANI',
	'PONBUCHI',
	'PONNAMI',
	'PONZATO',
	'PONMATSU',
	'PONROGI',
	'PONZAKI',
	'PONNO',
	'PONDA',
	'PONNOJI',
	'PONMAKI',
	'PONGAHAMA',
	'PONDO',
	'PONNOGI',
];
export class ESMainView {
	constructor() {
		this.hash = location.hash;
		this.status = {};
	}
	async build() {
		const frame = ViewUtil.add(null, 'div', {}, { margin: '10px' });
		const body = document.getElementsByTagName('body')[0];
		body.appendChild(frame);

		//----------------------------------------------------------------------------------------
		ViewUtil.add(frame, 'hr');
		ViewUtil.add(frame, 'h2', { text: 'FileSender Test Auto Vanilla ICE in Browser Tabse By ServerC' });
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
		const inputCgroup = ViewUtil.add(
			colCgroup02,
			'input',
			{ name: 'inputGroup' },
			{ margin: '5px', width: '80vw' }
		);
		inputCgroup.value = Math.floor(Date.now() / 1000); //Group
		////DEVICENAME
		const colCdevice01 = ViewUtil.add(rowCurl, 'div', {}, { margin: '1px' });
		ViewUtil.add(colCdevice01, 'h4', { text: 'DeviceName' }, { margin: '5px 0px 2px 0px' });
		const colCdevice02 = ViewUtil.add(rowCurl, 'div', {}, { margin: '1px' });
		const inputCdevice = ViewUtil.add(
			colCdevice02,
			'input',
			{ name: 'inputDeviceName' },
			{ margin: '5px', width: '80vw' }
		);
		// inputCdevice.value = Math.floor(Date.now() / 1000); //Group
		////Passwd
		const colCpasswd01 = ViewUtil.add(rowCurl, 'div', {}, { margin: '1px' });
		ViewUtil.add(colCpasswd01, 'h4', { text: 'Passwd' }, { margin: '5px 0px 2px 0px' });
		const colCpasswd02 = ViewUtil.add(rowCurl, 'div', {}, { margin: '1px' });
		const inputCpasswd = ViewUtil.add(
			colCpasswd02,
			'input',
			{ type: 'password', name: 'inputCpasswd' },
			{ margin: '5px', width: '80vw' }
		);
		// file
		const colCfile01 = ViewUtil.add(rowCurl, 'div', {}, { margin: '1px' });
		ViewUtil.add(colCfile01, 'h4', { text: 'FileUpload' }, { margin: '5px 0px 2px 0px' });
		const colCfile02 = ViewUtil.add(rowCurl, 'div', {}, { margin: '1px' });
		const inputCfile = ViewUtil.add(
			colCfile02,
			'input',
			{ type: 'file', name: 'inputCfile' },
			{ margin: '5px', width: '80vw' }
		);
		const colCfile03 = ViewUtil.add(rowCurl, 'div', {}, { margin: '1px' });
		// inputCgroup.value = Math.floor(Date.now() / 1000); //Group
		const rowC = ViewUtil.add(form, 'div', {}, { margin: '10px' });
		ViewUtil.add(rowC, 'h4', { text: 'start' }, { margin: '5px 0px 2px 0px' });
		const colC1 = ViewUtil.add(rowC, 'div', {}, { margin: '10px' });
		const buttonICEWithSameBrowserTabsDNewWindows = ViewUtil.add(
			colC1,
			'button',
			{ text: 'openNewWindow' },
			{ margin: '1px' }
		);
		const buttonICEWithSameBrowserTabsDSTART = ViewUtil.add(
			colC1,
			'button',
			{ text: 'testAutoSTART' },
			{ margin: '1px', padding: '2px', border: '#000 solid 1px', 'border-radius': '3px', cursor: 'pointer' }
		);
		const buttonICEWithSameBrowserTabsDSTOP = ViewUtil.add(
			colC1,
			'button',
			{ text: 'testSTOP' },
			{ margin: '1px' }
		);
		const buttonICEWithSameBrowserTabsDCLEAR = ViewUtil.add(
			colC1,
			'button',
			{ text: 'testCLEAR' },
			{ margin: '1px' }
		);
		const buttonICEWithSameBrowserTabsDCLOSE = ViewUtil.add(
			colC1,
			'button',
			{ text: 'testClose' },
			{ margin: '1px' }
		);
		const statusSTART = ViewUtil.add(colC1, 'span', { text: '-stop-' }, { margin: '1px', fontSize: '120%' });
		const statusConn = ViewUtil.add(colC1, 'span', { text: '-close-' }, { margin: '1px', fontSize: '60%' });
		const rowD = ViewUtil.add(frame, 'div', {}, { margin: '10px' });
		const colClog = ViewUtil.add(
			rowD,
			'div',
			{},
			{ margin: '12px', whiteSpace: 'pre', fontSize: '60%', maxHeight: '60vh', overflow: 'scroll' }
		);
		const vc = new ViewCommander(
			colClog,
			inputCurl,
			inputCgroup,
			inputCpasswd,
			inputCdevice,
			statusConn,
			inputCfile
		);
		const colC3 = ViewUtil.add(rowD, 'div', {}, { margin: '12px', fontSize: '60%' });

		ViewUtil.setOnClick(buttonICEWithSameBrowserTabsDNewWindows, async () => {
			vc.openNewWindow();
		});
		ViewUtil.setOnClick(buttonICEWithSameBrowserTabsDSTART, async () => {
			statusSTART.textContent = '-START-';
			const formData = new FormData(form);
			const action = `${form.getAttribute('action')}?h=${await vc.getHash(formData)}`;
			const options = {
				method: 'GET',
			};
			fetch(action, options).then((e) => {
				console.log(e);
			});
			vc.startConnect();
		});
		ViewUtil.setOnClick(buttonICEWithSameBrowserTabsDSTOP, async () => {
			statusSTART.textContent = '-STOP-';
			vc.stop();
		});
		ViewUtil.setOnClick(buttonICEWithSameBrowserTabsDCLEAR, async () => {
			vc.clear();
		});
		ViewUtil.setOnClick(buttonICEWithSameBrowserTabsDCLOSE, async () => {
			statusConn.textContent = '-STOP-';
			vc.close();
		});
		const textareaT6 = ViewUtil.add(colC3, 'textarea', { text: '' });
		ViewUtil.setOnInput(textareaT6, () => {
			vc.broadcastMessage(textareaT6.value);
		});
		const sendFunc = (file) => () => {
			vc.sendFile(this.status.connectMap, file);
		};
		const testFunc = (file) => () => {
			vc.testSend(file);
		};
		const deleteFunc = (file) => () => {
			vc.delete(file.name, file.type);
			listUpdate(vc.getAssetList());
		};
		const listUpdate = (result) => {
			colCfile03.textContent = JSON.stringify(result);
			ViewUtil.removeChildren(colCfile03);
			for (const key in result) {
				const list = result[key];
				const b = ViewUtil.add(colCfile03, 'div', { class: `${key}_body` });
				ViewUtil.add(b, 'h5', { text: key, class: `${key}_title` });
				const l = ViewUtil.add(b, 'ul', { class: `${key}_title` });
				for (const file of list) {
					const text = `name:${file.name} type:${file.type} size:${file.size} `;
					const li = ViewUtil.add(l, 'li', { class: `${key}_li` });
					ViewUtil.add(li, 'span', { text, class: `${key}_spam` });
					const btn0 = ViewUtil.add(li, 'button', { text: 'send' });
					const btn3 = ViewUtil.add(li, 'button', { text: 'test' });
					const btn1 = ViewUtil.add(li, 'button', { text: 'download' });
					const btn2 = ViewUtil.add(li, 'button', { text: 'delete' });
					ViewUtil.setOnClick(btn1, async () => {
						vc.dl(file.name, file.type);
					});
					ViewUtil.setOnClick(btn0, sendFunc(file));
					ViewUtil.setOnClick(btn3, testFunc(file));
					ViewUtil.setOnClick(btn2, deleteFunc(file));
				}
			}
		};
		ViewUtil.setOnChange(inputCfile, async () => {
			const result = await vc.ul();
			listUpdate(result);
		});
		const cbFR = async (name, type, dataAb) => {
			console.log(name, type, dataAb);
			const result = await vc.ul();
			listUpdate(result);
		};
		vc.setOnRecieveFile(cbFR);
		const cb = (connectMap) => {
			this.status.connectMap = connectMap;
			ViewUtil.removeChildren(statusConn);
			const Groups = {};
			for (const key in connectMap) {
				const shignalHash = connectMap[key];
				const [group, targetDeviceName] = JSON.parse(key);
				const g = Groups[group]
					? Groups[group]
					: ViewUtil.add(statusConn, 'div', { text: `${group}:`, class: 'g' });
				Groups[group] = g;
				const b = ViewUtil.add(g, 'div', { class: 'status' });
				ViewUtil.add(b, 'span', { text: targetDeviceName, class: 'status' });
				ViewUtil.add(b, 'span', { text: shignalHash ? 'OK' : 'NG', class: shignalHash ? 'OK' : 'NG' });
			}
		};
		vc.setOnStatusChange(cb);
	}
}
class ViewCommander {
	constructor(logElm, inputCurl, inputCgroup, inputCpasswd, inputCdevice, statusConn, inputCfile) {
		this.logElm = logElm;
		this.inputCurl = inputCurl;
		this.inputCgroup = inputCgroup;
		this.inputCpasswd = inputCpasswd;
		this.inputCdevice = inputCdevice;
		this.statusConn = statusConn;
		this.inputCfile = inputCfile;
		this.est = new ESFileSender(logElm, inputCfile);
		if (!this.inputCpasswd.value) {
			this.inputCpasswd.value = '1234';
		}
		if (!this.inputCdevice.value) {
			this.inputCdevice.value = names[(Date.now() + Math.floor(Math.random() * 9999)) % names.length];
		}
	}
	openNewWindow() {
		this.window = window.open(new URL(location.href).href, 'newOne');
	}
	startConnect() {
		this.est.startConnect(
			this.inputCurl.value,
			this.inputCgroup.value,
			this.inputCdevice.value,
			this.inputCpasswd.value
		);
	}
	stop() {
		this.est.stop();
	}
	close() {
		this.est.close();
	}
	clear() {
		this.logElm.textContent = '';
	}
	async ul() {
		const result = await this.est.ul();
		console.log(`ul result:${result}`);
		return this.est.getAssetList();
	}
	async getHash() {}
	getAssetList() {
		return this.est.getAssetList();
	}
	dl(name, type) {
		this.est.dl(name, type);
	}
	delete(name, type) {
		this.est.delete(name, type);
	}
	setOnStatusChange(cb) {
		this.est.setOnStatusChange(cb);
	}
	sendFile(connectMap, file) {
		let count = 0;
		for (const key in connectMap) {
			const shignalHash = connectMap[key];
			const [group, targetDeviceName] = JSON.parse(key);
			if (shignalHash) {
				count++;
				this.est.send(group, targetDeviceName, file.name, file.type);
			}
		}
		if (count === 0) {
			alert('no send!');
		}
	}
	broadcastMessage(msg) {
		this.est.broadcastMessage(msg);
	}
	testSend(file) {
		this.est.test(file.name, file.type);
	}
	setOnRecieveFile(cb) {
		this.est.onRecieveFile = cb;
	}
}
window.onload = (event) => {
	console.log(`page is fully loaded event:${event}`);
	new ESMainView().build();
};
class TextUtil {
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
class ViewUtil {
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
	static removeChildren(elm) {
		if (elm.hasChildNodes()) {
			for (const child of elm.childNodes) {
				ViewUtil.removeChildren(child);
				elm.removeChild(child);
			}
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
