export class DummyResponse {
	constructor(result) {
		this.result = result;
	}
	async json() {
		return this.result ? this.result.value : '';
	}
	async text() {
		return this.result ? this.result.value : '';
	}
}
