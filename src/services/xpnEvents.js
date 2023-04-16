import { emitter } from '../services/utilities';

export class XpnEvents {
	unlistens = [];

	addListeners = () => {
		// Register all event "on" listeners
		Object.entries(events).forEach(([key, value]) => {
			this.unlistens.push(emitter.on(key, value));
		});
	};

	removeListeners = () => {
		// Remove all event listeners
		for (const unlisten of this.unlistens) {
			unlisten();
		}
	};
}

export const events = {
	// Main
	'xpn::start': ({ uuid = null }) => {
		emitter.emit(
			'conn::sendMessage',
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
	'xpn::GetTakeItemStatus': ({ uuid = null, takeID = -1 }) => {
		emitter.emit(
			'conn::sendMessage',
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
	'xpn::SetTakeItemOffline': ({ uuid = null, takeID = -1 }) => {
		emitter.emit(
			'conn::sendMessage',
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
	'xpn::SetTakeItemOnline': ({ uuid = null, takeID = -1 }) => {
		emitter.emit(
			'conn::sendMessage',
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
	'xpn::EditTakeItemProperty': ({
		uuid = null,
		takeID = -1,
		objName = '',
		value = '',
		propName = '',
		materialName = null,
	}) => {
		emitter.emit(
			'conn::sendMessage',
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
	'xpn::EditCounterWidget': ({ uuid = null, name = '', value = '' }) => {
		emitter.emit(
			'conn::sendMessage',
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
	'xpn::GetCounterWidgetValue': ({ uuid = null, name = '' }) => {
		emitter.emit(
			'conn::sendMessage',
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
	'xpn::GetClockWidgetTimerValue': ({ uuid = null, name = '' }) => {
		emitter.emit(
			'conn::sendMessage',
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
	'xpn::GetClockWidgetValue': ({ uuid = null, name = '' }) => {
		emitter.emit(
			'conn::sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'GetClockWidgetValue',
					properties: { uuid, name },
				},
			}),
		);
	},
	'xpn::StartClockWidget': ({ uuid = null, name = '' }) => {
		emitter.emit(
			'conn::sendMessage',
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
	'xpn::StopClockWidget': ({ uuid = null, name = '' }) => {
		emitter.emit(
			'conn::sendMessage',
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
	'xpn::ResetClockWidget': ({ uuid = null, name = '' }) => {
		emitter.emit(
			'conn::sendMessage',
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
	'xpn::EditClockWidgetFormat': ({ uuid = null, name = '', format = 'NN:SS' }) => {
		emitter.emit(
			'conn::sendMessage',
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
	'xpn::EditClockWidgetStartTime': ({ uuid = null, name = '', startTime = '' }) => {
		emitter.emit(
			'conn::sendMessage',
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
	'xpn::SetClockWidgetTimerValue': ({ uuid = null, name = '', value = '' }) => {
		emitter.emit(
			'conn::sendMessage',
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
	'xpn::SetClockWidgetCallback': ({
		uuid = null,
		name = '',
		callback = (Hours, Minutes, Seconds, Milli) => {
			return { hours: Hours, minutes: Minutes, seconds: Seconds, milliseconds: Milli };
		},
	}) => {
		emitter.emit(
			'conn::sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'SetClockWidgetCallback',
					properties: {
						uuid,
						name,
						callback: (Hours, Minutes, Seconds, Milli) => {
							callback({ hours: Hours, minutes: Minutes, seconds: Seconds, milliseconds: Milli });
						},
					},
				},
			}),
		);
	},
	'xpn::GetTextListWidgetValue': ({ uuid = null, name = '' }) => {
		emitter.emit(
			'conn::sendMessage',
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
	'xpn::SetTextListWidgetValues': ({ uuid = null, name = '', values = '0' }) => {
		emitter.emit(
			'conn::sendMessage',
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
	'xpn::SetTextListWidgetItemIndex': ({ uuid = null, name = '', index = '0' }) => {
		emitter.emit(
			'conn::sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'SetTextListWidgetItemIndex',
					properties: { uuid, name, index },
				},
			}),
		);
	},
	'xpn::SetTextListWidgetToValue': ({ uuid = null, name = '', index = '0' }) => {
		emitter.emit(
			'conn::sendMessage',
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
	'xpn::ClearTextListWidget': ({ uuid = null, name = '' }) => {
		emitter.emit(
			'conn::sendMessage',
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

export default XpnEvents;
