import { atom } from 'jotai';
import { selectAtom, atomFamily } from 'jotai/utils';

import {
	windowAtom,
	widgetsAtom,
	metadataAtom,
	buttonsAtom,
	defaultButton,
	lockedModeAtom,
	nodesAtom,
	connectionAtom,
} from './atoms';

// Window

export const getWindowSelector = selectAtom(windowAtom, (window) => window);

export const setWindowAtom = atom(null, (get, set, value) => {
	let prev = get(windowAtom);
	if (value.height) {
		prev.height = value.height;
	}
	if (value.width) {
		prev.width = value.width;
	}
	if (value.x) {
		prev.x = value.x;
	}
	if (value.y) {
		prev.y = value.y;
	}
	return set(windowAtom, prev);
});

export const setWindowHeightAtom = atom(null, (get, set, value) => {
	let prev = get(windowAtom);
	prev.height = value;
	return set(windowAtom, prev);
});

export const setWindowWidthAtom = atom(null, (get, set, value) => {
	let prev = get(windowAtom);
	prev.width = value;
	return set(windowAtom, prev);
});

export const setWindowXAtom = atom(null, (get, set, value) => {
	let prev = get(windowAtom);
	prev.x = value;
	return set(windowAtom, prev);
});

export const setWindowYAtom = atom(null, (get, set, value) => {
	let prev = get(windowAtom);
	prev.y = value;
	return set(windowAtom, prev);
});

// Widgets

export const getPeriodSelector = selectAtom(widgetsAtom, (widget) => widget.period);
export const getHomeScoreSelector = selectAtom(widgetsAtom, (widget) => widget.homeScore);
export const getAwayScoreSelector = selectAtom(widgetsAtom, (widget) => widget.awayScore);
export const getGameClockSelector = selectAtom(widgetsAtom, (widget) => widget.gameClock);

export const setPeriodAtom = atom(null, (get, set, value) => {
	let prev = get(widgetsAtom);
	if (value.widgetName) {
		prev.period.widgetName = value.widgetName;
	}
	if (value.value) {
		prev.period.value = value.value;
	}
	return set(widgetsAtom, prev);
});

export const setHomeScoreAtom = atom(null, (get, set, value) => {
	let prev = get(widgetsAtom);
	if (value.widgetName) {
		prev.homeScore.widgetName = value.widgetName;
	}
	if (value.value) {
		prev.homeScore.value = value.value;
	}
	return set(widgetsAtom, prev);
});

export const setAwayScoreAtom = atom(null, (get, set, value) => {
	let prev = get(widgetsAtom);
	if (value.widgetName) {
		prev.awayScore.widgetName = value.widgetName;
	}
	if (value.value) {
		prev.awayScore.value = value.value;
	}
	return set(widgetsAtom, prev);
});

export const setGameClockAtom = atom(null, (get, set, value) => {
	let prev = get(widgetsAtom);
	if (value.widgetName) {
		prev.gameClock.widgetName = value.widgetName;
	}
	if (value.value) {
		prev.gameClock.value = value.value;
	}
	return set(widgetsAtom, prev);
});

// Metadata
export const getMetadataSelector = selectAtom(metadataAtom, (metadata) => metadata);

export const getMetadataIndexSelector = selectAtom(metadataAtom, (metadata) => metadata.index);

export const getMetadataOrderSelector = selectAtom(metadataAtom, (metadata) => metadata.order);

export const setMetadataAtom = atom(null, (get, set, value) => {
	let prev = get(metadataAtom);
	if (value.index) {
		prev.index = value.index;
	}
	if (value.order) {
		prev.order = value.order;
	}
	return set(metadataAtom, prev);
});

export const setMetadataIndexAtom = atom(null, (get, set, value) => {
	let prev = get(metadataAtom);
	prev.index = value;
	return set(metadataAtom, prev);
});

export const setMetadataOrderAtom = atom(null, (get, set, value) => {
	let prev = get(metadataAtom);
	prev.order = value;
	return set(metadataAtom, prev);
});

// Buttons
export const getButtonsSelector = selectAtom(buttonsAtom, (button) => button);

export const setButtonsAtom = atom(null, (_get, set, value) => set(buttonsAtom, value));

export const addButtonAtom = atom(null, (get, set, value) => {
	let prev = get(buttonsAtom);
	prev.push(value);
	return set(buttonsAtom, prev);
});

export const removeButtonAtom = atom(null, (get, set, value = defaultButton) => {
	let prev = get(buttonsAtom);
	let newButtons = [];
	for (const button of prev) {
		if (button.index !== value.index) {
			newButtons.push(button);
		}
	}
	return set(buttonsAtom, newButtons);
});

