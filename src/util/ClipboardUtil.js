export class ClipboardUtil {
	static async copy(
		text,
		func = () => {
			console.log('colied!');
		}
	) {
		await navigator.clipboard.writeText(typeof text === 'object' ? JSON.stringify(text) : text);
		func();
	}
	static async past(
		func = () => {
			console.log('past!');
		}
	) {
		const result = navigator.clipboard.readText ? await navigator.clipboard.readText() : '';
		func();
		return result;
	}
}
