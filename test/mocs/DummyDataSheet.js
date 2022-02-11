import { DummyDataRange } from './DummyDataRange';
export class DummyDataSheet {
	constructor() {
		this.dataRange = new DummyDataRange();
	}
	getDataRange() {
		console.log('DummyDataSheet getDataRange');
		this.show();
		return this.dataRange;
	}
	appendRow(row) {
		console.log('DummyDataSheet appendRow!!!!!!!');
		if (!Array.isArray(row)) {
			console.error(row);
			return;
		}
		this.dataRange.getValues().push(row);
		this.show();
	}
	deleteRows(index, rowCount) {
		console.log('DummyDataSheet deleteRows');
		this.dataRange.getValues().splice(index, rowCount);
		this.show();
	}
	show() {
		this.dataRange.logMatrix();
	}
}
