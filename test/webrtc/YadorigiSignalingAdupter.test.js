import chai from 'chai';
import { YadorigiSignalingAdapter } from '../../src/webrtc/YadorigiSignalingAdapter.js';
import { DummySpreadsheetApp } from '../mocs/DummySpreadsheetApp.js';
import { YadorigiServerMoc } from '../mocs/YadorigiServerMoc.js';
import gs from '../../src/gs/YadorigiWebRTCSignalingServer.js';
import { global } from './global.js';
const expect = chai.expect;
// eslint-disable-next-line no-undef
global.SpreadsheetApp = DummySpreadsheetApp;
const passphraseText = 'じゅげむじゅげむ';
const userId = 'にゃーん';
const deviceName1 = 'ぴよぴよ';
const deviceNamee2 = 'もにょもにょ';
const groupName = 'なーん';
const server = new gs.YadorigiWebRTCSignalingServer();
// eslint-disable-next-line no-undef
describe('テスト YadorigiSignalingAdupter', () => {
	// eslint-disable-next-line no-undef
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
		// ysa1.startConnect(deviceName2);
		console.log('----B----------YadorigiSignalingAdupter--------------------------------------');
		ysa2.startConnect(deviceName1);
		console.log('----C----------YadorigiSignalingAdupter--------------------------------------');

		console.log(gs.YadorigiWebRTCSignalingServer);
		console.log(server);
		expect(ysa1).to.not.equal(ysa2);
	});
});
