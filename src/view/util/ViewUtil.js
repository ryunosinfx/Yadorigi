import { TextUtil } from '../../util/TextUtil';
const DIV = 'div';
export class ViewUtil {
	static addHiddenDiv(parent, attrs = {}) {
		return ViewUtil.add(parent, DIV, attrs, { display: 'none' });
	}
	static add(parent, tagName, attrs = {}, styles = {}) {
		const elm = document.createElement(tagName);
		for (let key in attrs) {
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
		for (let key in styles) {
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
