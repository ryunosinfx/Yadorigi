// import { ViewUtil } from './ViewUtil.js';
// const width = 100;
const height = 100;
export class DataLoaderAsImge {
	static load(path, callback) {
		const width = 100;
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = width; // or 'width' if you want a special/scaled size
				canvas.height = height; // or 'height' if you want a special/scaled size

				canvas.getContext('2d').drawImage(this, 0, 0);

				// Get raw image data
				callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));

				// ... or get as Data URI
				callback(canvas.toDataURL('image/png'));
				// img;
				resolve();
			};
			img.onerror = (e) => reject(e);
			img.src = path;
		});
	}
}
