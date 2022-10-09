import { atom } from 'jotai';
import { selectAtom, atomFamily } from 'jotai/utils';

import { widgetsAtom, buttonsAtom, defaultButton, lockedModeAtom } from './atoms';

export const getHomeScoreSelector = selectAtom(widgetsAtom, (widget) => widget.homeScore);
export const getAwayScoreSelector = selectAtom(widgetsAtom, (widget) => widget.awayScore);
export const getGameClockSelector = selectAtom(widgetsAtom, (widget) => widget.gameClock);

export const setHomeScoreAtom = atom(null, (_get, set, value) =>
	set(widgetsAtom, (prev) => ({ ...prev, homeScore: { ...prev.homeScore, ...value } })),
);

export const setAwayScoreAtom = atom(null, (_get, set, value) =>
	set(widgetsAtom, (prev) => ({ ...prev, awayScore: { ...prev.awayScore, ...value } })),
);

export const setGameClockAtom = atom(null, (_get, set, value) =>
	set(widgetsAtom, (prev) => ({ ...prev, gameClock: { ...prev.gameClock, ...value } })),
);

export const getButtonsSelector = selectAtom(buttonsAtom, (widget) => widget);

export const setButtonsAtom = atom(null, (_get, set, value) => set(buttonsAtom, (prev) => [...prev, ...value]));

export const addButtonAtom = atom(null, (_get, set, value) => set(buttonsAtom, (prev) => [...prev, { ...value }]));

export const removeButtonAtom = atom(null, (_get, set, value = defaultButton) =>
	set(buttonsAtom, (prev) => [...prev.filter((button) => button.index !== value.index)]),
);

export const getButtonSelector = atomFamily((index) =>
	atom((get) => {
		const button = get(buttonsAtom).find((button) => button.index === index);
		if (button) {
			return { ...defaultButton, ...button };
		}
		return { ...defaultButton };
	}),
);

export const getNextButtonIndexAtom = atom((get) => get(buttonsAtom).length);

export const getNextButtonTakeId = atom((get) => {
	const buttons = get(buttonsAtom);
	const index = buttons.length - 1;
	const button = buttons[index];
	if (button) return parseInt(button.xpnTakeId) + 1 ?? 1;
	return parseInt(defaultButton.xpnTakeId) + 1 ?? 1;
});

export const setButtonAtom = atomFamily((index) =>
	atom(null, (_get, set, value) =>
		set(buttonsAtom, (prev) => [...prev.map((button) => (button.index === index ? { ...button, ...value } : button))]),
	),
);

export const getLockedModeAtom = atom((get) => get(lockedModeAtom));

export const setLockedModeAtom = atom(null, (_get, set, value) => set(lockedModeAtom, value));

const Selectors = {
	getHomeScoreSelector,
	getAwayScoreSelector,
	getGameClockSelector,
	setHomeScoreAtom,
	setAwayScoreAtom,
	setGameClockAtom,
	getButtonsSelector,
	setButtonsAtom,
	addButtonAtom,
	removeButtonAtom,
	getButtonSelector,
	getNextButtonIndexAtom,
	getNextButtonTakeId,
	getLockedModeAtom,
	setLockedModeAtom,
};
export default Selectors;
