export class Submitter {
	static submit(path, data = {}, isPost = true, target = '_blank') {
		const form = document.createElement('form');
		form.setAttribute('action', path);
		form.setAttribute('method', isPost ? 'POST' : 'GET');
		form.setAttribute('target', target);
		for (let key in data) {
			const value = data[key];
			const input = document.createElement('input');
			input.setAttribute('name', key);
			input.value = value;
			form.appendChild(input);
		}
		form.submit();
		if (form.parentNode) {
			setTimeout(() => {
				form.parentNode.removeChild(form);
			}, 100);
		}
	}
}
