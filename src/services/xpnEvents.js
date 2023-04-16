import { emit } from '@tauri-apps/api/event';

export const XpnEvents = {
	// Main
	Start: ({ uuid = null }) => {
		emit(
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
	GetTakeItemStatus: ({ uuid = null, takeID = -1 }) => {
		emit(
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
	SetTakeItemOffline: ({ uuid = null, takeID = -1 }) => {
		emit(
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
	SetTakeItemOnline: ({ uuid = null, takeID = -1 }) => {
		emit(
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
	EditTakeItemProperty: ({
		uuid = null,
		takeID = -1,
		objName = '',
		value = '',
		propName = '',
		materialName = null,
	}) => {
		emit(
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
	EditCounterWidget: ({ uuid = null, name = '', value = '' }) => {
		emit(
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
	GetCounterWidgetValue: ({ uuid = null, name = '' }) => {
		emit(
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
	GetClockWidgetTimerValue: ({ uuid = null, name = '' }) => {
		emit(
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
	GetClockWidgetValue: ({ uuid = null, name = '' }) => {
		emit(
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
	StartClockWidget: ({ uuid = null, name = '' }) => {
		emit(
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
	StopClockWidget: ({ uuid = null, name = '' }) => {
		emit(
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
	ResetClockWidget: ({ uuid = null, name = '' }) => {
		emit(
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
	EditClockWidgetFormat: ({ uuid = null, name = '', format = 'NN:SS' }) => {
		emit(
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
	EditClockWidgetStartTime: ({ uuid = null, name = '', startTime = '' }) => {
		emit(
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
	SetClockWidgetTimerValue: ({ uuid = null, name = '', value = '' }) => {
		emit(
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
	SetClockWidgetCallback: ({
		uuid = null,
		name = '',
		callback = (Hours, Minutes, Seconds, Milli) => {
			return { hours: Hours, minutes: Minutes, seconds: Seconds, milliseconds: Milli };
		},
	}) => {
		emit(
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
	GetTextListWidgetValue: ({ uuid = null, name = '' }) => {
		emit(
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
	SetTextListWidgetValues: ({ uuid = null, name = '', values = '0' }) => {
		emit(
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
	SetTextListWidgetItemIndex: ({ uuid = null, name = '', index = '0' }) => {
		emit(
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
	SetTextListWidgetToValue: ({ uuid = null, name = '', index = '0' }) => {
		emit(
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
	ClearTextListWidget: ({ uuid = null, name = '' }) => {
		emit(
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
