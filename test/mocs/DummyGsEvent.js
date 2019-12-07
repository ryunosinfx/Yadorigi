export class DummyGsEvent {
	constructor(inputJson) {
		try {
			console.log('DummyGsEvent constructor inputJson:' + inputJson);
			this.parameter = typeof inputJson === 'string' ? JSON.parse(inputJson) : inputJson ? inputJson : {};
		} catch (e) {
			console.warn(e);
			console.warn(inputJson);
			this.parameter = {};
		}
	}
	setPromise(promise) {
		console.log('DummyGsEvent setPromise promise:' + promise);
		this.promise = promise;
	}
	getPromise() {
		console.log('DummyGsEvent getPromise promise:' + this.promise);
		return this.promise;
	}
}
