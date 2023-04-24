import { listen, emit } from '@tauri-apps/api/event';
import WebSocket from 'tauri-plugin-websocket-api';

import { defaultNetworkSettingsData } from './connection';

export class Websockets {
	timeout = 1500;
	ws = null;
	connectInterval = 0;
	connectTimeout = 0;
	status = { autoReconnect: true, connecting: false, connected: false };
	data = { ...defaultNetworkSettingsData };
	unlisten = () => null;

	constructor() {
		this.unlisten = listen('ws::isConnected', this.isConnected);
	}

	destroy = () => {
		const { ws } = this;

		this.status.autoReconnect = false;
		clearTimeout(this.connectInterval); // clear Interval on on open of websocket connection
		clearTimeout(this.connectTimeout); // clear timeout as its connected now

		if (ws !== null) ws.close();
		if (this.unlisten !== null) this.unlisten.then((f) => f());
	};

	updateData = (networkSettings) => {
		this.data = { ...this.data, ...networkSettings };
	};

	// * Websocket Functions
	/**
	 * @function connect
	 * This function establishes the connect with the websocket and also ensures constant reconnection if connection closes
	 */
	connect = (networkSettings) => {
		this.status = {
			autoReconnect: true,
			connecting: false,
			connected: false,
		};
		if (networkSettings) this.data = { ...this.data, ...networkSettings };
		if (this.data.port === 0) {
			emit('ws::onError', {
				event: new Error('Invalid port'),
			});
			return;
		}

		try {
			if (this.ws) this.ws.close();

			this.ws = new WebSocket(`ws://${this.data.ip}:${this.data.port}`);

			// websocket onopen event listener
			this.ws.onopen = () => {
				clearTimeout(this.connectInterval); // clear Interval on on open of websocket connection
				clearTimeout(this.connectTimeout); // clear timeout as its connected now

				emit('ws::onOpen', { opened: true });
				this.status = {
					...this.status,
					connecting: false,
					connected: true,
				};
				this.timeout = 1500; // reset timer to 1500 on open of websocket connection
			};

			// websocket onmessage event listener
			this.ws.onmessage = (ev) => {
				console.log('websockets connect this.ws.onmessage', ev.data);
				emit('ws::onMessage', { data: ev.data });
			};

			// websocket onclose event listener
			this.ws.onclose = (ev) => {
				console.info('websockets connect ws onclose', ev.currentTarget);
				this.timeout = this.timeout + this.timeout; //increment retry interval
				if (this.timeout > 70000) this.timeout = 1500; // if retry interval is greater than 30 seconds set it to 30 seconds

				if (this.status.autoReconnect) {
					emit('ws::onClose', {
						event: ev,
						timeout: this.timeout,
					});
					this.connectInterval = window.setTimeout(() => this.connect(), this.timeout); //call _wsCheck function after timeout
				} else {
					emit('ws::onClose', {
						event: ev,
						timeout: 0,
					});
					this.ws = null;
				}
			};

			// websocket onerror event listener
			this.ws.onerror = (ev) => {
				console.error('websockets connect ws onclose', ev.currentTarget);
				emit('ws::onError', {
					event: ev,
				});
				this.ws.close();
			};

			// Connection started
			emit('ws::onConnect', { connecting: true });
			this.connectTimeout = window.setTimeout(() => {
				clearTimeout(this.connectTimeout); // clear timeout as its connected now
				this.status = {
					...this.status,
					connecting: false,
					connected: false,
				};
				emit('ws::onClose', {
					event: { reason: 'Connection timed out' },
					timeout: 0,
				});
				if (this.ws !== null) this.ws.close();
			}, 10000);
		} catch (e) {
			emit('ws::onError', {
				event: e,
			});
			clearTimeout(this.connectInterval); // clear Interval on on open of websocket connection
			clearTimeout(this.connectTimeout); // clear timeout as its connected now
		}
	};

	/**
	 * @function disconnect
	 * This function closes the websocket connect
	 * @param autoReconnect
	 * This paramater determins if the connection should autoReconnect once closed (default: true)
	 */
	disconnect = (autoReconnect = true) => {
		const { ws, status } = this;

		status.autoReconnect = autoReconnect;

		if (ws) ws.close();
	};

	/**
	 * utilized by the @function connect to check if the connection is close, if so attempts to reconnect
	 */
	_wsCheck = () => {
		const { ws, connect } = this;
		if (!ws || ws.readyState === WebSocket.CLOSED) connect(); //check if websocket instance is closed, if so call `connect` function.
	};

	_wsIsConnected = () => {
		const { ws } = this;

		return ws && ws.readyState === WebSocket.OPEN;
	};

	isConnected = () => {
		const readyState = this.ws ? this.ws.readyState : WebSocket.CLOSED;
		const connected = readyState === WebSocket.OPEN;

		emit('ws::onIsConnected', {
			readyState: readyState,
			connected: connected,
		});
	};

	sendMessage = (msg) => {
		const { ws, _wsIsConnected } = this;

		try {
			if (msg && ws && _wsIsConnected()) ws.send(msg); //send data to the server
		} catch (error) {
			if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') console.error({ error }); // catch error
		}
	};
}

export default Websockets;
