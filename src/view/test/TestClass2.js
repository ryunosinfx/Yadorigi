import { YadorigiSignalingAdapter } from '../../webrtc/YadorigiSignalingAdapter.js';
import { Base64Util } from '../../util/Base64Util.js';
const passphraseText = 'じゅげむじゅげむ';
const userId = 'にゃーん';
const deviceName1 = 'ぴよぴよ';
const deviceName2 = 'もにょもにょ';
const groupName = 'なーん';
export class TestClass2 {
	constructor() {}
	static getTestJsonObj(pt = passphraseText, uid = userId, d1 = deviceName1, d2 = deviceName2, gn = groupName) {
		return { passphraseText: pt, userId: uid, deviceName1: d1, deviceName2: d2, groupName: gn };
	}
	static openAnotherWindow(url, pt = passphraseText, uid = userId, d1 = deviceName1, d2 = deviceName2, gn = groupName) {
		const obj = TestClass2.getTestJsonObj(pt, uid, d1, d2, gn);
		obj.url = url;
		const json = JSON.stringify(obj);
		const hash = Base64Util.stringToBase64url(json);
		const u = new URL(location.href);
		u.hash = hash;
		this.window = window.open(u.href, 'newOne');
	}
	static async Test2(url, logger = console) {
		// global.SpreadsheetApp = DummySpreadsheetApp;
		try {
			logger.log(`---01-----------YadorigiSignalingAdupter TEST2--------------------------------------deviceName1:${deviceName1}`);
			const ysa1 = new YadorigiSignalingAdapter(passphraseText, userId, deviceName1, groupName, url, logger);
			logger.log('---02-----------YadorigiSignalingAdupter TEST2--------------------------------------');
			await ysa1.init();
			logger.log(`---03-----------YadorigiSignalingAdupter TEST2--------------------------------------deviceName2:${deviceName2}`);
			await ysa1.startConnect(deviceName2);
			logger.log('---04-----------YadorigiSignalingAdupter TEST2--------------------------------------');
		} catch (e) {
			logger.log(e);
			logger.log('----G----------YadorigiSignalingAdupter TEST2--------------------------------------');
		}
	}
	static async callFromHash(hash, logger = console) {
		logger.log(hash);
		logger.log('---01-----------YadorigiSignalingAdupter callFromHash--------------------------------------');
		const json = Base64Util.base64UrlToString(hash);
		try {
			const obj = JSON.parse(json);
			if (!obj || !obj.url) {
				alert(`json:${json}`);
				return;
			}
			const url = obj.url;
			const passphraseText = obj.passphraseText;
			const userId = obj.userId;
			const deviceName2 = obj.deviceName2;
			const groupName = obj.groupName;
			TestClass2.TestCall(url, passphraseText, userId, deviceName2, groupName, logger);
		} catch (e) {
			alert(e);
		}
	}
	static async TestCall(url, passphraseText, userId, deviceName2, groupName, logger = console) {
		try {
			logger.log(`---01-----------YadorigiSignalingAdupter TestCall--------------------------------------deviceName2:${deviceName2}`);
			const ysa2 = new YadorigiSignalingAdapter(passphraseText, userId, deviceName2, groupName, url, logger);
			logger.log('---01-----------YadorigiSignalingAdupter TestCall--------------------------------------');
			await ysa2.init();
			logger.log('---01-----------YadorigiSignalingAdupter TestCall--------------------------------------');
			logger.log(ysa2);
			await ysa2.startConnect(deviceName1);
			logger.log(`---01-----------YadorigiSignalingAdupter TestCall--------------------------------------deviceName1:${deviceName1}`);
		} catch (e) {
			logger.log(e);
			logger.log('----G----------YadorigiSignalingAdupter TestCall--------------------------------------');
		}
	}
}
