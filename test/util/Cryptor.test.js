import chai from 'chai';
import { Cryptor } from '../../src/util/Cryptor.js';
import { BinaryConverter } from '../../src/util/BinaryConverter.js';
const expect = chai.expect;

// eslint-disable-next-line no-undef
describe('テストCryptor', () => {
	// eslint-disable-next-line no-undef
	it('same to be not same at encrypted', async () => {
		const u8a = BinaryConverter.stringToU8A('ニャーン');
		const passphrase = 'まーお';
		const crypted = await Cryptor.encodeAES256GCM(u8a, passphrase);
		const crypted2 = await Cryptor.encodeAES256GCM(u8a, passphrase);
		const json1 = JSON.stringify(crypted);
		const json2 = JSON.stringify(crypted2);
		expect(json1).to.not.equal(json2);
	});
	// eslint-disable-next-line no-undef
	it('same', async () => {
		const planText = 'ニャーンwewewewe';
		const u8a = BinaryConverter.stringToU8A(planText);
		const passphrase = 'まーお';
		const cryptedJSON = await Cryptor.encodeAES256GCM(u8a, passphrase);
		console.log(`cryptedJSON:${cryptedJSON}`);
		const crypted2 = await Cryptor.decodeAES256GCM(cryptedJSON, passphrase);
		const u8a2 = BinaryConverter.u8aToString(crypted2);
		console.log(`u8a2:${u8a2}`);
		console.log(`planText:${planText}`);
		expect(planText).to.be.equal(u8a2);
	});
});
