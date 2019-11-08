import chai from 'chai';
import { YadorigiSignalingAdapter } from '../../src/webrtc/YadorigiSignalingAdapter';
import { DummySpreadsheetApp } from '../mocs/DummySpreadsheetApp';
import { YadorigiServerMoc } from '../mocs/YadorigiServerMoc';
import gs from '../../src/gs/YadorigiWebRTCSignalingServer';
const expect = chai.expect;
global.SpreadsheetApp = DummySpreadsheetApp;
const passphraseText = 'じゅげむじゅげむ';
const userId = 'にゃーん';
const deviceName1 = 'ぴよぴよ';
const deviceNamee2 = 'もにょもにょ';
const groupName = 'なーん';
const server = new gs.YadorigiWebRTCSignalingServer();
describe('テスト YadorigiSignalingAdupter', () => {
	it('build!', async () => {
		console.log('---0-----------YadorigiSignalingAdupter--------------------------------------');
		const ysa1 = new YadorigiSignalingAdapter(passphraseText, userId, deviceName1, groupName);
		const ysa2 = new YadorigiSignalingAdapter(passphraseText, userId, deviceNamee2, groupName);
		YadorigiServerMoc.setMocToAdupter(ysa1);
		YadorigiServerMoc.setMocToAdupter(ysa2);
		await ysa1.init();
		await ysa2.init();
		console.log(ysa2);
		console.log('---A-----------YadorigiSignalingAdupter--------------------------------------');
		ysa1.startConnect(deviceName2);
		console.log('----B----------YadorigiSignalingAdupter--------------------------------------');
		ysa2.startConnect(deviceName1);
		console.log('----C----------YadorigiSignalingAdupter--------------------------------------');

		console.log(gs.YadorigiWebRTCSignalingServer);
		console.log(server);
		expect(ysa1).to.not.equal(ysa2);
	});
});
