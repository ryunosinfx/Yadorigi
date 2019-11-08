export class DummyGsEvent {
	constructor(inputJson) {
		try {
			this.parameter = JSON.parse(inputJson);
		} catch (e) {
			console.warn(e);
			console.warn(inputJson);
			this.parameter = {};
		}
	}
}
