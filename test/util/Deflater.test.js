import chai from 'chai';
import { Deflater } from '../../src/util/Deflater';
import { BinaryConverter } from '../../src/util/BinaryConverter';
const expect = chai.expect;

describe('テストDeflater', () => {
	it('same', async () => {
		const str = 'ニャーン';
		const u8a = BinaryConverter.stringToU8A(str);
		const defrated = Deflater.deflateP(u8a);
		const infrated = Deflater.inflateP(defrated);
		const result = BinaryConverter.u8aToString(infrated);
		expect(result).to.be.equal(str);
	});
	it('same', async () => {
		const str = '寿限無寿限無後光の擦り切,れオッペケペーのポンポコリンあiaushdisudhasiudhnうあううあううああああああ';
		const u8a = BinaryConverter.stringToU8A(str);
		const defrated = Deflater.deflateP(u8a);
		console.log(u8a.buffer.byteLength + '/' + defrated.length + '/defrated:' + defrated.buffer.byteLength);
		const infrated = Deflater.inflateP(defrated);
		const result = BinaryConverter.u8aToString(infrated);
		expect(result).to.be.equal(str);
	});
});
