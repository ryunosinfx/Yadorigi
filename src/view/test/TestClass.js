import { YadorigiSignalingAdapter } from '../../webrtc/YadorigiSignalingAdapter';
import { DummySpreadsheetApp } from '../../../test/mocs/DummySpreadsheetApp';
import { YadorigiServerMoc } from '../../../test/mocs/YadorigiServerMoc';
import gs from '../../../src/gs/YadorigiWebRTCSignalingServer';
export class TestClass {
	constructor() {}
	static async Test1() {
		global.SpreadsheetApp = DummySpreadsheetApp;
		const passphraseText = 'じゅげむじゅげむ';
		const userId = 'にゃーん';
		const deviceName1 = 'ぴよぴよ';
		const deviceName2 = 'もにょもにょ';
		const groupName = 'なーん';
		try {
			const server = new gs.YadorigiWebRTCSignalingServer();
			console.log('---0-----------YadorigiSignalingAdupter--------------------------------------');
			const ysa1 = new YadorigiSignalingAdapter(passphraseText, userId, deviceName1, groupName);
			console.log('---01-----------YadorigiSignalingAdupter--------------------------------------');
			const ysa2 = new YadorigiSignalingAdapter(passphraseText, userId, deviceName2, groupName);
			console.log('---02-----------YadorigiSignalingAdupter--------------------------------------');
			YadorigiServerMoc.setMocToAdupter(ysa1);
			console.log('---03-----------YadorigiSignalingAdupter--------------------------------------');
			YadorigiServerMoc.setMocToAdupter(ysa2);
			console.log('---04-----------YadorigiSignalingAdupter--------------------------------------');
			await ysa1.init();
			console.log('---05-----------YadorigiSignalingAdupter--------------------------------------');
			await ysa2.init();
			console.log('---06-----------YadorigiSignalingAdupter--------------------------------------');
			console.log(ysa2);
			console.log('---A-----------YadorigiSignalingAdupter--------------------------------------');
			const promis1 = ysa1.startConnect(deviceName2);
			console.log('----B----------YadorigiSignalingAdupter--------------------------------------');
			await ysa2.startConnect(deviceName1);
			console.log('----C----------YadorigiSignalingAdupter--------------------------------------');
			await Promise.all([promis1, promis2]);
			console.log('----D----------YadorigiSignalingAdupter--------------------------------------');
			console.log(gs.YadorigiWebRTCSignalingServer);
			console.log('----E----------YadorigiSignalingAdupter--------------------------------------');
			console.log(server);
			console.log('----F----------YadorigiSignalingAdupter--------------------------------------');
		} catch (e) {
			console.log(e);
			console.log('----G----------YadorigiSignalingAdupter--------------------------------------');
		}
	}
}
