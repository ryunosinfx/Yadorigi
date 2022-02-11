const regex = /[^-_\.0-9a-zA-Z]+/g;
const duration = 1000 * 60 * 10;
class Recode {
	constructor(group, fileName, data, hash) {
		if (!group) {
		} else if (typeof group === 'object' && group.length > 0) {
			this.group = group[0];
			this.fileName = group[1];
			this.data = group[2];
			this.hash = group[3];
			this.createTime = group[4];
			this.index = fileName;
		} else if (typeof group === 'object') {
			this.group = group.group;
			this.fileName = group.fileName;
			this.data = group.data;
			this.hash = group.hash;
			this.createTime = group.createTime;
			this.index = null;
		} else {
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
		this.sheet = globalThis.SpreadsheetApp.getActiveSpreadsheet();
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
			const waitTime = Math.floor(Math.random() * 10) * 100;
			await new Promise((resolve) => {
				setTimeout(() => {
					resolve();
				}, waitTime);
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
			const createTime = (row[4] + '') * 1;
			if (isDelete && !isNaN(createTime) && createTime < current) {
				scavengableList.push(i);
			}
			if (resultRow) {
				continue;
			}
			for (let j = 0; j < colsCount && j < whereCount; j++) {
				const colValue = row[j];
				const condition = where[j];
				if ((condition && condition === colValue) || !condition) {
					matchCount++;
				} else {
					break;
				}
			}
			if (matchCount === whereCount) {
				resultRow = row;
				resultRowIndex = i;
			}
		}
		const scvlen = scavengableList.length;
		for (let i = 0; i < scvlen; i++) {
			const index = scavengableList.shift() + 1;
			this.deleteRow(index);
			// break;
		}
		return resultRow ? new Recode(resultRow, resultRowIndex) : null;
	}
	getRowByIndex(index) {
		if ((index !== 0 && index < 0) || index >= this.matrix.length) {
			return null;
		}
		return new Recode(this.matrix[index]);
	}
}
class Service {
	constructor() {
		this.accessor = new SheetAddressor();
	}
	getLatest() {
		return this.accessor.getLastRow();
	}
	getNext(group, fileName) {
		const result = this.accessor.findRow([group, fileName]);
		const index = result ? result.index : null;
		const targetIndex = index && typeof index === 'number' ? index - 1 : 1;
		return this.accessor.getRowByIndex(targetIndex);
	}
	get(group, fileName) {
		return this.accessor.findRow([group, fileName]);
	}
	hash(group, fileName) {
		const result = this.accessor.findRow([group, fileName]);
		return result ? result.hash : null;
	}
	save(group, fileName, data, hash) {
		if (!group || !fileName || !data || !hash) {
			return;
		}
		this.accessor.addRow(this.reap(group, 128), this.reap(fileName, 128), this.reap(data, 10240), this.reap(hash, 90));
	}
	reap(value, max) {
		return (value + '').split(regex).join('').substring(0, max);
	}
}

class YadorigiWebRTCSignalingServer {
	constructor() {
		this.service = new Service();
	}
	doPost(event) {
		const { group, fileName, data, hash, command } = this.parse(event);
		this.service.save(group, fileName, data, hash);
		return this.res('{hash:' + hash + '}');
	}
	doGet(event) {
		const { group, fileName, data, hash, command } = this.parse(event);
		console.log('ServerClass doGet +' + JSON.stringify(event));
		console.log(event.parameter);
		console.log(event);
		if (command && group) {
			switch (command) {
				case 'get':
					console.log('command:' + command);
					return this.res(this.service.get(group, fileName), 'data');
				case 'next':
					console.log('command:' + command);
					return this.res(this.service.getNext(group, fileName), 'data');
				case 'hash':
					console.log('command:' + command);
					return this.res(this.service.hash(group, fileName), 'hash');
				case 'last':
					console.log('command:' + command);
					return this.res(this.service.getLatest(group), 'data');
				default:
					console.log('Sorry, we are out of ' + command + '.');
			}
		}
		return this.res(null);
	}
	parse(event) {
		if (!event || !event.parameter) {
			return { group: null, fileName: null, data: null, hash: null, command: null };
		}
		return { group: event.parameter.group, fileName: event.parameter.fileName, data: event.parameter.data, hash: event.parameter.hash, command: event.parameter.command };
	}
	res(record, key) {
		const output = ContentService.createTextOutput('');
		const result = record && record[key] && record[key] !== 0 ? record[key] : record;
		output.append(typeof result === 'string' || typeof result === 'number' || typeof result === 'bool' ? result : JSON.stringify(result));
		output.setMimeType(ContentService.MimeType.TEXT);
		return output;
	}
}
const server = globalThis.SpreadsheetApp ? new YadorigiWebRTCSignalingServer() : null;

function doPost(event) {
	try {
		return sserver ? erver.doPost(event) : '';
	} catch (e) {
		console.warn(e);
		return ContentService.createTextOutput(e + '');
	}
}
function doGet(event) {
	try {
		return server ? server.doGet(event ? event : { parameter: { command: 'get', group: 'a', fileName: 'aaa' } }) : '';
	} catch (e) {
		console.warn(e);
		return ContentService.createTextOutput(e + '');
	}
}
