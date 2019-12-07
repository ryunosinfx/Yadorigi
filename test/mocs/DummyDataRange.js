export class DummyDataRange {
	constructor() {
		this.matrix = [];
	}
	getValues() {
		console.log('DummyDataRange getValues');
		return this.matrix;
	}
	getLastRow() {
		console.log('DummyDataRange getLastRow');
		if (this.matrix.length < 1) {
			return null;
		}
		return this.matrix.length - 1;
	}
	logMatrix() {
		console.log(this.matrix);
	}
}
