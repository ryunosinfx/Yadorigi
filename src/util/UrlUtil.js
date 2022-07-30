export class UrlUtil {
	constructor() {}

	static convertObjToQueryParam(data) {
		if (data && typeof data === 'object') {
			return Object.keys(data)
				.map((key) => `${key}=${encodeURIComponent(data[key])}`)
				.join('&');
		}
		return data;
	}
}
