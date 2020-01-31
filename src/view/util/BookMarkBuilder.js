import Terser from 'terser';
export class BookMarkBuilder {
	constructor() {}
	static build(src) {
		if (src) {
			const compressed = Terser.minify(src);
			console.log(compressed);
			const bookmarklet = `javascript:((()=>{${compressed.code}})());`;
			return bookmarklet;
		} else {
			return 'javascript:(alert("empty!"));';
		}
	}
}
