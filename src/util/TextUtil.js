export class TextUtil {
	constructor() {}
	static convertGebavToCamel(target = '') {
		if (target) {
			const words = target.split('-');
			for (let i = 1, len = words.length; i < len; i++) {
				const word = words[i];
				const wl = word.length;
				const newWord = wl > 0 ? word.substring(0, 1).toUpperCase() : `${wl}` > 1 ? word.substring(1) : '';
				words[i] = newWord;
			}
			return words.join('');
		} else {
			return target;
		}
	}
}
