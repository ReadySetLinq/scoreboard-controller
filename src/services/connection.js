import { isEqual } from 'lodash';

import { webSockets, objHas } from './utilities';
import XpnEvents from './xpnEvents';
import Emitter from './emitter';

export const defaultNetworkSettingsData = {
	ip: 'localhost',
	port: 0,
	userName: 'brtf',
	password: '',
};

export class Connection {
	initialized = false;
	connected = false;
	connecting = false;
	loggedIn = false;
	autoReconnect = true;
	displayMsg = 'A network connection is required!';
	wsReadyState = WebSocket.CLOSED;
	wsConnected = false;
	reconnectTime = 1500;
	reconnectInterval = 0;
	settings = { ...defaultNetworkSettingsData };
	xpnEvents = new XpnEvents(); // Startup the xpnEvents listeners
	unlistens = [];

	constructor() {
		const listeners = async () => {
			this.unlistens.push(
				await Emitter.on('conn::getStatus', () =>
					Emitter.emit('conn::status', {
						connected: this.connected,
						connecting: this.connecting,
						displayMsg: this.displayMsg,
					}),
				),
			);
			this.unlistens.push(Emitter.on('conn::getDisplayMsg', () => Emitter.emit('conn::displayMsg', this.displayMsg)));
			this.unlistens.push(Emitter.on('conn::updateSettings', this.updateSettings));
			this.unlistens.push(Emitter.on('conn::connect', this.connect));
			this.unlistens.push(Emitter.on('conn::disconnect', this.disconnect));
			this.unlistens.push(Emitter.on('conn::reconnect', this.reconnect));
			this.unlistens.push(Emitter.on('conn::sendMessage', this.sendMessage));
			this.unlistens.push(Emitter.on('ws::onIsConnected', this.onIsConnected));
			this.unlistens.push(Emitter.on('ws::onOpen', this.onOpen));
			this.unlistens.push(Emitter.on('ws::onMessage', this.onMessage));
			this.unlistens.push(Emitter.on('ws::onClose', this.onClose));
			this.unlistens.push(Emitter.on('ws::onError', this.onError));
		};
		listeners();
		this.xpnEvents.addListeners();
		this.initialized = true;
	}

	destroy = () => {
		this.disconnect();

		if (!this.initialized) return;

		// Unlisten to all the connection events
		for (const unlisten of this.unlistens) {
			unlisten();
		}

		this.xpnEvents.removeListeners();
		this.initialized = false;
		clearInterval(this.reconnectInterval);
	};

	updateSettings = (settings) => {
		if (!isEqual(settings, this.settings)) {
			this.settings = { ...defaultNetworkSettingsData, ...settings };
			webSockets.updateData(settings);
			this.reconnect();
		}
	};

	connect = () => {
		webSockets.updateData(this.settings);

		if (this.connected) {
			this.disconnect().then(this.connect);
			return;
		}

		this.connecting = true;
		this.connected = false;
		this.wsReadyState = WebSocket.CLOSED;
		this.wsConnected = false;

		this.displayMsg = 'Attempting to connect...';
		//webSockets.connect(this.settings);

		Emitter.emit('network::connecting', this.displayMsg);
	};

	disconnect = () =>
		new Promise((resolve) => {
			const { settings, connecting, connected, sendMessage } = this;

			// If we are still connecting, cancel the request and return to old state
			if (connecting) {
				if (webSockets.ws !== null) webSockets.disconnect(false);

				this.connecting = false;
				this.connected = false;
				this.autoReconnect = false;
				return resolve(true);
			}

			this.autoReconnect = false;

			if (connected) {
				sendMessage(`{'service': 'logout', 'data': {'userName': '${settings.userName}'}}`);
				return setTimeout(() => {
					if (webSockets.ws !== null) webSockets.disconnect(false);
					this.connecting = false;
					this.connected = false;
					this.autoReconnect = false;
					return resolve(true);
				}, 1000);
			} else {
				if (webSockets.ws !== null) webSockets.disconnect(false);
				this.connecting = false;
				this.connected = false;
				this.autoReconnect = false;
				return resolve(true);
			}
		});

