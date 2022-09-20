import { MainView } from './view/MainView.js';
export class Main {
	constructor() {}
	static run() {
		window.onload = () => {
			console.log('');
			const instance = new Main();
			const main = new MainView(instance);
			main.build();
		};
	}
}
Main.run();
