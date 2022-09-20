export class DummyResponse {
	constructor(result) {
		this.result = result;
		console.log(`DummyResponse constructor this.result:${this.result}`);
		console.log(result);
	}
	async json() {
		console.log(`DummyResponse json this.result:${this.result}`);
		return this.result ? this.result.value : '';
	}
	async text() {
		console.log(`DummyResponse text this.result:${this.result}`);
		const text = this.result ? this.result.value : '';
		console.log(`DummyResponse text text:${text}/${typeof text}`);
		return text;
	}
}
