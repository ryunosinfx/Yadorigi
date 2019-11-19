export class DummyGsEvent {
	constructor(inputJson) {
		try {
			this.parameter = inputJson ? JSON.parse(inputJson) : {};
		} catch (e) {
			console.warn(e);
			console.warn(inputJson);
			this.parameter = {};
		}
	}
	setPromise(promise) {
		this.promise = promise;
	}
	getPromise(promise) {
		return this.promise;
	}
}
