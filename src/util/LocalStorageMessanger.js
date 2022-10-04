const PREFIX = '_A_';
const cache = {};
export class LocalStorageMessanger {
	static a() {}
	static send(prefix, msg, logger = console) {
		logger.log('=====SEND=A=========');
		const message = typeof msg === 'string' ? msg : JSON.stringify(msg);
		logger.log(`send prefix:"${prefix}"/message:${message}`);
		const key = `${PREFIX + prefix}_${Date.now()}`;
		window.localStorage.setItem(key, message);
		logger.log('=====SEND=B=========');
	}
	static setOnRecieve(prefix, func, logger = console) {
		logger.log(`setOnRecieve prefix:${prefix}`);
		cache.listene = (event) => {
			logger.log(`OnRecieve prefix:${prefix} "${JSON.stringify(event)}"`);
			logger.log(event);
			const key = event.key;
			logger.log(`key:${key}`);
			const px = `${PREFIX + prefix}_`;
			logger.log(px);
			if (key.indexOf(px) === 0) {
				logger.log(`OnRecieve callfunc prefix:${prefix}`);
				func(prefix, event);
			}
		};
		window.addEventListener('storage', cache.listene);
	}
	static removeOnRecieve() {
		window.removeEventListener('storage', cache.listene);
	}
}
