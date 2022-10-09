import { atomWithStorage } from 'jotai/utils';

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
};
export default Atoms;
