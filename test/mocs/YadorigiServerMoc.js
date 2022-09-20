import { DummyFetcher } from './DummyFetcher.js';
import { DummySpreadsheetApp } from '../mocs/DummySpreadsheetApp.js';
import { DummyContentService } from '../mocs/DummyContentService.js';
import { global } from './global.js';
// eslint-disable-next-line no-undef
global.SpreadsheetApp = DummySpreadsheetApp;
// eslint-disable-next-line no-undef
global.ContentService = DummyContentService;
// eslint-disable-next-line no-undef
global.ContentService.MimeType = { TEXT: 'text/plane', XML: 'text/xml' };
const headerKeys = [];
const dummyFetcher = new DummyFetcher(headerKeys);
export class YadorigiServerMoc {
	static setMocToAdupter(yadorigiSignalingAdapter) {
		const yadorigiSignalingConnector = yadorigiSignalingAdapter.YadorigiSignalingConnector;
		yadorigiSignalingConnector.Fetcher = dummyFetcher;
	}
}
