import { DummyDataSheet } from './DummyDataSheet';
export class DummySpreadsheetApp {
	constructor() {}
	static getActiveSpreadsheet() {
		console.log('DummySpreadsheetApp getActiveSpreadsheet');
		return new DummyDataSheet();
	}
}
