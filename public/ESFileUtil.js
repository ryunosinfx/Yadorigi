export class FileUtil {
	static getOnFileLoad(elm, cb) {
		return () => {
			const [file] = elm.files;
			if (file) {
				const name = file.name;
				const type = file.type;
				const reader = new FileReader();
				reader.addEventListener('load', () => {
					cb(name, type, reader.result);
				});
				reader.addEventListener('error', (event) => {
					console.error(`Error occurred reading file: ${name}`, event);
					cb(name, type, null);
				});
				reader.readAsArrayBuffer(file);
			} else {
				cb(null, null, null);
			}
		};
	}

	static download(fileName, content, mimeType = 'text/plain') {
		const blob = new Blob([content], { type: mimeType });
		const ancker = document.createElement('a');
		ancker.style.display = 'none';
		ancker.download = fileName;
		ancker.href = window.URL.createObjectURL(blob);
		ancker.dataset.downloadurl = [mimeType, fileName, ancker.href].join(':');
		document.body.appendChild(ancker);
		ancker.click();
		setTimeout(() => {
			document.body.removeChild(ancker);
		});
	}
}
