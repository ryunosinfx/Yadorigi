const CacheService = { getUserCache: () => {} };
const ContentService = {
	createTextOutput: () => ({ setMimeType: () => {}, setContent: () => {} }),
};
const cache = CacheService.getUserCache();

const parse = (event) => (!event || !event.parameter ? { group: null, fileName: null, data: null } : { group: event.parameter.group, fileName: event.parameter.fileName, data: event.parameter.data });
// eslint-disable-next-line no-unused-vars
function doPost(event) {
	console.log('=doPost=');
	const out = ContentService.createTextOutput();
	out.setMimeType(ContentService.MimeType.JSON);
	try {
		const { group, fileName, data } = parse(event);
		const key = JSON.stringify([group, fileName]);
		// out.setContent(JSON.stringify({ message: "OK"+key }));
		const value = typeof data !== 'string' ? JSON.stringify(data) : data;
		cache.put(key, value);
		const nv = cache.get(key);
		out.setContent(JSON.stringify({ message: nv, pre: value, event }));
	} catch (e) {
		out.setContent(JSON.stringify({ message: 'ERROR', e: e.message, stack: e.stack }));
	}
	return out;
}
// eslint-disable-next-line no-unused-vars
function doGet(event) {
	console.log('=doGet=');

	const out = ContentService.createTextOutput();

	//Mime TypeをJSONに設定
	out.setMimeType(ContentService.MimeType.JSON);
	//JSONテキストをセットする
	try {
		const { group, fileName } = parse(event);
		const key = JSON.stringify([group, fileName]);
		// out.setContent(JSON.stringify({ message: "OK"+key }));
		if (fileName && group) {
			const value = cache.get(key);
			if (value) {
				cache.remove(key);
			}
			out.setContent(JSON.stringify({ message: value }));
		} else {
			out.setContent(JSON.stringify({ message: 'OK' }));
		}
	} catch (e) {
		out.setContent(JSON.stringify({ message: 'ERROR', e: e.message, stack: e.stack }));
	}
	return out;
}
