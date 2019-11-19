import { DummyFetcher } from './DummyFetcher';
import { DummySpreadsheetApp } from '../mocs/DummySpreadsheetApp';
import { DummyContentService } from '../mocs/DummyContentService';
global.SpreadsheetApp = DummySpreadsheetApp;
global.ContentService = DummyContentService;
const headerKeys = [];
const dummyFetcher = new DummyFetcher(headerKeys);
export class YadorigiServerMoc {
	static setMocToAdupter(yadorigiSignalingAdapter) {
		const yadorigiSignalingConnector = yadorigiSignalingAdapter.YadorigiSignalingConnector;
		yadorigiSignalingConnector.Fetcher = dummyFetcher;
	}
}
