export class WebRTCPeer {
	constructor() {
		this.peer = null;
	}
	prepareNewConnection(resolve, reject) {
		const peer = new RTCPeerConnection({});
		peer.ontrack = evt => {
			console.log('-- peer.ontrack()vevt:' + evt);
		};

		peer.onaddstream = evt => {
			console.log('-- peer.onaddstream()vevt:' + evt);
		};
		peer.onremovestream = evt => {
			console.log('-- peer.onremovestream()vevt:' + evt);
		};
		peer.onicecandidate = evt => {
			if (evt.candidate) {
				console.log(evt.candidate);
			} else {
				console.log('empty ice event');
				sendSdp(peer.localDescription);
			}
		};

		peer.onnegotiationneeded = async () => {
			try {
				let offer = await peer.createOffer();
				console.log('createOffer() succsess in promise');
				await peer.setLocalDescription(offer);
				console.log('setLocalDescription() succsess in promise');
				this.sdp = peer.localDescription;
				resolve(this.sdp);
			} catch (err) {
				reject(err);
				console.error('setLocalDescription(offer) ERROR: ', err);
			}
		};

		peer.oniceconnectionstatechange = () => {
			console.log('ICE connection Status has changed to ' + peer.iceConnectionState);
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
		peer.ondatachannel = evt => {
			this.dataChannelSetup(evt.channel);
		};
		return peer;
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
		dataChannel.onerror = error => {
			console.log('Data Channel Error:', error);
			this.onError(error);
		};

		dataChannel.onmessage = event => {
			console.log('Got Data Channel Message:', event.data);
			this.onMessage(event.data);
		};

		dataChannel.onopen = event => {
			dataChannel.send('dataChannel Hello World!');
			this.onOpen(event);
		};

		dataChannel.onclose = () => {
			console.log('The Data Channel is Closed');
			this.onClose();
		};
		this.dataChannel = dataChannel;
	}
	sendSdp(sessionDescription) {
		console.log('---sending sdp ---');
		sessionDescription.sdp;
	}
	makeOffer() {
		return new Promise((resolve, rejec) => {
			this.peer = this.prepareNewConnection(resolve, rejec);
		});
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
		const offer = new RTCSessionDescription({
			type: 'offer',
			sdp: text
		});
		if (this.peer) {
			console.error('peerConnection alreay exist!');
		}
		this.peer = prepareNewConnection(false);
		try {
			await this.peer.setRemoteDescription(offer);
			console.log('setRemoteDescription(answer) succsess in promise');
			return await makeAnswer();
		} catch (err) {
			console.error('setRemoteDescription(offer) ERROR: ', err);
		}
		return null;
	}
	async setAnswer(sdp) {
		const answer = new RTCSessionDescription({
			type: 'answer',
			sdp: text
		});
		if (!this.peer) {
			console.error('peerConnection NOT exist!');
			return;
		}
		try {
			await this.peer.setRemoteDescription(answer);
			console.log('setRemoteDescription(answer) succsess in promise');
		} catch (err) {
			console.error('setRemoteDescription(answer) ERROR: ', err);
		}
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
