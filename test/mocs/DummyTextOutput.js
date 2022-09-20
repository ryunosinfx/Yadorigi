export class DummyTextOutput {
	constructor(resolve) {
		this.resolve = resolve;
		this.value = '';
		this.mimeType = '';
	}
	append(textInput) {
		console.log(`DummyTextOutput append textInput:${textInput}/${typeof textInput}`);
		this.value += textInput ? textInput : '';
	}
	setMimeType(mimeType) {
		this.mimeType += mimeType;
		console.log(`DummyTextOutput setMimeType mimeType:${mimeType}`);
		this.resolve({ value: this.value, mimetype: mimeType });
	}
}
