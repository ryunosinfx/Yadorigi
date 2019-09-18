import chai from 'chai';
import { YadorigiFileProsessor } from '../../src/webrtc/YadorigiFileProsessor';
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
		const D = await yfp.createFileName(groupName, userId, senderDeviceName);
		console.log(D);

		const B = await yfp.parse(passphraseText, A);
		console.log(B);
		expect(B).to.not.equal(A);
	});
});
