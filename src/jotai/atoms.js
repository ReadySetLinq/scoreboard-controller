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
	value: 0,
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
	online: false,
	title: '',
	xpnTakeId: 0,
};

export const initialButtonsState = [];

export const buttonsAtom = atomWithStorage('rsl.scoreboard.buttons', [...initialButtonsState]);

export const initialLockedModeState = true;

export const lockedModeAtom = atomWithStorage('rsl.scoreboard.lockedMode', initialLockedModeState);

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
	defaultConnection,
	connectionAtom,
	initialUrlParams,
	urlParamsAtom,
};
export default Atoms;
