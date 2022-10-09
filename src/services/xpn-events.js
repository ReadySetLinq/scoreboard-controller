import Emitter from './emitter';

export class XPN_Events {
	addListeners = () => {
		// Register all event "on" listeners
		Object.entries(events).forEach(([key, value]) => {
			Emitter.on(key, value);
		});
	};

	removeListeners = () => {
		// Remove all event listeners
		Object.keys(events).forEach((key) => {
			Emitter.off(key);
		});
	};
}

export const events = {
	// Main
	'xpn.start': ({ uuid = null }) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'main',
					action: 'start',
					properties: { uuid },
				},
			}),
		);
	},
	// Take Items
	'xpn.GetTakeItemStatus': ({ uuid = null, takeID = -1 }) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'takeitem',
					action: 'GetTakeItemStatus',
					properties: { uuid, takeID },
				},
			}),
		);
	},
	'xpn.SetTakeItemOffline': ({ uuid = null, takeID = -1 }) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'takeitem',
					action: 'SetTakeItemOffline',
					properties: { uuid, takeID },
				},
			}),
		);
	},
	'xpn.SetTakeItemOnline': ({ uuid = null, takeID = -1 }) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'takeitem',
					action: 'SetTakeItemOnline',
					properties: { uuid, takeID },
				},
			}),
		);
	},
	'xpn.EditTakeItemProperty': ({
		uuid = null,
		takeID = -1,
		objName = '',
		value = '',
		propName = '',
		materialName = null,
	}) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'takeitem',
					action: 'EditTakeItemProperty',
					properties: {
						uuid,
						takeID,
						objName,
						value,
						propName,
						materialName,
					},
				},
			}),
		);
	},
};

export default XPN_Events;
