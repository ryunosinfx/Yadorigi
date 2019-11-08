import chai from 'chai';
import { YadorigiFileProsessor } from '../../src/webrtc/YadorigiFileProsessor';
import { YadorigiSdpFileRecord } from '../../src/webrtc/YadorigiSdpFileRecord';
const expect = chai.expect;

describe('テスト YadorigiFileProsessor', () => {
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
	it('decode!', async () => {
		const yfp = new YadorigiFileProsessor();
		const passphraseText = 'なーん';
		const imageList = [];
		const senderDeviceName = 'iPone';
		const sdp = 'aaaa';
		const userId = 'testA';
		const groupName = 'aaaa';
		const A = await yfp.build(passphraseText, imageList, senderDeviceName, sdp, userId, groupName);
		console.log(A);
		const C = await yfp.createPayload(senderDeviceName, sdp, Date.now(), userId, groupName);
		console.log(C);
		const D = await YadorigiSdpFileRecord.createFileName(groupName, userId, senderDeviceName);
		console.log(D);

		const B = await yfp.parse(passphraseText, A.payload);
		console.log(B);
		expect(B).to.not.equal(A);
		expect(B.sdp).to.be.equal(sdp);
	});
	it('decode With Answer!', async () => {
		const yfp = new YadorigiFileProsessor();
		const passphraseText = 'なーん';
		const imageList = [];
		const senderDeviceName = 'iPone';
		const sdp = 'aaaa';
		const userId = 'testA';
		const groupName = 'aaaa';
		const A = await yfp.buildOffer(passphraseText, imageList, senderDeviceName, sdp, userId, groupName);
		console.log(A);
		const C = await yfp.createPayload(senderDeviceName, sdp, Date.now(), userId, groupName);
		console.log(C);
		const D = await YadorigiSdpFileRecord.createFileName(groupName, userId, senderDeviceName);
		console.log(D);

		const B = await yfp.parseOffer(passphraseText, A.payload);
		console.log(B);
		const sdp2 = 'bbbbbb';
		const A2 = await yfp.buildAnswer(passphraseText, imageList, senderDeviceName, sdp2, userId, groupName, sdp);
		console.log('A2');
		console.log(A2);
		const B2 = await yfp.parseAnswer(passphraseText, A2.payload, sdp);
		console.log('B2');
		console.log(B2);
		expect(B).to.not.equal(A);
		expect(B.sdp).to.be.equal(sdp);
		expect(B2.sdp).to.be.equal(sdp2);
	});
});
