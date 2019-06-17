import { MainView } from './view/MainView';
export class Main {
	constructor() {}
	static run() {
		window.onload = () => {
			console.log('');
			const main = new MainView();
			main.build();
		};
	}
}
Main.run();
