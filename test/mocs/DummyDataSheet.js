import { DummyDataRange } from './DummyDataRange';
import { isAbsolute } from 'path';
import { isArray } from 'util';
export class DummyDataSheet {
	constructor() {
		this.dataRange = new DummyDataRange();
	}
	getDataRange() {
		console.log('DummySpreadsheetApp getActiveSpreadsheet');
		return this.dataRange;
	}
	appendRow(row) {
		console.log('DummySpreadsheetApp appendRow!');
		if ((!Array, isArray(row))) {
			console.error(row);
			return;
		}
		this.dataRange.getValues.push(row);
	}
	deleteRows(index, rowCount) {
		console.log('DummySpreadsheetApp deleteRows');
		this.dataRange.getValues.splice(index, rowCount);
	}
}
