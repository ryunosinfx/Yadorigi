import Terser from 'terser';
//javascript:(function(){if(typeof this.tgt==='undefined')this.tgt=document.querySelectorAll('input[type="password"]');var nit=(this.tgt.item(0).getAttribute('type')=='password')?'text':'password';for(var i=0;i<this.tgt.length;i++)this.tgt.item(i).setAttribute('type',nit);})();
const prefix = 'javascript:(()=>{';
const suffix = '})()';
export class BookmarkletMaker {
	constructor() {}
	convert(scriptCode) {
		if (scriptCode && typeof scriptCode === 'string') {
			const result = Terser.minify(scriptCode);
			if (result.error) {
				return result.error;
			}
			const marklet = prefix + encodeURIComponent(result.code) + suffix;
			const length = marklet.length;
			console.log(`BookmarkletMaker convert marklet.length:${length}`);
			return marklet;
		}
		console.log(scriptCode);
		return '';
	}
}
