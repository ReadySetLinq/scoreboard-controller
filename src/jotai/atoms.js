import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { connection, webSockets } from '../services/utilities';

export const defaultHomeScore = {
	title: 'Home Score',
	widgetName: 'homeScore',
	value: 0,
};

export const defaultAwayScore = {
	title: 'AwayScore',
	widgetName: 'awayScore',
	value: 0,
};

export const defaultGameClock = {
	title: 'Game Clock',
	widgetName: 'gameClock',
	value: 0,
};

export const initialWidgetsState = {
	homeScore: { ...defaultHomeScore },
	awayScore: { ...defaultAwayScore },
	gameClock: { ...defaultGameClock },
};

export const widgetsAtom = atomWithStorage('rsl.scoreboard.widgets', { ...initialWidgetsState });

export const defaultButton = {
	index: 0,
	online: false,
	title: '',
	xpnTakeId: 0,
};

export const initialButtonsState = [];

export const buttonsAtom = atomWithStorage('rsl.scoreboard.buttons', [...initialButtonsState]);

export const initialLockedModeState = true;

export const lockedModeAtom = atomWithStorage('rsl.scoreboard.lockedMode', initialLockedModeState);

export const initialConnectionState = connection;

export const connectionAtom = atom(initialConnectionState);

export const initialWebsocketsState = webSockets;

export const websocketsAtom = atom(initialWebsocketsState);

export const initialUrlParams = new URLSearchParams(window.location.search);

export const urlParamsAtom = atom(initialUrlParams);

const Atoms = {
	defaultHomeScore,
	defaultAwayScore,
	defaultGameClock,
	initialWidgetsState,
	widgetsAtom,
	defaultButton,
	initialButtonsState,
	buttonsAtom,
	initialLockedModeState,
	lockedModeAtom,
	initialConnectionState,
	connectionAtom,
	initialWebsocketsState,
	websocketsAtom,
	initialUrlParams,
	urlParamsAtom,
};
export default Atoms;
