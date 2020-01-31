import { Hasher } from '../util/Hasher';
import { BinaryConverter } from '../util/BinaryConverter';
import { IframeController } from '../view/util/IframeController';
import { CookieManager } from '../view/util/CookieManager';
const ua = navigator.userAgent;
const buidSeed = async (userId, passphrase) => {
	const seedA = JSON.stringify([userId, ua])
		.split('')
		.join('#')
		.split('')
		.reverse()
		.join('');
	const seedB = JSON.stringify([passphrase])
		.split('')
		.join('#')
		.split('')
		.reverse()
		.join('');

	const seedA1 = (await Hasher.sha512(seedA, 10)).split();
	const seedA1len = seedA1.length;
	const seedB1 = (await Hasher.sha512(seedB, 10)).split();
	const seedB1len = seedB1.length;
	const seedAll = [];
	for (let i = 0; i < seedA1len && i < seedB1len; i++) {
		const cA = seedA1[i];
		const cB = seedB1[i];
		seedAll.push(cA);
		seedAll.push(cB);
	}
	return seedAll.jpin('');
};
const getPath = () => {
	return window.location.origin + window.location.pathname;
};
const stretchCount = 1999;
const YADORIGI = 'YADOPRIGI';
const KEY = 'key';
const iframeContllors = {};
export class YadrogiLoginManager {
	static async login(userId, passphrase) {
		const current = await isLogedIn(userId, passphrase);
		if (current) {
			return true;
		}
		let key = await window.crypto.subtle.generateKey(
			{
				name: 'AES-GCM',
				length: 256
			},
			true,
			['encrypt', 'decrypt']
		);
		const ab = await window.crypto.subtle.exportKey('raw', key);
		const base64 = BinaryConverter.arrayBuffer2base64(ab);
		const cm = await YadrogiLoginManager.getCoomieManager(userId, passphrase);
		cm.set(KEY, base64);
		const keyHash = await Hasher.sha512(base64, stretchCount);
		sessionStorage.setItem(keyHash, Date.now());
	}
	static async isLogedIn(userId, passphrase) {
		const cm = await YadrogiLoginManager.getCoomieManager(userId, passphrase);
		const base64 = cm.getCookie(KEY);
		const keyHash = await Hasher.sha512(base64, stretchCount);
		const savedKeyHash = sessionStorage.getItem(keyHash, Date.now());
		if (keyHash === savedKeyHash) {
			const ab = BinaryConverter.base642ArrayBuffer(base64);
			const key = await window.crypto.subtle.importKey('raw', ab, 'AES-GCM', true, ['encrypt', 'decrypt']);
			return key;
		}
		return null;
	}
	static async getCoomieManager(userId, passphrase) {
		const url = await YadrogiLoginManager.getUrl(userId, passphrase);
		let doc = await YadrogiLoginManager.getIframeDoc(url);
		return new CookieManager(doc, window.location.hostname, url);
	}

	static async getIframeDoc(url) {
		let iframeContllor = iframeContllors[url];
		if (!iframeContllor) {
			iframeContllor = new IframeController();
			iframeContllor.build(Date.now() + '', url);
			iframeContllors[url] = iframeContllor;
		}
		return await iframeContllors.getDocOnLoad();
	}
	static async getUrl(userId, passphrase) {
		const urlPath = getPath();
		const key = await YadrogiLoginManager.getKey(userId, passphrase);
		const url = `${urlPath}/${YADORIGI}/${key}`;
		return url;
	}
	static async getKey(userId, passphrase) {
		const seed = await buidSeed(userId, passphrase);
		return await Hasher.sha512(seed, stretchCount);
	}
	static saveKey(userId, passphrase) {}
}
