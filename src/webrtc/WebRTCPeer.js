export class WebRTCPeer {
	constructor() {
		this.peer = null;
		this.isOpend = false;
	}
	prepareNewConnection(isWithDataChannel) {
		return new Promise((resolve, reject) => {
			console.warn('--prepareNewConnection--0----------WebRTCPeer--------------------------------------');
			// const peer = new RTCPeerConnection(null, { optional: [{ RtpDataChannels: true }] });
			const peer = new RTCPeerConnection({});
			console.warn('--prepareNewConnection--1----------WebRTCPeer--------------------------------------');
			peer.ontrack = (evt) => {
				console.log(`-- peer.ontrack()vevt:${evt}`);
			};

			// peer.onaddstream = evt => {
			// 	console.log('-- peer.onaddstream()vevt:' + evt);
			// };
			peer.onremovestream = (evt) => {
				console.log(`-- peer.onremovestream()vevt:${evt}`);
			};
			peer.onicecandidate = (evt) => {
				if (evt.candidate) {
					console.log(evt.candidate);
				} else {
					console.log('-1--onicecandidate--- empty ice event');
					this.sendSdp(peer.localDescription);
				}
			};

			peer.onnegotiationneeded = async () => {
				try {
					console.log('-1--onnegotiationneeded--------WebRTCPeer----createOffer() succsess in promise');
					const offer = await peer.createOffer();
					console.log('-2--onnegotiationneeded--------WebRTCPeer----createOffer() succsess in promise');
					await peer.setLocalDescription(offer);
					console.log('-3--onnegotiationneeded--------WebRTCPeer----setLocalDescription() succsess in promise');
					this.sdp = peer.localDescription;
					resolve(peer);
				} catch (err) {
					reject(err);
					console.error('setLocalDescription(offer) ERROR: ', err);
				}
			};

			peer.oniceconnectionstatechange = () => {
				console.log(`ICE connection Status has changed to ${peer.iceConnectionState}`);
				switch (peer.iceConnectionState) {
					case 'closed':
					case 'failed':
						if (this.peer) {
							this.close();
						}
						break;
					case 'disconnected':
						break;
				}
			};
			peer.ondatachannel = (evt) => {
				console.warn(`--ondatachannel--1----------WebRTCPeer--------------------------------------evt:${evt}`);
				this.dataChannelSetup(evt.channel);
				console.warn(`--ondatachannel--2----------WebRTCPeer--------------------------------------evt:${evt}`);
			};
			console.warn(`--prepareNewConnection--2----------WebRTCPeer--------------------------------------isWithDataChannel:${isWithDataChannel}`);
			if (isWithDataChannel) {
				peer.createDataChannel(`chat${Date.now()}`);
			}
		});
	}
	onOpen(event) {
		console.log(event);
	}
	onError(error) {
		console.log(error);
	}
	onMessage(msg) {
		console.log(msg);
	}
	onClose() {
		console.log('close');
	}
	dataChannelSetup(dataChannel) {
		dataChannel.onerror = (error) => {
			console.log('Data Channel Error:', error);
			this.onError(error);
		};

		dataChannel.onmessage = (event) => {
			console.log('Got Data Channel Message:', event.data);
			this.onMessage(event.data);
		};

		dataChannel.onopen = (event) => {
			dataChannel.send('dataChannel Hello World!');
			this.isOpend = true;
			this.onOpen(event);
		};

		dataChannel.onclose = () => {
			console.log('The Data Channel is Closed');
			this.isOpend = false;
			this.onClose();
		};
		this.dataChannel = dataChannel;
	}
	sendSdp(sessionDescription) {
		console.log(`---sending sdp ---${sessionDescription.sdp}`);
	}
	async makeOffer() {
		console.log('--makeOffer--1----------WebRTCPeer--------------------------------------');
		this.peer = await this.prepareNewConnection(true);
		console.log('--makeOffer--2----------WebRTCPeer--------------------------------------');
		return true;
	}
	async makeAnswer() {
		console.log('sending Answer. Creating remote session description...');
		if (!this.peer) {
			console.error('peerConnection NOT exist!');
			return;
		}
		try {
			const answer = await this.peer.createAnswer();
			console.log('createAnswer() succsess in promise');
			await this.peer.setLocalDescription(answer);
			console.log('setLocalDescription() succsess in promise');
			return this.peer.localDescription;
		} catch (err) {
			console.error(err);
		}
	}
	async setOfferAndAswer(sdp) {
		console.warn(`setOfferAndAswer sdp ${sdp}`);
		console.warn(sdp);
		try {
			const offer = new RTCSessionDescription({
				type: 'offer',
				sdp: sdp,
			});
			if (this.peer) {
				console.error('peerConnection alreay exist!');
			}
			this.peer = await this.prepareNewConnection(true);
			console.warn(`setOfferAndAswer this.peer ${this.peer}`);
			await this.peer.setRemoteDescription(offer);
			console.warn(`setOfferAndAswer offer ${offer}`);
			console.log('setRemoteDescription(answer) succsess in promise');
			return await this.makeAnswer();
		} catch (err) {
			console.error('setRemoteDescription(offer) ERROR: ', err);
		}
		return null;
	}
	async setAnswer(sdp) {
		const answer = new RTCSessionDescription({
			type: 'answer',
			sdp: sdp,
		});
		if (!this.peer) {
			console.error('peerConnection NOT exist!');
			return;
		}
		try {
			await this.peer.setRemoteDescription(answer);
			console.log('setRemoteDescription(answer) succsess in promise');
			alert('OpenSuccess!');
			return true;
		} catch (err) {
			console.error('setRemoteDescription(answer) ERROR: ', err);
		}
		return false;
	}
	send(msg) {
		if (this.dataChannel) {
			this.dataChannel.send(msg);
		}
	}
	close() {
		if (this.peer) {
			if (this.peer.iceConnectionState !== 'closed') {
				this.peer.close();
				this.peer = null;
			}
		}
		console.log('peerConnection is closed.');
	}
}
