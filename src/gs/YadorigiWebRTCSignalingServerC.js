const CacheService = { getDocumentCache: () => {} };
const cache = CacheService.getDocumentCache();

const parse = (event) => (!event || !event.parameter ? { group: null, fileName: null, data: null } : { group: event.parameter.group, fileName: event.parameter.fileName, data: event.parameter.data });
// eslint-disable-next-line no-unused-vars
function doPost(event) {
	console.log('=doPost=');
	try {
		const { group, fileName, data } = parse(event);
		const key = JSON.stringify([group, fileName]);
		const value = typeof data !== 'string' ? JSON.stringify(data) : data;
		return cache.put(key, value);
	} catch (e) {
		console.warn(e);
	}
}
// eslint-disable-next-line no-unused-vars
function doGet(event) {
	console.log('=doGet=');
	try {
		const { group, fileName } = parse(event);
		const key = JSON.stringify([group, fileName]);
		if (fileName && group) {
			const value = cache.get(key);
			if (value) {
				cache.remove(key);
			}
			return value;
		}
		return null;
	} catch (e) {
		console.warn(e);
	}
}