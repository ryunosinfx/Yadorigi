///
///API一覧
// ・画像投稿
// ・画像取得
// ・最終更新ハッシュ取得
// ・次の画像取得
function create(hoge) {
	return new YadorigiWebRTCSignalingServer(hoge);
}

function set(fuga) {
	throw new Error('このメソッドは直接呼び出せません。createメソッドをコールし取得したインスタンスより呼び出してください。');
}
function doPost(event) {
	let server = new YadorigiWebRTCSignalingServer();
	return server.doPost(event);
}
function doGet(fuga) {
	let server = new YadorigiWebRTCSignalingServer();
	return server.doGet(event);
}

(function(global) {
	let Recode = function(group, fileName, data, hash) {
		if (typeof group === 'object' && group.length > 0) {
			this.group = group[0];
			this.fileName = group[1];
			this.data = group[2];
			this.hash = group[3];
			this.createTime = group[4];
			this.index = fileName;
		} else {
			this.group = group;
			this.fileName = fileName;
			this.data = data;
			this.hash = hash;
			this.createTime = Date.now();
			this.index = null;
		}
		this.rowIndex = { A: 'group', B: 'fileName', C: 'data', D: 'hash', E: 'createTime' };
	};
	Recode.prototype = {
		toArray() {
			return [this.group, this.fileName, this.data, this.hash, this.createTime];
		}
	};
	let SheetAddressor = function(sheet) {
		this.sheet = sheet;
		this.matrix = this.sheet.getDataRange().getValues(); //受け取ったシートのデータを二次元配列に取得
		this.rowCount = this.matrix.length;
	};
	SheetAddressor.prototype = {
		addRow: function(record) {
			this.sheet.appendRow(record.toArray());
		},
		getLastRow: function() {
			let lastRowIndex = this.sheet.getDataRange().getLastRow(); //対象となるシートの最終行を取得
			return this.matrix[lastRowIndex];
		},
		deleteRow: function(index) {
			this.sheet.deleteRows(index, 1);
		},
		findRow: function(where) {
			let len = this.matrix.length;
			const whereCount = where.length;
			for (let i = len - 1; i > -1; i--) {
				//SearchFromeEnd
				let row = matrix[i];
				let colsCount = row.length;
				let matchCount = 0;
				for (let j = 0; j < colsCount; j++) {
					let colValue = colsCount[j];
					let condition = where[j];
					if ((whereCount > j && condition && condition === colValue) || (whereCount > j && !condition)) {
						matchCount++;
					}
				}
				if (matchCount === whereCount) {
					return new Recode(row, i);
				}
			}
			return null;
		},
		getRowByIndex: function(index) {
			if ((index !== 0 && index < 0) || index >= this.rowCount) {
				return null;
			}
			return this.matrix[lastRowIndex];
		}
	};
	/////////////////////////////////////////////////////////////////////////
	let Service = function() {
		this.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		this.accessor = new SheetAddressor(this.spreadsheet);
	};
	Service.prototype = {
		getLatest: function() {
			return this.accessor.getLastRow();
		},
		getNext: function(group, fileName) {
			let where = [group, fileName];
			let result = this.accessor.findRow(where);
			let index = result ? result.index : null;
			let targetIndex = index && typeof index === 'number' ? index - 1 : 0;
			return this.accessor.getRowByIndex(targetIndex);
		},
		get: function(group, fileName) {
			let where = [group, fileName];
			return this.accessor.findRow(where);
		},
		save: function(group, fileName, data, hash) {
			if (!group || !fileName || !data || !hash) {
				return;
			}
			let newRecord = new Recode(group, fileName, data, hash);
			this.accessor.addRow(newRecord);
		}
	};
	/////////////////////////////////////////////////////////////////////////
	let ServerClass = (function() {
		ServerClass.name = 'YadorigiWebRTCSignalingServer';

		function ServerClass(hoge) {
			this.service = new Service();
		}

		ServerClass.prototype = {
			doPost: function(event) {
				let group = event.parameter.group;
				let fileName = event.parameter.fileName;
				let data = event.parameter.data;
				let hash = event.parameter.hash;
				if (group && fileName && data && hash) {
					this.service.save(group, fileName, data, hash);
				}
			},
			doGet: function(event) {
				let mimeTypeSVG = 'image/svg+xml';
				let parram = event.parameter;
				let command = parram ? parram.command : null;
				let fileName = parram ? parram.fileName : null;
				let group = parram ? parram.group : null;
				let output = ContentService.createTextOutput();
				if (command && group) {
					switch (command) {
						case 'get':
							let record0 = this.service.get(group, fileName);
							output.append(record0.data);
							output.setMimeType(ContentService.MimeType.XML);
							break;
						case 'next':
							let record1 = this.service.getNext(group, fileName);
							output.append(record1.data);
							output.setMimeType(ContentService.MimeType.XML);
							break;
						case 'hash':
							let record3 = this.service.getNext(group, fileName);
							output.append(record3.hash);
							output.setMimeType(ContentService.MimeType.TEXT);
							break;
						case 'last':
							let record2 = this.service.getLatest(group);
							output.append(record2.data);
							output.setMimeType(ContentService.MimeType.XML);
							break;
						default:
							console.log('Sorry, we are out of ' + command + '.');
					}
				}
			},
			addData: function(key) {},
			loadData: function(key) {}
		};

		return ServerClass;
	})();
	return (global.YadorigiWebRTCSignalingServer = ServerClass);
})(this);
