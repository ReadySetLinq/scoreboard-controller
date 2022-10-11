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
	// Widget
	'xpn.EditCounterWidget': ({ uuid = null, name = '', value = '' }) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'EditCounterWidget',
					properties: { uuid, name, value },
				},
			}),
		);
	},
	'xpn.GetCounterWidgetValue': ({ uuid = null, name = '' }) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'GetCounterWidgetValue',
					properties: { uuid, name },
				},
			}),
		);
	},
	'xpn.GetClockWidgetTimerValue': ({ uuid = null, name = '' }) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'GetClockWidgetTimerValue',
					properties: { uuid, name },
				},
			}),
		);
	},
	'xpn.StartClockWidget': ({ uuid = null, name = '' }) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'StartClockWidget',
					properties: { uuid, name },
				},
			}),
		);
	},
	'xpn.StopClockWidget': ({ uuid = null, name = '' }) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'StopClockWidget',
					properties: { uuid, name },
				},
			}),
		);
	},
	'xpn.ResetClockWidget': ({ uuid = null, name = '' }) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'ResetClockWidget',
					properties: { uuid, name },
				},
			}),
		);
	},
	'xpn.EditClockWidgetFormat': ({ uuid = null, name = '', format = 'NN:SS' }) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'EditClockWidgetFormat',
					properties: { uuid, name, format },
				},
			}),
		);
	},
	'xpn.EditClockWidgetStartTime': ({ uuid = null, name = '', startTime = '' }) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'EditClockWidgetStartTime',
					properties: { uuid, name, startTime },
				},
			}),
		);
	},
	'xpn.SetClockWidgetTimerValue': ({ uuid = null, name = '', value = '' }) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'SetClockWidgetTimerValue',
					properties: { uuid, name, value },
				},
			}),
		);
	},
	'xpn.SetClockWidgetCallback': ({
		uuid = null,
		name = '',
		callback = (Hours, Minutes, Seconds, Milli) => {
			return { hours: Hours, minutes: Minutes, seconds: Seconds, milliseconds: Milli };
		},
	}) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'SetClockWidgetCallback',
					properties: { uuid, name, callback },
				},
			}),
		);
	},
	'xpn.GetTextListWidgetValue': ({ uuid = null, name = '' }) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'GetTextListWidgetValue',
					properties: { uuid, name },
				},
			}),
		);
	},
	'xpn.SetTextListWidgetValues': ({ uuid = null, name = '', values = '0' }) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'SetTextListWidgetValues',
					properties: { uuid, name, values },
				},
			}),
		);
	},
	'xpn.SetTextListWidgetItemIndex': ({ uuid = null, name = '', value = '' }) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'SetTextListWidgetItemIndex',
					properties: { uuid, name, value },
				},
			}),
		);
	},
	'xpn.SetTextListWidgetToValue': ({ uuid = null, name = '', index = '0' }) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'SetTextListWidgetToValue',
					properties: { uuid, name, index },
				},
			}),
		);
	},
	'xpn.ClearTextListWidget': ({ uuid = null, name = '' }) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'ClearTextListWidget',
					properties: { uuid, name },
				},
			}),
		);
	},
};

export default XPN_Events;
