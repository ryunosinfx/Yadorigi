export class DummyResponse {
	constructor() {}
	async toJSON() {
		return 'a';
	}
}
