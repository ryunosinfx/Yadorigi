import { YadorigiSignalingAdapter } from '../../webrtc/YadorigiSignalingAdapter.js';
let self = null;
export class MultiBrowsersConnectionTestService {
	constructor() {}
	async init(data) {
		const deviceName = data.deviceName;
		const userId = data.userId;
		const pass = data.pass;
		const groupId = data.groupId;
		const targetDeviceName = data.targetDeviceName;
		const serverUrl = data.serverUrl;
		const onOpenCallBack = data.onOpenCallBack;
		const onCloseCallBack = data.onCloseCallBack;
		const onMessageCallBack = data.onMessageCallBack;
		const onErrorCallBack = data.onErrorCallBack;

		const ysa = new YadorigiSignalingAdapter(pass, userId, deviceName, groupId, serverUrl);
		await ysa.init(onOpenCallBack, onCloseCallBack, onMessageCallBack, onErrorCallBack);
		console.log('---A----');
		await ysa.startConnect(targetDeviceName);
		console.log('---B----');
	}
	static async connect(data) {
		if (!self) {
			self = new MultiBrowsersConnectionTestService();
		}
		await self.init(data);
	}
}
