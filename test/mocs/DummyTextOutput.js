export class DummyTextOutput {
	constructor(resolve) {
		this.resolve = resolve;
	}
	append(textInput) {
		this.value += textInput;
	}
	setMimeType(mimeType) {
		this.mimeType += mimeType;
		this.resolve({ value: this.value, mimetype: mimeType });
	}
}