	reconnect = () => {
		if (this.connected || this.connecting) this.disconnect().then(() => this.connect());
	};

	sendMessage = (msg) => {
		const { connected } = this;

		if (msg && connected) {
			if (webSockets.ws !== null) webSockets.sendMessage(msg);
		}
	};

	onIsConnected = (readyState, connected) => {
		this.wsReadyState = readyState || WebSocket.CLOSED;
		this.wsConnected = connected || false;
	};

	// websocket onopen event listener
	onOpen = () => {
		this.connecting = false;
		this.connected = true;
		this.autoReconnect = true;
		this.displayMsg = 'Connected!';
		Emitter.emit('network::connected', this.displayMsg);
		clearInterval(this.reconnectInterval);

		// Send login message with our saved login data
		this.sendMessage(
			`{'service': 'login', 'data': {'userName': '${this.settings.userName}', 'password': '${this.settings.password}'}}`,
		);
	};

	// websocket onclose event listener
	onClose = ({ event = { reason: '' }, timeout = 0 }) => {
		this.connecting = false;
		this.connected = false;
		this.displayMsg = ReconnectMsg(timeout, this.autoReconnect, event.reason);

		Emitter.emit('network::connectionMsg', this.displayMsg);
		Emitter.emit('network::disconnected', this.displayMsg);
	};

	// websocket onerror event listener
	onError = () => {
		clearInterval(this.reconnectInterval);
		this.connecting = false;
		this.connected = false;
		this.displayMsg = 'Connection encountered error!';
		Emitter.emit('network::connectionMsg', this.displayMsg);
	};

