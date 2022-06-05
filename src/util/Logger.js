export class Logger {
	constructor(elm) {
		this.elm = elm;
		elm.style.whiteSpace = 'pre';
		elm.style.maxWidth = '100vw';
	}
	log(msg) {
		console.log(msg);
		const txt = typeof msg === 'object' ? JSON.stringify(msg) : msg;
		const current = this.elm.textContent;
		this.elm.textContent = `${current}
${txt}`;
	}
	warn(msg) {
		console.warn(msg);
		const txt = typeof msg === 'object' ? JSON.stringify(msg) : msg;
		const current = this.elm.textContent;
		this.elm.textContent = `${current}
${txt}`;
	}
}
