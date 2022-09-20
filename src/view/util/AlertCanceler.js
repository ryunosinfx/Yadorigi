export class AlertCanceler {
	constructor() {}
	static cancel(win = window) {
		((proxied) => {
			win.alert = () => {
				// do something here
				console.log(proxied);
				return () => {}; //proxied.apply(this, arguments);
			};
		})(win.alert);
		((proxied) => {
			win.alert = () => {
				// do something here
				console.log(proxied);
				return () => {}; //proxied.apply(this, arguments);
			};
		})(win.confiem);
	}
}