	// websocket onmessage event listener
	onMessage = ({ data = '{}' }) => {
		const _msg = JSON.parse(data);
		if (_msg && objHas.call(_msg, 'service')) {
			switch (_msg.service) {
				case 'status':
					if (objHas.call(_msg, 'data') && objHas.call(_msg.data, 'type')) {
						switch (_msg.data.type) {
							case 'login': {
								const _loginMsg = _msg.data.message.trim();
								if (_loginMsg === `Logged in as user: ${this.settings.userName}`) {
									Emitter.emit('xpression::loggedIn', {
										data: _msg.data,
									});
									this.loggedIn = true;
								}
								break;
							}
							case 'error': {
								Emitter.emit('xpression::error', {
									data: {
										..._msg.data,
										message: _msg.data.message ? _msg.data.message.trim() : 'An unknown error occurred',
									},
								});
								break;
							}
							default:
								break;
						}
					}
					break;
				case 'xpression':
					if (objHas.call(_msg, 'data') && objHas.call(_msg.data, 'category') && objHas.call(_msg.data, 'action')) {
						switch (_msg.data.category) {
							case 'takeitem':
								// Check for generic responses
								if (
									isEqual(_msg.data.action, 'SetTakeItemOnline') ||
									isEqual(_msg.data.action, 'SetTakeItemOffline') ||
									isEqual(_msg.data.action, 'GetTakeItemStatus')
								) {
									Emitter.emit(`takeItem-${_msg.data.value.takeID}`, {
										uuid: _msg.data.value.uuid,
										takeID: _msg.data.value.takeID,
										action: _msg.data.action,
										response: _msg.data.value.response,
									});
								}
								// Send custom UUID response
								Emitter.emit(`${_msg.data.value.uuid}`, {
									uuid: _msg.data.value.uuid,
									takeID: _msg.data.value.takeID,
									action: _msg.data.action,
									response: _msg.data.value.response,
								});

								break;
							case 'widget':
								let emitEvent = '';
								switch (_msg.data.action.trim().toLowerCase()) {
									case 'editcounterwidget':
										emitEvent = `editCounterWidget-${_msg.data.value.name}`;
										break;
									case 'increasecounterwidget':
										emitEvent = `increaseCounterWidget-${_msg.data.value.name}`;
										break;
									case 'decreasecounterwidget':
										emitEvent = `decreaseCounterWidget-${_msg.data.value.name}`;
										break;
									case 'getcounterwidget':
										emitEvent = `getCounterWidget-${_msg.data.value.name}`;
										break;
									case 'getcounterwidgetvalue':
										emitEvent = `getCounterWidgetValue-${_msg.data.value.name}`;
										break;
									case 'setcounterwidgetvalue':
										emitEvent = `getClockWidgetTimerValue-${_msg.data.value.name}`;
										break;
									case 'editclockwidget':
										emitEvent = `getClockWidgetValue-${_msg.data.value.name}`;
										break;
									case 'startclockwidget':
										emitEvent = `startClockWidget-${_msg.data.value.name}`;
										break;
									case 'stopclockwidget':
										emitEvent = `stopClockWidget-${_msg.data.value.name}`;
										break;
									case 'resetclockwidget':
										emitEvent = `resetClockWidget-${_msg.data.value.name}`;
										break;
									case 'getclockwidget':
										emitEvent = `editClockWidgetStartTime-${_msg.data.value.name}`;
										break;
									case 'getclockwidgetvalue':
										emitEvent = `setClockWidgetTimerValue-${_msg.data.value.name}`;
										break;
									case 'setclockwidgetvalue':
										emitEvent = `SetClockWidgetCallback-${_msg.data.value.name}`;
										break;
									default:
										break;
								}

								// Check for generic responses
								if (emitEvent !== '') {
									Emitter.emit(`editCounterWidget-${_msg.data.value.name}`, {
										uuid: _msg.data.value.uuid,
										name: _msg.data.value.name,
										action: _msg.data.action,
										response: _msg.data.value.response,
									});
								}

								// Send custom UUID response
								Emitter.emit(`${_msg.data.value.uuid}`, {
									uuid: _msg.data.value.uuid,
									name: _msg.data.value.name,
									action: _msg.data.action,
									response: _msg.data.value.response,
								});
								break;
							case 'main':
								switch (_msg.data.action.trim().toLowerCase()) {
									case 'start':
										Emitter.emit('xpression::controllerStarted', {
											uuid: _msg.data.value.uuid,
											response: _msg.data.value.response,
										});
										break;
									case 'error':
										Emitter.emit('xpression::error', {
											uuid: _msg.data.value.uuid,
											data: {
												message: _msg.data.value.response,
											},
										});
										break;

									default:
										// Send custom UUID response
										Emitter.emit(`${_msg.data.value.uuid}`, {
											uuid: _msg.data.value.uuid,
											name: _msg.data.value.name,
											action: _msg.data.action,
											response: _msg.data.value.response,
										});
										break;
								}
								break;
							default:
								if (_msg.data.value.name) {
									Emitter.emit(`${_msg.data.value.uuid}`, {
										uuid: _msg.data.value.uuid,
										name: _msg.data.value.name,
										action: _msg.data.action,
										response: _msg.data.value.response,
									});
								} else {
									Emitter.emit(`${_msg.data.value.uuid}`, {
										uuid: _msg.data.value.uuid,
										takeID: _msg.data.value.takeID,
										action: _msg.data.action,
										response: _msg.data.value.response,
									});
								}
								break;
						}
					}
					break;
				case 'server':
					if (objHas.call(_msg, 'data') && objHas.call(_msg.data, 'message')) {
						if (isEqual(_msg.data.message, 'connected')) {
							Emitter.emit('network::connected', this.displayMsg);
						}
					}

					break;
				default:
					console.warn('Uncaught Message', _msg);
					Emitter.emit(_msg.service, {
						..._msg.data,
					});
					break;
			}
		}
	};
}

const ReconnectMsg = (timeout = 0, autoReconnect = true, reason = '') => {
	const attemptTime = Math.min(10000 / 1000, (timeout + timeout) / 1000);
	let message = 'Connection closed.';
	if (webSockets.ws !== null && autoReconnect && attemptTime > 0)
		message = `${message} Reconnect will be attempted in ${attemptTime} second${attemptTime > 1 ? 's' : ''}. ${reason}`;

	return message.trim();
};

export default Connection;
