import { DummyTextOutput } from './DummyTextOutput.js';
import { DummyGsEvent } from './DummyGsEvent.js';
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
		const promise = new Promise((resolve) => {
			const textOutput = new DummyTextOutput(resolve);
			promisMap.set(server, { event, textOutput });
		});
		event.setPromise(promise);
		return event;
	}
	static getPromise(server) {
		return promisMap.get(server);
	}
	static createTextOutput(text, server) {
		const events = promisMap.get(server);
		console.log(`DummyContentService createTextOutput events:${events}`);
		if (events) {
			const { event, textOutput } = events;
			console.log(`DummyContentService createTextOutput event:${event}`);
			return textOutput;
		}
		return;
	}
}
