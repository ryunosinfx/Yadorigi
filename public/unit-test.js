import { Cy, Y, H, B } from './ESWebRTCConnecterU.js';
const o = {
	describe: 'describe',
	it: 'it',
	before: 'before',
	after: 'after',
	beforeEach: 'beforeEach',
	afterEach: 'afterEach',
	expect: 'expect',
	should: 'should',
	assertEqual: 'assertEqual',
};
let chai = null;
let mocha = null;
let assert = null;
const cy = crypto.subtle,
	crv = t => crypto.getRandomValues(t);
export class UnitTest {
	static init(chaiM, mochaM, describeM, itM, beforeM, afterM, beforeEachM, afterEachM) {
		if (chaiM) {
			chai = chaiM;
			mocha = mochaM;
			o.it = itM;
			o.describe = describeM;
			o.before = beforeM;
			o.after = afterM;
			o.beforeEach = beforeEachM;
			o.afterEach = afterEachM;
			assert = chai.assert;
			return;
		}
	}
	static run() {
		const describe = o.describe,
			it = o.it;
		describe('Array', function () {
			describe('#indexOf()', function () {
				it('should return -1 when the value is not present', function () {
					console.log('run');
					assert.equal([1, 2, 3].indexOf(4), -1);
				});
			});
		});
		describe('Y', function () {
			describe('#i2u and u2i', function () {
				it('should return same value', function () {
					console.log('run');
					const digest_size = 4;
					const m = Math.pow(256, digest_size);
					for (let i = 0; i < 100; i++) {
						const a = Math.ceil(Math.random() * m);
						const b = Y.i2u(a, digest_size);
						const c = Y.u2i(b);
						console.log('i2u and u2i', a, b, c, Y.af);
						assert.equal(a, c);
					}
				});
			});
			describe('#jus and az', function () {
				it('should return same value', function () {
					console.log('run');
					const digest_size = 4;
					const m = Math.pow(256, digest_size);
					const us = [];
					const is = [];
					const am = { s: 0 };
					for (let i = 0; i < 100; i++) {
						const a = Math.ceil(Math.random() * m);
						is.push(a);
						const b = Y.i2u(a, digest_size);
						us.push(b);
					}
					const aa = Y.jus(us);
					// console.log('jus and az 1 aa:', aa, Y.a2U(aa));
					for (let i = 0; i < 100; i++) {
						const b = Y.az(aa, digest_size, am);
						// console.log('jus and az 2 b:', b, Y.a2U(b), am);
						const c = Y.u2i(b);
						const a = is[i];
						// console.log('jus and az 3 a:', a, c);
						assert.equal(a, c);
					}
				});
			});
		});
		describe('Cy', function () {
			describe('#make keys()', function () {
				it('Cy.gKPr', async function () {
					const kp = await Cy.gKPr();
					const kpn = await Cy.gKPrE();
					const U0 = await cy.exportKey('spki', kpn.publicKey);
					console.log('XXXXXXXXXXXXXXXXXXXXXXXU0 01:', U0);
					console.log('XXXXXXXXXXXXXXXXXXXXXXXU0 02:', U0);
					const U1 = Y.a2U(U0);
					console.log('XXXXXXXXXXXXXXXXXXXXXXXU1 1:', U1);
					const U2 = await Cy.eKRu(kpn.publicKey);
					console.log('XXXXXXXXXXXXXXXXXXXXXXXU2 2:', U2);
					assert.equal(U1, U2);
					console.log('XXXXXXXXXXXXXXXXXXXXXXXU2 3:', U2);
					const U3 = Y.U2a(U1);
					console.log('XXXXXXXXXXXXXXXXXXXXXXXU3 4:', U3, U0);
					// assert.equal(U0, U3);
					await cy.importKey('spki', U3, Cy.ps, false, ['encrypt']);
					console.log('XXXXXXXXXXXXXXXXXXXXXXXU2 5:', U2);
					await Cy.iK(U1, 'spki', Cy.ps, ['encrypt']);
					await Cy.iKRu(U2);
					console.log('gKPr run', await cy.exportKey('spki', kpn.publicKey));
					assert.isObject(kp);
					console.log('XXXXXXXXXXXXXXXXXXXXXXXU1 6:', U1);
					console.log('pKr 1:', kp);
					await Cy.iKRu(kp.pu);
					console.log('pKr 2:', kp);
					await Cy.iKRr(kp.pr);
					console.log('pKr 3:', kp);
				}).timeout(60 * 1000);

				it('Cy.gKPr Encrypt and decrypt', async function () {
					const kp = await Cy.gKPr();
					const puKr = kp.pu;
					const prKr = kp.pr;
					const a = await H.d(Cy.uuid() + Date.now(), 100, 'SHA-512', true); //main key

					const e = await Cy.pE(await Cy.iKRu(puKr), a); //encrypted
					console.log('EaD 6:', a, Y.a2U(a));
					const k = await Cy.pD(await Cy.iKRr(prKr), e); //秘密鍵で復号化),
					console.log('EaD 7:', k, Y.a2U(k));
					assert.equal(Y.a2U(a), Y.a2U(k));
				});
				it('Cy.gKPe', async function () {
					const kp = await Cy.gKPe();
					console.log('gKPe run', await Cy.gKPeE());
					assert.isObject(kp);
					console.log('pKe 1:', kp);
					console.log('pKe 1a:', Y.U2a(kp.pu));
					const a = await cy.importKey('spki', Y.U2a(kp.pu), Cy.es, false, ['verify']);
					console.log('pKe 2:', a);
					const pu = await Cy.iKEu(kp.pu);
					console.log('pKe 3:', pu);
					const pr = await Cy.iKEr(kp.pr);
					console.log('pKe 4:', pr);
					assert.isObject(kp);
				}).timeout(60 * 1000);
				it('Cy.gKPe Sign and Verify', async function () {
					const kp = await Cy.gKPe();
					const puKe = kp.pu;
					const prKe = kp.pr;
					const a = await H.d(Cy.uuid() + Date.now(), 100, 'SHA-512', true); //main key
					console.log('SaV 5:', a, Y.a2U(a));
					const s = await Cy.s(await Cy.iKEr(prKe), a); //Sign
					console.log('SaV 6:', s, Y.a2U(s));
					const v = await Cy.v(await Cy.iKEu(puKe), s, a); //Verify
					console.log('SaV 7:', v, Y.a2U(v));
					assert.equal(v, true);
				});
				it('Cy.encAES256GCM', async function () {
					const ab = Cy.rd(1000);
					const a = await H.d(Cy.uuid() + Date.now(), 100, 'SHA-512', true); //main key
					const s = Cy.gS(null, false);
					console.log('encAES256GCM 3:', s, Y.a2U(s));
					const k = await Cy.lk(a, s);
					console.log('encAES256GCM 4:', k, Y.a2U(k));
					console.log('encAES256GCM 5:', a, Y.a2U(a));
					const ed = await Cy.encAES256GCM(B.u8(ab), a); //[encryptData,iv,salt]
					console.log('encAES256GCM 6:', ed, Y.a2U(ed));
					const b = await Cy.decAES256GCM(ed, a);
					console.log('encAES256GCM 7:', b, Y.a2U(b));
					assert.equal(Y.a2U(b), Y.a2U(ab));
				});
				it('Cy.encAES256GC?_', async function () {
					const ab = Cy.rd(1000);
					const a = await H.d(Cy.uuid() + Date.now(), 100, 'SHA-512', true); //main key
					const s = Cy.gS(null, false);
					console.log('encAES256GCM 3:', s, Y.a2U(s));
					const k = await Cy.lk(a, s);
					console.log('encAES256GCM 4:', k, Y.a2U(k));
					console.log('encAES256GCM 5:', a, Y.a2U(a));
					const ed = await Cy.eA256Gbare(ab, a); //[encryptData,iv,salt]
					console.log('encAES256GCM 6:', ed, Y.a2U(ed));
					const b = await Cy.dA256Gbare(ed[0], ed[1], B.u8(ed[2]), a);
					console.log('encAES256GCM 7:', b, Y.a2U(b));
					assert.equal(Y.a2U(b), Y.a2U(ab));
				});
				it('Cy.ePP', async function () {
					const kpE = await Cy.gKPe();
					const kpR = await Cy.gKPr();
					const nd = Cy.rd(1000000);
					console.log('ePP 3:', nd, Y.a2U(nd));
					const ndu = Y.u2U(nd);
					console.log('ePP 4:', ndu, Y.a2U(ndu));
					const ed = await Cy.ePP(nd.buffer, kpR.pu, kpE.pr);
					console.log('ePP 5:', ed, Y.a2U(ed));
					const dd = await Cy.dPP(ed, kpE.pu, kpR.pr);
					console.log('ePP 6:', dd);
					const ddu = Y.a2U(dd);
					assert.equal(ndu, ddu);
				}).timeout(60 * 1000);
			});
		});

		mocha.run();
	}
}
