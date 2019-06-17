import Terser from 'terser';
export class BookMarkBuilder {
	constructor() {}
	static build(src) {
		if (src) {
			const compressed = Terser.minify(src);
			const bookmarklet = `javascript:(${compressed});`;
			return bookmarklet;
		} else {
			return 'javascript:(alert("empty!"));';
		}
	}
}
