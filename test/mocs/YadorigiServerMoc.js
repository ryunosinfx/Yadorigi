import { DummyFetcher } from './DummyFetcher';
import { DummySpreadsheetApp } from '../mocs/DummySpreadsheetApp';
import gs from '../../src/gs/YadorigiWebRTCSignalingServer';
global.SpreadsheetApp = DummySpreadsheetApp;
const server = new gs.YadorigiWebRTCSignalingServer();
const headerKeys = [];
const dummyFetcher = new DummyFetcher(headerKeys, server);
export class YadorigiServerMoc {
	static setMocToAdupter(yadorigiSignalingAdapter) {
		const yadorigiSignalingConnector = yadorigiSignalingAdapter.YadorigiSignalingConnector;
		yadorigiSignalingConnector.Fetcher = dummyFetcher;
	}
}
