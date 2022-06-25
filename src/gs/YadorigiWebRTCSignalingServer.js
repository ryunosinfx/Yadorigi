const regex = /[^-_.0-9a-zA-Z]+/g;
const duration = 1000 * 60 * 10;
// eslint-disable-next-line no-undef
const CS = null; //ContentService;
// eslint-disable-next-line no-undef
const SSA = null; //SpreadsheetApp;
const BOOL = 'bool';
const re_yyyy = /yyyy/;
const re_MM = /MM/;
const re_dd = /dd/;
const re_hh = /hh/;
const re_mm = /mm/;
const re_ss = /ss/;
class Logger {
	constructor(spreadsheet) {
		const ss = spreadsheet.getSheets();
		if (ss.length === 1) {
			spreadsheet.insertSheet(1);
		}
		this.instId = `${Date.now()}`.substring(6);
		this.sheets = spreadsheet.getSheets();
		this.sheet = this.sheets[1];
	}
	static unixTimeToDateFormat(unixtime = Date.now(), format = 'yyyy-MM-dd hh:mm:ss') {
		const d = new Date(unixtime);
		const year = d.getFullYear();
		const month = `0${d.getMonth() * 1 + 1}`.slice(-2);
		const day = `0${d.getDate()}`.slice(-2);
		const hour = `0${d.getHours()}`.slice(-2);
		const min = `0${d.getMinutes()}`.slice(-2);
		const sec = `0${d.getSeconds()}`.slice(-2);
		return format.replace(re_yyyy, year).replace(re_MM, month).replace(re_dd, day).replace(re_hh, hour).replace(re_mm, min).replace(re_ss, sec);
	}
	log(msg, instId) {
		console.log(msg, instId);
		this.write('info', msg, instId);
	}
	warn(msg, instId) {
		console.warn(msg);
		this.write('warn', msg, instId);
	}
	write(level = 'debag', msg, instId = this.instId) {
		const m = msg.message ? msg.message : typeof msg === 'object' ? JSON.stringify(msg) : `${msg}`;
		this.sheet.appendRow([Logger.unixTimeToDateFormat(), level, instId, m]);
	}
	init() {
		this.instId = `${Date.now()}`.substring(6);
	}
}
class Recode {
	constructor(group, fileName, data, hash) {
		if (Array.isArray(group) && group.length > 0) {
			this.group = group[0];
			this.fileName = group[1];
			this.data = group[2];
			this.hash = group[3];
			this.createTime = group[4];
			this.index = fileName;
		} else if (group && typeof group === 'object') {
			// console.warn('Recode group!!!!!!!!!!!!!!!!？？' + '/' + group.length);
			this.group = group.group;
			this.fileName = group.fileName;
			this.data = group.data;
			this.hash = group.hash;
			this.createTime = group.createTime;
			this.index = null;
		} else if (group) {
			this.group = group;
			this.fileName = fileName;
			this.data = data;
			this.hash = hash;
			this.createTime = Date.now();
			this.index = null;
		}
	}
	toArray() {
		return [this.group, this.fileName, this.data, this.hash, this.createTime];
	}
}
class SheetAddressor {
	constructor() {
		if (!SSA) {
			return;
		}
		const spreadsheet = SSA.getActiveSpreadsheet();
		const ss = spreadsheet.getSheets();
		this.logger = new Logger(spreadsheet);
		this.sheet = ss[0];
		this.matrix = this.sheet.getDataRange().getValues(); //受け取ったシートのデータを二次元配列に取得
	}
	async addRow(group, fileName, data, hash) {
		const record = new Recode(group, fileName, data, hash);
		this.findRow([], true);
		let count = 0;
		const where = [group, fileName];
		while (count < 100) {
			this.sheet.appendRow(record.toArray());
			this.matrix = this.sheet.getDataRange().getValues(); //受け取ったシートのデータを二次元配列に取得
			const wwaitTime = Math.floor(Math.random() * 10) * 100;
			await new Promise((resolve) => {
				setTimeout(() => {
					resolve();
				}, wwaitTime);
			});
			if (this.findRow(where)) {
				break;
			}
			count++;
		}
	}
	getLastRow() {
		const lastRowIndex = this.sheet.getDataRange().getLastRow() * 1 - 1; //対象となるシートの最終行を取得
		return new Recode(this.matrix[lastRowIndex]);
	}
	deleteRow(index) {
		return this.sheet.deleteRow(index);
	}
	findRow(where, isDelete) {
		this.logger.log('findRow Service get where');
		this.logger.log(where);
		const current = Date.now() - duration;
		const len = this.matrix.length;
		const whereCount = where.length;
		const scavengableList = [];
		let resultRow = null;
		let resultRowIndex = -1;
		for (let i = len - 1; i > -1; i--) {
			//SearchFromeEnd
			const row = this.matrix[i];
			const colsCount = row.length;
			let matchCount = 0;
			for (let j = 0; j < colsCount; j++) {
				const colValue = row[j];
				const condition = where[j];
				this.logger.log(`findRow SheetAddressor colValue:${colValue}/condition:${condition}/matchCount:${matchCount}/whereCount:${whereCount}/j:${j}`);
				matchCount += (whereCount > j && condition && condition === colValue) || (whereCount > j && !condition) ? 1 : 0;
			}
			if (matchCount === whereCount) {
				this.logger.log(`findRow SheetAddressor findRow row${typeof row}/${Array.isArray(row)}`);
				this.logger.log(row);
				resultRow = row;
				resultRowIndex = i;
			}
			const createTime = `${row[4]}` * 1;
			if (isDelete && !isNaN(createTime) && createTime < current) {
				this.logger.log(`findRow createTime:${createTime}/i:${i}`);
				scavengableList.push(i);
			}
		}
		const scvlen = scavengableList.length;
		for (let i = 0; i < scvlen; i++) {
			const index = scavengableList.shift() + 1;
			this.logger.log(`findRow index:${index}/i:${i}`);
			this.deleteRow(index);
			// break;
		}
		return resultRow ? new Recode(resultRow, resultRowIndex) : null;
	}
	getRowByIndex(index) {
		return (index !== 0 && index < 0) || index >= this.matrix.length ? null : new Recode(this.matrix[index]);
	}
}
const accessor = new SheetAddressor();
const logger = accessor.logger;

