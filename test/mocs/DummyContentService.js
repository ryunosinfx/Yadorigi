import { DummyTextOutput } from './DummyTextOutput';
import { DummyGsEvent } from './DummyGsEvent';
const data = {};
const promisMap = new Map();
export class DummyContentService {
	constructor() {}
	static setPromise(resolve, reject) {
		data.resolve = resolve;
		data.reject = reject;
	}
	static createGsEvent(inputJson, server) {
		const event = new DummyGsEvent(inputJson);
		const promise = new Promise(resolve => {
			const textOutput = new DummyTextOutput(resolve);
			promisMap.set(server, { event, textOutput });
		});
		return event;
	}
	static getPromise(server) {
		return promisMap.get(server);
	}
	static createTextOutput(text, server) {
		const events = promisMap.get(server);
		if (events) {
			const { event, textOutput } = events;
			return textOutput;
		}
		return;
	}
}
