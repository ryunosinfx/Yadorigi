import { DummyDataSheet } from './DummyDataSheet.js';
const dummyDataSheet = new DummyDataSheet();
export class DummySpreadsheetApp {
	constructor() {}
	static getActiveSpreadsheet() {
		console.log('DummySpreadsheetApp getActiveSpreadsheet');
		return dummyDataSheet;
	}
}
