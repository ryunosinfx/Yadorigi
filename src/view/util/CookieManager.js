const ETARNAL = 'expires=Fri, 31 Dec 9999 23:59:59 GMT';
class CookieManager {
	constructor(doc = document, domain, url) {
		this.doc = doc;
		this.domain = domain;
		this.exporeUnixTime = Date.now();
		this.path = '/';
		if (url) {
			this.url = url;
			this.urlObj = new URL(url, [base]);
			this.path = this.urlObj.pathname;
		}
	}
	static executeOnce(callBack, cookieName, domain) {
		let argc = arguments.length;
		if (argc < 3) {
			throw new TypeError('executeOnce - not enough arguments');
		}
		const sKey = arguments[argc - 2];
		if (typeof callBack !== 'function') {
			throw new TypeError('executeOnce - first argument must be a function');
		}
		if (!cookieName || /^(?:expires|max\-age|path|domain|secure)$/i.test(cookieName)) {
			throw new TypeError('executeOnce - invalid identifier');
		}
		const regexp = new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(cookieName).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$');
		if (decodeURIComponent(document.cookie.replace(regexp, '$1')) === '1') {
			return false;
		}
		callBack.apply(argc > 3 ? arguments[1] : null, argc > 4 ? Array.prototype.slice.call(arguments, 2, argc - 2) : []);
		document.cookie = encodeURIComponent(cookieName) + '=1; expires=Fri, 31 Dec 9999 23:59:59 GMT' + (domain || !arguments[argc - 1] ? '; path=/' : '');
		return true;
	}
	setCookie(key, value, path = this.path, exporeUnixTime = 2147483647) {
		const expiresDate = new Date(exporeUnixTime);
		const utc = expiresDate.toUTCString();
		this.doc.cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value) + '; expires=' + utc + '; path=' + path;
	}
	getCookie(key) {
		const regexp = new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(key).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$');
		return decodeURIComponent(this.doc.cookie.replace(regexp, '$1'));
	}
}
