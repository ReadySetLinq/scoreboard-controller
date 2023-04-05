import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const defaultPeriod = {
	widgetName: 'period',
	value: '1st',
};

export const defaultHomeScore = {
	widgetName: 'homeScore',
	value: 0,
};

export const defaultAwayScore = {
	widgetName: 'awayScore',
	value: 0,
};

export const defaultGameClock = {
	widgetName: 'gameClock',
	value: '00:00',
};

export const initialWidgetsState = {
	period: defaultPeriod,
	homeScore: { ...defaultHomeScore },
	awayScore: { ...defaultAwayScore },
	gameClock: { ...defaultGameClock },
};

export const widgetsAtom = atomWithStorage('rsl.scoreboard.widgets', { ...initialWidgetsState });

export const defaultButton = {
	index: 0,
	isOnline: false,
	isEditing: false,
	title: '',
	xpnTakeId: 0,
};

export const initialButtonsState = [];

export const buttonsAtom = atomWithStorage('rsl.scoreboard.buttons', [...initialButtonsState]);

export const initialLockedModeState = true;

export const lockedModeAtom = atomWithStorage('rsl.scoreboard.lockedMode', !!initialLockedModeState);

export const defaultNodeList = [
	{ id: 0, order: 0, name: 'homeScoreElement' },
	{ id: 1, order: 1, name: 'awayScoreElement' },
	{ id: 2, order: 2, name: 'periodElement' },
	{ id: 3, order: 3, name: 'buttonListElement' },
];

export const nodesAtom = atomWithStorage('rsl.scoreboard.nodes', [...defaultNodeList]);

export const defaultNetworkSettingsData = {
	ip: 'localhost',
	port: 0,
	userName: 'brtf',
	password: '',
};

export const defaultConnection = {
	connected: false,
	connecting: false,
	isStarted: false,
	displayMsg: '',
};

export const connectionAtom = atom(defaultConnection);

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
	defaultNodeList,
	nodesAtom,
	defaultNetworkSettingsData,
	defaultConnection,
	connectionAtom,
	initialUrlParams,
	urlParamsAtom,
};
export default Atoms;