export const getButtonSelector = atomFamily((index) =>
	atom((get) => {
		const buttons = get(buttonsAtom);
		for (const button of buttons) {
			if (button.index === index) return button;
		}
		return defaultButton;
	}),
);

export const getNextButtonIndexAtom = atom((get) => get(buttonsAtom).length);

export const getNextButtonTakeId = atom((get) => {
	const buttons = get(buttonsAtom);
	const index = buttons.length - 1;
	const button = buttons[index];
	if (button) return parseInt(button.xpnTakeId) + 1;
	return parseInt(defaultButton.xpnTakeId) + 1;
});

export const setButtonAtom = atomFamily((index) => {
	const buttonSet = (button, value) => {
		if (value.index) {
			button.index = value.index;
		}
		if (value.order) {
			button.order = value.order;
		}
		if (value.isNode) {
			button.isNode = value.isNode;
		}
		if (value.isOnline) {
			button.isOnline = value.isOnline;
		}
		if (value.isEditing) {
			button.isEditing = value.isEditing;
		}
		if (value.title) {
			button.title = value.title;
		}
		if (value.xpnTakeId) {
			button.xpnTakeId = value.xpnTakeId;
		}
		return button;
	};

	return atom(null, (get, set, value) => {
		let prev = get(buttonsAtom);
		for (const button of prev) {
			if (button.index === index) {
				buttonSet(button, value);
			}
		}

		return set(buttonsAtom, prev);
	});
});

export const getLockedModeAtom = atom((get) => get(lockedModeAtom));

export const setLockedModeAtom = atom(null, (_get, set, value) => set(lockedModeAtom, value));

// Nodes
export const getNodesAtom = atom((get) => get(nodesAtom));

export const setNodesAtom = atom(null, (_get, set, value) => set(nodesAtom, value));

export const getNodesSortedAtom = atom((get) => {
	const nodes = get(nodesAtom);
	return nodes.sort((a, b) => a.order - b.order);
});

// Connection
export const getConnectionAtom = atom((get) => get(connectionAtom));

export const getIsConnectedSelector = selectAtom(connectionAtom, (connection) => connection.connected);

export const getIsConnectingSelector = selectAtom(connectionAtom, (connection) => connection.connecting);

export const getIsStartedSelector = selectAtom(connectionAtom, (connection) => connection.isStarted);

export const getConnectionMessageSelector = selectAtom(connectionAtom, (connection) => connection.displayMsg);

export const setConnectedAtom = atom(null, (get, set, item = false) => {
	let prev = get(connectionAtom);
	if (item) {
		prev.connected = true;
		prev.connecting = false;
	} else {
		prev.connected = false;
	}
	return set(connectionAtom, prev);
});

export const setIsConnectingAtom = atom(null, (get, set, item = false) => {
	let prev = get(connectionAtom);
	if (item) {
		prev.connecting = true;
		prev.connected = false;
	} else {
		prev.connecting = false;
	}
	return set(connectionAtom, prev);
});

export const setIsStartedAtom = atom(null, (get, set, item = false) => {
	let prev = get(connectionAtom);
	prev.isStarted = item;
	return set(connectionAtom, prev);
});

export const setConnectionMessageAtom = atom(null, (get, set, item = '') => {
	let prev = get(connectionAtom);
	prev.displayMsg = item;
	return set(connectionAtom, prev);
});

const Selectors = {
	getWindowSelector,
	setWindowAtom,
	setWindowHeightAtom,
	setWindowWidthAtom,
	setWindowXAtom,
	setWindowYAtom,
	getPeriodSelector,
	getHomeScoreSelector,
	getAwayScoreSelector,
	getGameClockSelector,
	setPeriodAtom,
	setHomeScoreAtom,
	setAwayScoreAtom,
	setGameClockAtom,
	getMetadataSelector,
	getMetadataIndexSelector,
	getMetadataOrderSelector,
	setMetadataAtom,
	setMetadataIndexAtom,
	getButtonsSelector,
	setButtonsAtom,
	addButtonAtom,
	removeButtonAtom,
	getButtonSelector,
	getNextButtonIndexAtom,
	getNextButtonTakeId,
	getLockedModeAtom,
	setLockedModeAtom,
	getNodesAtom,
	setNodesAtom,
	getNodesSortedAtom,
	getConnectionAtom,
	getIsConnectedSelector,
	getIsConnectingSelector,
	getIsStartedSelector,
	getConnectionMessageSelector,
	setConnectedAtom,
	setIsConnectingAtom,
	setIsStartedAtom,
	setConnectionMessageAtom,
};
export default Selectors;
