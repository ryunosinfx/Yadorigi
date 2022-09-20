import chai from 'chai';
import { YadorigiFileProsessor } from '../../src/webrtc/YadorigiFileProsessor.js';
import { YadorigiSdpFileRecord } from '../../src/webrtc/YadorigiSdpFileRecord.js';
const expect = chai.expect;

// eslint-disable-next-line no-undef
describe('テスト YadorigiFileProsessor', () => {
	// eslint-disable-next-line no-undef
	it('build!', async () => {
		const yfp = new YadorigiFileProsessor();
		const passphraseText = 'なーん';
		const imageList = [];
		const senderDeviceName = 'iPone';
		const sdp = 'aaaa';
		const userId = 'testA';
		const groupName = 'aaaa';
		const n = null;
		const A = await yfp.build(passphraseText, imageList, senderDeviceName, sdp, userId, groupName);
		console.log(A);
		expect(n).to.not.equal(A);
	});
	// eslint-disable-next-line no-undef
	it('decode!', async () => {
		const yfp = new YadorigiFileProsessor();
		const passphraseText = 'なーん';
		const imageList = [];
		const senderDeviceName = 'iPone';
		const sdp = 'aaaa';
		const userId = 'testA';
		const groupName = 'aaaa';
		const A = await yfp.build(passphraseText, imageList, senderDeviceName, sdp, userId, groupName);
		console.warn(A);
		const C = await yfp.createPayload(senderDeviceName, sdp, Date.now(), userId, groupName);
		console.warn(C);
		const D = await YadorigiSdpFileRecord.createFileName(groupName, userId, senderDeviceName);
		console.warn(D);

		const B = await yfp.parse(passphraseText, A.payload);
		console.warn(B);
		expect(B).to.not.equal(A);
		expect(B.sdp).to.be.equal(sdp);
	});
	// eslint-disable-next-line no-undef
	it('decode With Answer!', async () => {
		const yfp = new YadorigiFileProsessor();
		const passphraseText = 'なーん';
		const imageList = [];
		const senderDeviceName = 'iPone';
		const sdp = 'aaaa';
		const userId = 'testA';
		const groupName = 'aaaa';
		const A = await yfp.buildOffer(passphraseText, imageList, senderDeviceName, sdp, userId, groupName);
		console.warn(A);
		const C = await yfp.createPayload(senderDeviceName, sdp, Date.now(), userId, groupName);
		console.warn(C);
		const D = await YadorigiSdpFileRecord.createFileName(groupName, userId, senderDeviceName);
		console.warn(D);

		const B = await yfp.parseOffer(passphraseText, A.payload);
		const sdp2 = 'bbbbbb';
		const A2 = await yfp.buildAnswer(passphraseText, imageList, senderDeviceName, sdp2, userId, groupName, sdp);
		const B2 = await yfp.parseAnswer(passphraseText, A2.payload, sdp);
		console.warn('decode With Answer! A');
		console.warn(A);
		console.warn('decode With Answer! B');
		console.warn(B);
		// console.warn('spd:' + sdp);
		// console.warn('B.spd:' + B.sdp);
		console.warn('decode With Answer! A2');
		console.warn(A2);
		console.warn('decode With Answer! B2');
		console.warn(B2);
		// console.warn('spd2:' + sdp2);
		// console.warn('B.spd:' + B.sdp);
		expect(B).to.not.equal(A);
		expect(B.sdp).to.be.equal(sdp);
		expect(B2.sdp).to.be.equal(sdp2);
	});
});
