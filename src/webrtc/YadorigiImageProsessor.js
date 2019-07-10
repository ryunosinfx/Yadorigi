const pngHeader = 'data:image/png;base64,';
export class YadorigiImageProsessor {
	build(imageList, senderDeviceName, sdp, expireOffset, userId) {
		const payload = { senderDeviceName, sdp, expireOffset, userId };
		const svgSeeds = [
			'<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg">',
			'<defs> <rect id="box" x="1" y="0" width="1" height="1"></rect></defs>',
			'<image width="1" height="1" href="external.jpg" ></image>',
			'</svg>'
		];
	}
	//ユーザーIDのハッシュとデバイス名ハッシュをキー
	createFileName(userId, senderDeviceName) {}
}
