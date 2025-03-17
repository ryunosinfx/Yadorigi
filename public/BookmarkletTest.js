import { Y, H } from './ESWebRTCConnecterU.js';
import { Vw } from './Vw.js';
class F {
	static async l(p, c = 'application/json', isText) {
		const q = {
			method: 'GET',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'omit',
			redirect: 'follow',
			referrer: 'no-referrer',
			headers: { 'Content-Type': c },
		};
		const r = await fetch(p, q);
		return isText ? await r.text() : await r.blob();
	}
}
const SLASH = '&#47;';
const HTTP_REGXP = /http:\/\//g;
const HTTPS_REGXP = /https:\/\//g;
const A = 'ACCESS_POINT';
const Q = 'QUERY';
export class BookmarkletBuilder {
	static build(src) {
		const rows = src
			.split('\t')
			.join('')
			.replace(/\/\*[^/]+\*\//g, '')
			.split('\n');
		const f = [];
		for (const r of rows) {
			const n = r.replace(HTTP_REGXP, `http:${SLASH}${SLASH}`).replace(HTTPS_REGXP, `https:${SLASH}${SLASH}`);
			f.push(
				n
					.split('//')[0]
					.split(SLASH)
					.join('/')
					.replace(/^export /g, '')
			);
		}

		const b = f.join(' ');
		let l = b ? `${b}` : '';
		const ks = ':;,-+=*><(){}?/'.split('');
		ks.push('!==');
		ks.push('||');
		ks.push('&&');
		for (const k of ks) {
			l = l
				.split(` ${k}`)
				.join(k)
				.split(`${k} `)
				.join(k)
				.split(`${k} ${k}`)
				.join(k + k);
		}
		for (const k of ks) {
			l = l
				.split(` ${k}`)
				.join(k)
				.split(`${k} `)
				.join(k)
				.split(`${k} ${k}`)
				.join(k + k);
		}
		console.log(l);
		return `javascript:(function(){${l};a()})()`;
	}
	static async getBookmarklet(jsPath, q, d = '/') {
		const c = `${location.protocol}//${location.host}${d}`;
		const s = await F.l(`${jsPath}`, undefined, true);
		const b = s.split(A).join(c).split(Q).join(q);
		return BookmarkletBuilder.build(b);
	}
}
const targetPath = './ESWebRTCConnecterU.js';
export class BK {
	static FirefoxMax = 62452;
	static async build(p = Vw.gi('main')) {
		const frame = Vw.div(p);
		// const src = Vw.h2(frame, { text: 'Source of the bookmarklet' }, { margin: 0 });
		const textArea = Vw.div(frame);
		const ta = Vw.add(
			textArea,
			'textarea',
			{ className: 'aaa' },
			{ width: '90vw', height: '60vh', fontSize: '20%' }
		);
		const link = Vw.div(textArea);
		const a = Vw.add(link, 'a', { text: 'bookmarklet Link', href: location.href }, {});
		const s = Vw.add(link, 'span', {}, { display: 'inline-block', padding: '0 10px', fontSize: '80%' });
		Vw.ael(ta, 'input', BK.setLink(a, ta, s));
		const copy = Vw.add(link, 'button', { text: 'copy' });
		Vw.click(copy, () => {
			Vw.copy(ta.value);
			alert('copied!');
		});
		ta.value = await BookmarkletBuilder.getBookmarklet(targetPath, '');
		console.log(
			`await BookmarkletBuilder.getBookmarklet(TOTPpath, ''):${await BookmarkletBuilder.getBookmarklet(
				targetPath,
				''
			)}`
		);
		BK.init(a, ta, s);
	}
	static init(aElm, inputElm, sElm) {
		Vw.sa(aElm, { href: inputElm.value });
		sElm.textContent = `${inputElm.value.length}byte /FirefoxMax:${BK.FirefoxMax}byte /left size:${
			BK.FirefoxMax - inputElm.value.length
		}byte`;
	}
	static setLink = (aElm, inputElm, sElm) => () => BK.init(aElm, inputElm, sElm);
}
