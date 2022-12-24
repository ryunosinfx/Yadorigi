const MODE_R = 'readonly';
const MODE_RW = 'readwrite';
const cmdSelectAll = 'cmdSelectAll';
const cmdSelectByKey = 'cmdSelectByKey';
const cmdSelectByKeys = 'cmdSelectByKeys';
const cmdSelectFirstOne = 'cmdSelectFirstOne';
const cmdBulkInsertUpdate = 'cmdBulkInsertUpdate';
const cmdInsertUpdate = 'cmdInsertUpdate';
const cmdDeleteWithRange = 'cmdDeleteWithRange';
const cmdDelete = 'cmdDelete';
const cmdTruncate = 'cmdTruncate';
const cmdCreateStore = 'cmdCreateStore';
const cmdDeleteStore = 'cmdDeleteStore';
const cmdCreateIndex = 'cmdCreateIndex';
const cmdDeleteIndex = 'cmdDeleteIndex';
const cmdGetObjectStoreNames = 'cmdGetObjectStoreNames';
const ef = (e, regect = () => {}, id = '', logger = null) => {
	console.warn(`${id} ${e.message}`);
	console.warn(e.stack);
	if (logger && logger.log && logger !== console) {
		logger.log(`${id} ${e.message}`);
		logger.log(e.stack);
	}
	regect(e);
};
const onRequest = (request, resolve, reject, result) => {
	request.onsuccess = (event) => {
		console.log(event);
		resolve(result ? result : request.result);
	};
	request.onerror = (e) => {
		ef(e, reject);
	};
};
function throwNewError(callerName) {
	return (e) => {
		ef(e);
		console.error(callerName ? callerName : `/${e}`);
		throw new Error(e);
	};
}
const cb = async () => {};
const ua = navigator.userAgent.replace(/[.0-9]+/g, 'x');
const constant = {
	systemDbName: 'IDBWrapperSys',
	cacheObName: 'cacheTimes',
	dbName: 'IDBWrapper',
	ua: ua,
	domain: window.location,
	keypathName: 'pk',
};
const systemDbName = constant.systemDbName;
const cacheObName = constant.cacheObName;
const keypathName = constant.keypathName;
const core = new IndexeddbCore(systemDbName);
const currentDbName = constant.dbName;
export class idbw {
	constructor(dbName = currentDbName) {
		this.dbName = dbName;
	}
	async init() {}
	async getObAccessor(obName = currentDbName, keyPathName = 'pk') {
		return await IndexeddbAccessor.getInstance(obName, keyPathName, this.dbName);
	}
}
// const initQueue = [];
let dbName = constant.dbName;
// stock par db
const idbHelperMap = new Map();
const idbAccessors = new Map();
const keyPathName = 'pk';
class IndexeddbAccessor {
	#i = null;
	static SystemDBAccessor = null;
	constructor(objectStoreName, keypathName = constant.keypathName, isAutoincrements = false, currentDbName = dbName) {
		if (!idbHelperMap.has(currentDbName)) {
			this.#i = new IndexeddbHelper(currentDbName);
			idbHelperMap.set(currentDbName, this.#i);
		} else {
			this.#i = idbHelperMap.get(currentDbName);
		}
		this.keyPathName = keypathName;
		this.objectStoreName = objectStoreName;
		this.isAutoincrements = isAutoincrements;
	}
	static setDbName(dbNameNew) {
		dbName = dbNameNew;
	}
	static async getInstance(objectStoreName, keypathNamee, isAutoincrements = false, currentDbName = dbName, isCacheEnable = true) {
		const key = JSON.stringify([currentDbName, objectStoreName]);
		if (idbAccessors.has(key)) {
			return idbAccessors.get(key);
		}
		if (!IndexeddbAccessor.SystemDBAccessor) {
			IndexeddbAccessor.SystemDBAccessor = await IndexeddbAccessor.getInstance(cacheObName, keyPathName, false, systemDbName, false);
		}
		const inst = new IndexeddbAccessor(objectStoreName, keypathNamee, isAutoincrements, currentDbName);
		await inst.init(isCacheEnable);
		idbAccessors.set(key, inst);
		return inst;
	}
	init(isEnableCache = true) {
		this.isEnableCache = isEnableCache;
		const func = async (resolve, reject) => {
			await this.#i.init();
			await this.#i.createStore(this.objectStoreName, this.keyPathName, this.isAutoincrements).catch((e) => {
				ef(e, reject);
				throw e;
			});
			resolve(true);
		};
		return new Promise(func);
	}
	async dump() {
		return {};
	}
	async restore(dumpData) {
		console.log(dumpData);
		return;
	}
	async putByMap(dataMap, callback) {
		for (const key in dataMap) {
			const record = {
				data: dataMap[key],
			};
			record[this.keyPathName] = key;
			await this.putRecord(record, undefined, callback);
		}
	}
	async put(key, data, callback) {
		const record = {
			data,
		};
		record[this.keyPathName] = key;
		await this.putRecord(record, undefined, callback);
	}
	async putRecord(record, key, callback) {
		let storeData = record;
		if (record[this.keyPathName] === undefined) {
			storeData = {
				data: record,
			};
			storeData[this.keyPathName] = key;
			// } else if (key !== undefined) {
		}
		return await this.#i.insertUpdate(this.objectStoreName, this.keyPathName, storeData, callback, this.isEnableCache);
	}
	async getAsMap(keys) {
		return Array.isArray(keys) ? await this.#i.selectByKeys(this.objectStoreName, keys, this.isEnableCache) : null;
	}
	async getRecord(key) {
		return key ? await this.#i.selectByKey(this.objectStoreName, key, this.isEnableCache) : null;
	}
	async get(key) {
		const recordAsDefaultLoad = await this.getRecord(key);
		return recordAsDefaultLoad === undefined || recordAsDefaultLoad === null ? null : recordAsDefaultLoad.data;
	}
	async getAll() {
		return await this.#i.selectAll(this.objectStoreName, this.isEnableCache);
	}
	async delete(key) {
		return key ? await this.#i.delete(this.objectStoreName, key, this.isEnableCache) : null;
	}
	async remove(key) {
		return await this.delete(key);
	}
	async truncate() {
		return await this.#i.truncate(this.objectStoreName, this.isEnableCache);
	}
	async getOsNames() {
		return await this.#i.getObjectStoreNames();
	}
}
class IndexeddbHelper {
	constructor(dbName) {
		this.dbName = dbName;
		this.core = new IndexeddbCore(dbName);
		this.queue = [];
		this.lastTaskMode = null;
		this.lastLockTime = Date.now();
		this.counter = 0;
		this.isWithCache = true;
	}
	async init() {
		this.cacheManager = await OnMmoryCacheManager.getInstance(this.dbName);
	}
	beWithCache(isWithCache = true) {
		this.isWithCache = isWithCache;
	}
	async deQueue() {
		if (this.counter < 1) {
			this.counter++;
			if (this.counter > 1) {
				this.counter--;
				setTimeout(async () => {
					await this.deQueue();
				}, 0);
			} else {
				await this.deQueueExec();
				this.counter--;
				if (this.counter < 1 && this.queue.length > 0) {
					this.deQueue();
				}
			}
		}
	}
	deQueueExec() {
		const func = async (resolve, reject) => {
			const q = this.queue;
			while (q.length > 0) {
				const promises = [];
				const selectTasks = [];
				while (q.length > 0) {
					const task = q.shift();
					if (!task) {
						continue;
					}
					if (this.lastTaskMode !== task.mode || task.mode === MODE_RW) {
						//ここでそのまま発行、そして終わるまで待機
						if (promises.length > 0) {
							const results = await Promise.all(promises).catch((e) => {
								ef(e, reject);
								alert(e);
							});
							for (const index in results) {
								selectTasks[index].resolve(results[index]);
							}
							promises.splice(0, promises.length);
							this.executUpdateTask(task, resolve);
						} else {
							this.executUpdateTask(task, resolve);
						}
					} else {
						const promise = this.execCmd(task.cmd, task.data); //じゃんじゃん流していこう。
						promises.push(promise);
						selectTasks.push(task);
					}
					this.lastTaskMode = task.mode;
				}
				if (promises.length > 0) {
					const results = await Promise.all(promises).catch((e) => {
						ef(e, reject);
						alert(e);
					});
					for (const index in results) {
						selectTasks[index].resolve(results[index]);
					}
					promises.splice(0, promises.length);
					resolve();
				}
			}
		};
		return new Promise(func);
	}
	executSelectPromiseAndTask(task, resolve, updateTask) {
		return updateTask ? this.executUpdateTask(updateTask, resolve) : null;
	}
	executUpdateTask(task, resolve) {
		const promise = this.execCmd(task.cmd, task.data);
		promise.then((data) => {
			task.resolve(data);
			resolve(data);
		});
	}
	enQueueReadTask(cmd, data) {
		return this.enQueueTask(cmd, data, MODE_R);
	}
	enQueueWriteTask(cmd, data) {
		return this.enQueueTask(cmd, data, MODE_RW);
	}
	enQueueTask(cmd, data, mode) {
		return new Promise((resolve, reject) => {
			const task = { cmd, data, resolve, reject, mode };
			this.queue.push(task);
			this.deQueue();
		});
	}
	async getCache(cachekey, cmd, data, callback = cb, isCacheEnable) {
		if (!isCacheEnable) {
			return await callback();
		}
		const key = JSON.stringify([cmd, data]);
		const cache = await this.cacheManager.getCache(cachekey, key);
		if (cache) {
			return cache;
		}
		const result = await callback();
		this.cacheManager.updateCache(cachekey, key, result);
		return result;
	}
	clearCache(cachekey, isCacheEnable) {
		return isCacheEnable ? this.cacheManager.trancateCache(cachekey) : null;
	}
	async execCmd(cmd, data) {
		const cachekey = data.tableName;
		const isCacheEnable = data.isCacheEnable;
		if (cmdSelectAll === cmd) {
			return this.getCache(cachekey, cmd, data, async () => await this.core._selectAll(data.tableName, data.range, data.direction, data.offset, data.limmitCount, isCacheEnable), isCacheEnable);
		}
		if (cmdSelectByKey === cmd) {
			return this.getCache(cachekey, cmd, data, async () => await this.core._selectByKey(data.tableName, data.key), isCacheEnable);
		}
		if (cmdSelectByKeys === cmd) {
			return this.getCache(cachekey, cmd, data, async () => await this.core._selectByKeys(data.tableName, data.keys), isCacheEnable);
		}
		if (cmdSelectFirstOne === cmd) {
			return this.getCache(cachekey, cmd, data, async () => await this.core._selectFirstOne(data.tableName, data.range, data.direction), isCacheEnable);
		}
		if (cmdBulkInsertUpdate === cmd) {
			this.clearCache(cachekey, isCacheEnable);
			return await this.core._bulkInsertUpdate(data.tableName, data.keyPathName, data.data, data.callback);
		}
		if (cmdInsertUpdate === cmd) {
			this.clearCache(cachekey, isCacheEnable);
			return await this.core._insertUpdate(data.tableName, data.keyPathName, data.data, data.callback);
		}
		if (cmdDeleteWithRange === cmd) {
			this.clearCache(cachekey, isCacheEnable);
			return await this.core._deleteWithRange(data.tableName, data.range, data.condetions);
		}
		if (cmdDelete === cmd) {
			this.clearCache(cachekey, isCacheEnable);
			return await this.core._delete(data.tableName, data.keyPathValue);
		}
		if (cmdTruncate === cmd) {
			this.cacheManager.trancateCache(data.tableName);
			return await this.core._truncate(data.tableName);
		}
		if (cmdCreateStore === cmd) {
			return await this.core._createStore(data.tableName, data.keyPathName, data.isAutoIncrement);
		}
		if (cmdDeleteStore === cmd) {
			this.cacheManager.cacheClear();
			return await this.core._deleteStore(data.tableName);
		}
		if (cmdCreateIndex === cmd) {
			return await this.core._createIndex(data.tableName, data.keyPathName, data.isMultiColumns);
		}
		if (cmdDeleteIndex === cmd) {
			return await this.core._deleteIndex(data.tableName, data.indexName);
		}
		if (cmdGetObjectStoreNames === cmd) {
			return await this.core.getObjectStoreNames();
		}
	}
	async selectAllForwardMatch(tableName, key, direction, offset, limmitCount, isCacheEnable = true) {
		const nextKey = key.slice(0, -1) + String.fromCharCode(key.slice(-1).charCodeAt() + 1); //Select In-line-Keyで返す。
		const range = IDBKeyRange.bound(key, nextKey, false, true);
		return await this.enQueueReadTask(cmdSelectAll, { tableName, range, direction, offset, limmitCount, isCacheEnable });
	}
	async selectAll(tableName, range, direction, offset, limmitCount, isCacheEnable = true) {
		return await this.enQueueReadTask(cmdSelectAll, { tableName, range, direction, offset, limmitCount, isCacheEnable }); //Select In-line-Keyで返す。
	}
	async selectByKey(tableName, key, isCacheEnable = true) {
		return await this.enQueueReadTask(cmdSelectByKey, { tableName, key, isCacheEnable }); //Select In-line-return promise;Keyで返す。
	}
	async selectByKeys(tableName, keys, isCacheEnable = true) {
		return await this.enQueueReadTask(cmdSelectByKeys, { tableName, keys, isCacheEnable }); //Select In-line-return promise;Keyで返す。
	}
	async selectFirstOne(tableName, range, direction, isCacheEnable = true) {
		return await this.enQueueReadTask(cmdSelectFirstOne, { tableName, range, direction, isCacheEnable }); //Select FirstOnek
	}
	async bulkInsertUpdate(tableName, keyPathName, data, callback, isCacheEnable = true) {
		return await this.enQueueWriteTask(cmdBulkInsertUpdate, { tableName, keyPathName, data, callback, isCacheEnable });
	}
	async insertUpdate(tableName, keyPathName, data, callback, isCacheEnable = true) {
		return await this.enQueueWriteTask(cmdInsertUpdate, { tableName, keyPathName, data, callback, isCacheEnable });
	}
	async deleteWithRange(tableName, range, direction, isCacheEnable = true) {
		return await this.enQueueWriteTask(cmdDeleteWithRange, { tableName, range, direction, isCacheEnable });
	}
	async delete(tableName, keyPathValue, isCacheEnable = true) {
		return await this.enQueueWriteTask(cmdDelete, { tableName, keyPathValue, isCacheEnable });
	}
	async truncate(tableName, isCacheEnable = true) {
		return await this.enQueueWriteTask(cmdTruncate, { tableName, isCacheEnable });
	}
	async createStore(tableName, keyPathName, isAutoIncrement, isCacheEnable = true) {
		return await this.enQueueWriteTask(cmdCreateStore, { tableName, keyPathName, isAutoIncrement, isCacheEnable });
	}
	async deleteStore(tableName, isCacheEnable = true) {
		return await this.enQueueWriteTask(cmdDeleteStore, { tableName, isCacheEnable });
	}
	async creatIndex(tableName, keyPathName, isMultiColumns) {
		return await this.enQueueWriteTask(cmdCreateIndex, { tableName, keyPathName, isMultiColumns });
	}
	async deleteIndex(tableName, indexName) {
		return await this.enQueueWriteTask(cmdDeleteIndex, { tableName, indexName });
	}
	async getObjectStoreNames() {
		return await this.enQueueReadTask(cmdGetObjectStoreNames, {});
	}
}
class OnMmoryCacheManager {
	static cache = new Map();
	constructor(dbName) {
		this.maxSize = '';
		this.dbName = dbName;
		this.cache = new Map();
		this.tableNames = [];
		this.lastUpdateDateMap = new Map();
	}
	static async getInstance(dbName) {
		let instance = OnMmoryCacheManager.cache.get(dbName);
		if (instance) {
			return instance;
		}
		instance = new OnMmoryCacheManager(dbName);
		await instance.init();
		OnMmoryCacheManager.cache.set(dbName, instance);
		return instance;
	}
	async init() {
		await core._createStore(cacheObName, keypathName, false);
	}
	cacheClearWithDbUpdate(tableName) {
		const tableCache = this.cache.get(tableName);
		for (const index in tableCache) {
			delete tableCache[index];
		}
		this.registeCacherUpdateTime(tableName);
	}
	async registeCacherUpdateTime(tableName, now = Date.now()) {
		this.lastUpdateDateMap[tableName] = now;
		const dbTableKey = JSON.stringify([this.dbName, tableName]);
		const updateTimeData = { updateTime: now };
		updateTimeData[keypathName] = dbTableKey;
		core._insertUpdate(cacheObName, keypathName, updateTimeData);
	}
	cacheClear() {
		for (const tableName of this.tableNames) {
			const tableCache = this.cache.get(tableName);
			for (const index in tableCache) {
				delete tableCache[index];
			}
			this.cache.delete(tableName);
		}
	}
	async setCache(tableName, key, value) {
		if (!value || !value.data) {
			return;
		}
		const data = value.data;
		for (const key in data) {
			const elm = data[key];
			if (elm && elm.byteLength) {
				return;
			}
		}
		const dbTableKey = JSON.stringify([this.dbName, tableName]);
		const result = await core._selectByKey(cacheObName, dbTableKey);
		if (result && result.updateTime !== this.lastUpdateDateMap[tableName]) {
			this.cacheClearWithDbUpdate(tableName);
			return null;
		} else if (!this.lastUpdateDateMap[tableName] && result.updateTime) {
			this.registeCacherUpdateTime(tableName, result.updateTime);
		} else if (!result.updateTime) {
			this.registeCacherUpdateTime(tableName);
		}
		let tableCache = this.cache.get(tableName);
		if (!tableCache) {
			tableCache = {};
			this.tableNames.push(tableName);
			this.cache.set(tableName, tableCache);
		}
		tableCache[key] = value;
	}
	async getCache(tableName, key) {
		const dbTableKey = JSON.stringify([this.dbName, tableName]);
		const result = await core._selectByKey(cacheObName, dbTableKey);
		if (result && result.updateTime !== this.lastUpdateDateMap[tableName]) {
			this.cacheClearWithDbUpdate(tableName);
			return null;
		}
		const tableCache = this.cache.get(tableName);
		return tableCache ? tableCache[key] : null;
	}
	updateCache(tableName, key, data) {
		this.setCache(tableName, key, data);
	}
	trancateCache(tableName) {
		this.cacheClearWithDbUpdate(tableName);
	}
	removeCache(tableName, key) {
		const tableCache = this.cache.get(tableName);
		if (tableCache) {
			tableCache.delete(key);
		}
	}
	maintainCache() {}
}
class IndexeddbCore {
	constructor(dbName) {
		this.IDBKeyRange = window.IDBKeyRange;
		this.indexedDB = window.indexedDB;
		this.dbName = dbName;
		this.keyPathMap = {};
		this.db = null;
		this.lastVersion = null;
		this.isUpdateOpen = false;
		this.timer = null;
		this.isDBClosed = true;
	}
	getOpenDB(newVersion) {
		return new Promise((resolve, reject) => {
			this.lastVersion = newVersion;
			if (this.lastVersion && this.db) {
				this.db.close();
				this.isUpdateOpen = true;
				// this.cacheClear();
			} else if (this.db && this.isDBClosed === false) {
				resolve(this.db);
				return;
			} else {
				this.isUpdateOpen = this.lastVersion ? true : false;
			}
			const request = this.indexedDB.open(this.dbName, newVersion);
			request.onsuccess = (event) => {
				this.db = event.target.result;
				this.isDBClosed = false;
				resolve(this.db);
			};
			request.onupgradeneeded = (event) => {
				this.db = event.target.result;
				this.isDBClosed = false;
				resolve(this.db);
			};
			request.onabort = (e) => {
				ef(e, resolve);
			};
			request.onerror = (e) => {
				ef(e, reject);
			};
		});
	}
	closeDB() {
		if (this.isUpdateOpen) {
			this.beCloseDb();
		} else {
			if (this.timer) {
				clearTimeout(this.timer);
			}
			this.timer = setTimeout(() => {
				this.beCloseDb();
			}, 1000);
		}
	}
	beCloseDb() {
		this.db.close();
		this.isDBClosed = true;
	}
	getObjectStore(db, tableName, tables, mode) {
		const transaction = db.transaction(tables, mode);
		const func = (event) => {
			console.log(event);
			this.closeDB();
		};
		transaction.oncomplete = func;
		transaction.onerror = func;
		return transaction.objectStore(tableName);
	}
	getKeyPathByMap(tableName) {
		return this.keyPathMap[tableName];
	}
	async getKeyPath(tableName) {
		const keyPathName = this.getKeyPathByMap();
		if (keyPathName !== undefined && keyPathName !== null) {
			return keyPathName;
		}
		const db = await this.getOpenDB().catch(throwNewError('getKeyPath->getOpenDB'));
		const objectStore = this.getObjectStore(db, tableName, [tableName], MODE_R);
		this.closeDB();
		const keyPathNameCurrent = objectStore.keyPath;
		this.keyPathMap[tableName] = keyPathNameCurrent;
		return keyPathNameCurrent;
	}
	async getCurrentVersion() {
		const db = await this.getOpenDB().catch(throwNewError('getCurrentVersion->getOpenDB'));
		const version = db.version;
		this.closeDB();
		return version;
	}
	//public
	async selectAll(payload) {
		const { tableName, range, condetions } = payload;
		return await this._selectAll(tableName, range, condetions);
	}
	//Select In-line-Keyで返す。
	async _selectAll(tableName, range, direction, offset, count, callback) {
		const db = await this.getOpenDB().catch(throwNewError(`_selectAll->getOpenDB tableName:${tableName}`));
		const objectStore = this.getObjectStore(db, tableName, [tableName], MODE_R);
		return await this._selectAllExecute(objectStore, range, false, offset, count, callback);
	}
	_selectAllExecute(objectStore, range, isGetFirstOne, offset, count, callback) {
		return new Promise((resolve, reject) => {
			const isValidCallBack = typeof offset === 'function';
			const isOnLimit = typeof offset === 'number' && typeof count === 'number' && offset > 0 && count > 0;
			const endCount = offset + count;
			const list = [];
			let rowCount = 0;
			const req = range ? objectStore.openCursor() : objectStore.openCursor(range);
			req.onsuccess = (event) => {
				const cursor = event.target.result;
				if (cursor) {
					const value = cursor.value;
					if (isValidCallBack && !callback(value)) {
						cursor.continue();
						return;
					}
					if (isOnLimit) {
						if (offset > rowCount) {
							rowCount++;
							cursor.continue();
							return;
						} else if (endCount < rowCount) {
							resolve(list);
							return;
						}
					}
					// console.log(cursor.value)
					list.push(value);
					if (isGetFirstOne) {
						resolve(list[0]);
						return;
					}
					rowCount++;
					cursor.continue();
				} else {
					resolve(list);
				}
			};
			req.onerror = (e) => {
				ef(e, reject);
			};
		});
	}
	async selectByKey(payload) {
		return await this._selectByKey(payload.tableName, payload.key);
	}
	async _selectByKey(tableName, key) {
		const db = await this.getOpenDB().catch(throwNewError(`_selectByKey->getOpenDB tableName:${tableName}`)); //Select In-line-return promise;Keyで返す。
		return await this._selectByKeyOnTran(db, tableName, key).catch(throwNewError(`_selectByKey->_selectByKeyOnTran tableName:${tableName}/mode:${MODE_R}`));
	}
	async _selectByKeyOnTran(db, tableName, key, tables, mode = MODE_R) {
		const objectStore = this.getObjectStore(db, tableName, [tableName], mode);
		return await this.getOnOS(objectStore, key);
	}
	async getOnOS(objectStore, key) {
		return new Promise((resolve, reject) => {
			if (!key) {
				resolve(null);
			}
			const request = objectStore.get(key); //keyはsonomama
			onRequest(request, resolve, reject);
		});
	}
	async selectByKeys(payload) {
		return await this._selectByKeys(payload.tableName, payload.keys);
	}
	async _selectByKeys(tableName, keys) {
		const db = await this.getOpenDB().catch(throwNewError(`_selectByKeys->getOpenDB tableName:${tableName}`)); //Select In-line-return promise;Keyで返す。
		return await this._selectByKeysOnTran(db, tableName, keys).catch(throwNewError(`_selectByKeys->_selectByKeyOnTran tableName:${tableName}`));
	}
	async _selectByKeysOnTran(db, tableName, keys) {
		const objectStore = this.getObjectStore(db, tableName, [tableName], MODE_R);
		return await this._selectByKeysOnTranExec(objectStore, keys, tableName);
	}
	async _selectByKeysOnTranExec(objectStore, keys) {
		const retMap = {};
		for (const key of keys) {
			retMap[key] = await this.getOnOS(objectStore, key);
		}
		return retMap;
	}
	async selectFirstOne(payload) {
		return await this._selectFirstOne(payload.tableName, payload.range, payload.direction);
	}
	async _selectFirstOne(tableName, range, direction) {
		const db = await this.getOpenDB().catch(throwNewError(`_selectFirstOne->getOpenDB tableName:${tableName}/direction:${direction}`));
		const objectStore = this.getObjectStore(db, tableName, [tableName], MODE_R);
		return await this._selectAllExecute(objectStore, range, true);
	}
	async insertUpdate(payload) {
		const keyPathName = this.getKeyPathByMap();
		return await this._insertUpdate(payload.tableName, keyPathName, payload.data, payload.callback).catch(throwNewError(`insertUpdate->_insertUpdate tableName:${payload.tableName}`));
	}
	async bulkInsertUpdate(tableName, keyPathName, data, callback) {
		for (const record of data) {
			await this._insertUpdate(tableName, keyPathName, record, callback);
		}
	}
	async _bulkInsertUpdate(tableName, keyPathName, data, callback = cb) {
		const dataList = [];
		const keys = [];
		for (const record of data) {
			const key = record[keyPathName];
			dataList.push({ key, data: record });
			keys.push(key);
		}
		const db = await this.getOpenDB().catch(throwNewError(`_insertUpdate->getOpenDB tableName:${tableName}`));
		const tables = IdbUtil.currentTables(tableName);
		const objectStore = this.getObjectStore(db, tableName, tables, MODE_RW);
		const dataMap = await this._selectByKeysOnTranExec(objectStore, keys, tableName);
		await this._bulkUpdateExecute(objectStore, dataList, dataMap);
		await this._bulkInsertExecute(objectStore, dataList, dataMap);
		callback();
	}
	_bulkInsertExecute(objectStore, dataList, dataMap) {
		const promises = [];
		for (const { key, data } of dataList) {
			if (dataMap[key]) {
				continue;
			}
			const promise = this.addToOS(objectStore, key, data);
			promises.push(promise);
		}
		return Promise.all(promises);
	}
	_bulkUpdateExecute(objectStore, dataList, dataMap) {
		const promises = [];
		for (const { key, data } of dataList) {
			if (!dataMap[key]) {
				continue;
			}
			const promise = this.putToOS(objectStore, key, data);
			promises.push(promise);
		}
		return Promise.all(promises);
	}
	addToOS(objectStore, key, data) {
		return new Promise((resolve, reject) => {
			const request = objectStore.add(data); //,keyPath
			onRequest(request, resolve, reject, { data, key });
		});
	}
	putToOS(objectStore, key, data) {
		return new Promise((resolve, reject) => {
			const request = objectStore.put(data); //,keyPath
			onRequest(request, resolve, reject, { data, key });
		});
	}
	async _insertUpdate(tableName, keyPathName, data, callback = cb) {
		const key = data[keyPathName];
		const db = await this.getOpenDB().catch(throwNewError(`_insertUpdate->getOpenDB tableName:${tableName}`));
		const tables = IdbUtil.currentTables(tableName);
		const value = await this._selectByKeyOnTran(db, tableName, key, tables, MODE_RW).catch(throwNewError(`_insertUpdate->_selectByKeyOnTran tableName:${tableName}/MODE_RW`));
		callback(value, data);
		const result = await (value === undefined ? this._insertExecute(db, tableName, key, data, tables) : this._updateExecute(db, tableName, key, data, tables)).catch(
			throwNewError(`_insertUpdate->_insertExecute tableName:${tableName}`)
		);
		return result;
	}
	async _insertExecute(db, tableName, key, data, tables) {
		const objectStore = this.getObjectStore(db, tableName, tables, MODE_RW);
		return await this.addToOS(objectStore, key, data);
	}
	async _updateExecute(db, tableName, key, data, tables) {
		const objectStore = this.getObjectStore(db, tableName, tables, MODE_RW);
		return await this.putToOS(objectStore, key, data);
	}
	async deleteWithRange(payload) {
		return await this._deleteWithRange(payload.tableName, payload.range, payload.condetions);
	}
	async _deleteWithRange(tableName, range, condetions) {
		const db = await this.getOpenDB().catch(throwNewError(`_deleteWithRange->getOpenDB tableName:${tableName}`));
		const tables = IdbUtil.currentTables(tableName);
		return await this._deleteWithRangeExecute(db, tableName, range, condetions, tables);
	}
	_deleteWithRangeExecute(db, tableName, range, condetions, tables) {
		return new Promise((resolve, reject) => {
			const objectStore = this.getObjectStore(db, tableName, tables, MODE_RW);
			const request = objectStore.openCursor(range);
			request.onsuccess = (event) => {
				const cursor = event.target.result;
				const list = [];
				if (cursor) {
					const value = cursor.value;
					if (IdbUtil.isMutch(value, condetions)) {
						const key = cursor.key;
						const or = objectStore.delete(key);
						or.onsuccess = (event) => {
							console.log(event);
							list.push(value);
						};
						or.onerror = (e) => {
							ef(e);
						};
					}
					cursor.continue();
				} else {
					resolve(list);
				}
			};
			request.onerror = (e) => {
				ef(e, reject);
			};
		});
	}
	async delete(payload) {
		return await this._delete(payload.tableName, payload.key);
	}
	async _delete(tableName, keyPathValue) {
		const db = await this.getOpenDB().catch(throwNewError(`_delete->getOpenDB tableName:${tableName}`));
		const tables = IdbUtil.currentTables(tableName);
		return await this._deleteOnTran(db, tableName, keyPathValue, tables);
	}
	_deleteOnTran(db, tableName, key, tables) {
		return new Promise((resolve, reject) => {
			const objectStore = this.getObjectStore(db, tableName, tables, MODE_RW);
			const request = objectStore.delete(`${key}`);
			onRequest(request, resolve, reject, { tableName, key });
		});
	}
	async truncate(payload) {
		return await this._truncate(payload.tableName);
	}
	async _truncate(tableName) {
		const db = await this.getOpenDB().catch(throwNewError(`_truncate->getOpenDB tableName:${tableName}`));
		const tables = IdbUtil.currentTables(tableName);
		return await this._truncateExecute(db, tableName, tables);
	}
	_truncateExecute(db, tableName, tables) {
		return new Promise((resolve, reject) => {
			const objectStore = this.getObjectStore(db, tableName, tables, MODE_RW);
			const request = objectStore.clear();
			onRequest(request, resolve, reject);
		});
	}
	async getObjectStoreNames() {
		const db = await this.getOpenDB().catch(throwNewError('getObjectStoreNames->getOpenDB'));
		const names = db.objectStoreNames;
		this.closeDB();
		return names;
	}
	async isExistsObjectStore(tableName) {
		return (await this.getObjectStoreNames()).includes(tableName);
	}
	async createIndex(tableName, keyPath, isMultiEntry) {
		const db = await this.getOpenDB().catch(throwNewError('getObjectStoreNames->getOpenDB'));
		const names = db.objectStoreNames;
		this._createIndex(db, tableName, keyPath, isMultiEntry);
		this.closeDB();
		return names;
	}
	_createIndex(db, tableName, keyPath, isMultiEntry) {
		const tables = IdbUtil.currentTables(tableName);
		const objectStore = this.getObjectStore(db, tableName, tables, MODE_RW);
		const indexName = `${tableName}-${keyPath}`;
		return objectStore.createIndex(indexName, keyPath, { multiEntry: !!isMultiEntry });
	}
	async getIndexNames(tableName) {
		const tables = IdbUtil.currentTables(tableName);
		const db = await this.getOpenDB().catch(throwNewError('getObjectStoreNames->getOpenDB'));
		const objectStore = this.getObjectStore(db, tableName, tables, MODE_RW);
		const names = objectStore.indexNames;
		this.closeDB();
		return names;
	}
	async deleteIndex(tableName, keyPath) {
		const db = await this.getOpenDB().catch(throwNewError(`getObjectStoreNames->getOpenDB tableName:${tableName}`));
		await this._deleteIndex(db, tableName, keyPath);
		this.closeDB();
	}
	_deleteIndex(db, tableName, keyPath) {
		const tables = IdbUtil.currentTables(tableName);
		const objectStore = this.getObjectStore(db, tableName, tables, MODE_RW);
		const indexName = `${tableName}-${keyPath}`;
		const names = objectStore.indexNames;
		return names.includes(indexName) ? objectStore.deleteIndex(indexName) : null;
	}
	async createStore(payload) {
		return await this._createStore(payload.tableName, payload.keyPathName, payload.isAutoIncrement);
	}
	async _createStore(tableName, keyPathName, isAutoIncrement) {
		if ((await this.isExistsObjectStore(tableName)) === false) {
			const newVersion = (await this.getCurrentVersion()) + 1;
			const db = await this.getOpenDB(newVersion).catch(throwNewError(`_createStore->getOpenDB tableName:${tableName}/isAutoIncrement:${isAutoIncrement}`));
			if (db.objectStoreName.includes(tableName) === false) {
				db.createObjectStore(tableName, { keyPath: keyPathName });
			}
			this.closeDB();
		}
	}
	async dropStore(payload) {
		return await this._dropStore(payload.tableName);
	}
	async _dropStore(tableName) {
		const newVersion = (await this.getCurrentVersion()) + 1;
		const db = await this.getOpenDB(newVersion).catch(throwNewError(`_dropStore->getOpenDB tableName:${tableName}`));
		db.deleteObjectStore(tableName);
		this.closeDB();
	}
}
class IdbUtil {
	static currentTables(table, tabels) {
		return tabels ? tabels : [table];
	}
	static isMutch(value, condetions) {
		if (condetions === undefined || condetions === null) {
			return false;
		}
		if (Array.isArray(condetions)) {
			for (const condition of condetions) {
				if (IdbUtil.isMutch(value, condition)) {
					return true;
				}
			}
			return false;
		} else {
			for (const key in condetions) {
				const condition = condetions[key];
				if (typeof condition === 'object') {
					if (IdbUtil.isMutch(value, condition)) {
						return true;
					}
				} else if (value[key] !== condition) {
					return false;
				}
			}
			return true;
		}
	}
	static makeKeyRange(start, end, isNotEqualStart, isNotEqualEnd) {
		return isNotEqualStart === undefined && isNotEqualEnd === undefined ? IDBKeyRange.bound(start, end, false, false) : IDBKeyRange.bound(start, end, isNotEqualStart, isNotEqualEnd);
	}
	static makeKeyRangeUpper(start, isNotEqualStart) {
		return isNotEqualStart !== true ? IDBKeyRange.upperBound(start) : IDBKeyRange.upperBound(start, isNotEqualStart);
	}
	static makeKeyRangeLower(end, isNotEqualEnd) {
		return isNotEqualEnd !== true ? IDBKeyRange.lowerBound(end) : IDBKeyRange.lowerBound(end, isNotEqualEnd);
	}
	static makeKeyRangeOnly(only) {
		return IDBKeyRange.only(only);
	}
	//IDを生成
	static buildKeyPath(key1, key2, key3, key4, key5) {
		const array = [];
		if (key1 !== undefined) {
			array.push(`${key1}`.split('&').join('&amp;').split('.').join('&#046;'));
		}
		if (key2 !== undefined) {
			array.push(`${key2}`.split('&').join('&amp;').split('.').join('&#046;'));
		}
		if (key3 !== undefined) {
			array.push(`${key3}`.split('&').join('&amp;').split('.').join('&#046;'));
		}
		if (key4 !== undefined) {
			array.push(`${key4}`.split('&').join('&amp;').split('.').join('&#046;'));
		}
		if (key5 !== undefined) {
			array.push(`${key5}`.split('&').join('&amp;').split('.').join('&#046;'));
		}
		return array.join('');
	}
}