class YadorigiWebRTCSignalingServer {
	static doPost(event) {
		const { group, fileName, data, hash } = YadorigiWebRTCSignalingServer.parse(event);
		YadorigiWebRTCSignalingServer.save(group, fileName, data, hash);
		return YadorigiWebRTCSignalingServer.res(`{hash:${hash}}`);
	}
	static doGet(event) {
		const { group, fileName, command } = YadorigiWebRTCSignalingServer.parse(event);
		logger.log(`ServerClass doGet +${JSON.stringify(event)}`);
		logger.log(event.parameter);
		logger.log(event);
		if (command && group) {
			switch (command) {
				case 'get':
					logger.log(`command get group:${group}/fileName:${fileName}`);
					return YadorigiWebRTCSignalingServer.res(YadorigiWebRTCSignalingServer.get(group, fileName), 'data');
				case 'next':
					logger.log(`command next group:${group}/fileName:${fileName}`);
					return YadorigiWebRTCSignalingServer.res(YadorigiWebRTCSignalingServer.getNext(group, fileName), 'data');
				case 'hash':
					logger.log(`command hash group:${group}/fileName:${fileName}`);
					return YadorigiWebRTCSignalingServer.res(YadorigiWebRTCSignalingServer.hash(group, fileName), 'hash');
				case 'last':
					logger.log(`command last group:${group}/fileName:${fileName}`);
					return YadorigiWebRTCSignalingServer.res(YadorigiWebRTCSignalingServer.getLatest(group), 'data');
				default:
					logger.log(`Sorry, we are out of ${command}.`);
			}
		}
		return YadorigiWebRTCSignalingServer.res(null);
	}
	static parse(event) {
		return !event || !event.parameter
			? { group: null, fileName: null, data: null, hash: null, command: null }
			: { group: event.parameter.group, fileName: event.parameter.fileName, data: event.parameter.data, hash: event.parameter.hash, command: event.parameter.command };
	}
	static getLatest() {
		return accessor.getLastRow();
	}
	static getNext(group, fileName) {
		const result = accessor.findRow([group, fileName]);
		const index = result ? result.index : null;
		const targetIndex = index && typeof index === 'number' ? index - 1 : 1;
		return accessor.getRowByIndex(targetIndex);
	}
	static get(group, fileName) {
		return accessor.findRow([group, fileName]);
	}
	static hash(group, fileName) {
		const result = accessor.findRow([group, fileName]);
		return result ? result.hash : null;
	}
	static save(group, fileName, data, hash) {
		if (!group || !fileName || !data || !hash) {
			return;
		}
		accessor.addRow(
			YadorigiWebRTCSignalingServer.reap(group, 128),
			YadorigiWebRTCSignalingServer.reap(fileName, 128),
			YadorigiWebRTCSignalingServer.reap(data, 10240),
			YadorigiWebRTCSignalingServer.reap(hash, 90)
		);
	}
	static reap(value, max) {
		return `${value}`.split(regex).join('').substring(0, max);
	}
	static res(record, key) {
		const output = CS.createTextOutput('');
		const result = record && record[key] && record[key] !== 0 ? record[key] : record;
		output.append(typeof result === 'string' || typeof result === 'number' || typeof result === BOOL ? result : JSON.stringify(result));
		output.setMimeType(CS.MimeType.TEXT);
		logger.log(`res output:${JSON.stringify(output)}/record:${record}/key:${key}/result:${result}`);
		return output;
	}
}

// eslint-disable-next-line no-unused-vars
function doPost(event) {
	logger.init();
	try {
		const result = YadorigiWebRTCSignalingServer.doPost(event);
		logger.log(`doPost result:${JSON.stringify(result)}`);
		return result;
	} catch (e) {
		logger.warn(e);
		return CS.createTextOutput(`${e}`);
	}
}
// eslint-disable-next-line no-unused-vars
function doGet(event) {
	logger.init();
	try {
		const result = YadorigiWebRTCSignalingServer.doGet(event ? event : { parameter: { command: 'get', group: 'a', fileName: 'aaa' } });
		logger.log(`doGet result:${JSON.stringify(result)}`);
		return result;
	} catch (e) {
		logger.warn(e);
		return CS.createTextOutput(`${e}`);
	}
}
