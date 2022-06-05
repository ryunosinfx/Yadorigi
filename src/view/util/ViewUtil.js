import { TextUtil } from '../../util/TextUtil';
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
