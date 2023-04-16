import { memo, useEffect, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { once } from '@tauri-apps/api/event';
import { generate } from 'shortid';
import { isEqual } from 'lodash';

import {
	getHomeScoreSelector,
	getAwayScoreSelector,
	setHomeScoreAtom,
	setAwayScoreAtom,
	getLockedModeAtom,
} from '../jotai/selectors';
import { getStyle, isNumber } from '../services/utilities';
import { XpnEvents } from '../services/XpnEvents';
import { useDebounce } from '../services/useDebounce';
import Counter from './counter';

const Score = ({ widgetName, placeholder, value, onNameChange, onScoreChange }) => {
	const isLocked = useAtomValue(getLockedModeAtom);

	return (
		<div className='score'>
			<div className='score-name'>
				<input
					className={isLocked ? 'disabled' : ''}
					disabled={isLocked}
					type='text'
					value={widgetName}
					placeholder={placeholder}
					onChange={(event) => onNameChange(event.target.value)}
				/>
			</div>
			<div className='score-score'>
				<Counter title={`score-input-${widgetName}`} onChange={onScoreChange} value={value} />
			</div>
		</div>
	);
};

const Home = ({ setLoadState }) => {
	const isMounted = useRef(false);
	const timerHomeScoreName = useRef(null);
	const homeScore = useAtomValue(getHomeScoreSelector);
	const setHomeScore = useSetAtom(setHomeScoreAtom);
	const scoreName = useDebounce(homeScore.widgetName, 300);
	const scoreValue = useDebounce(homeScore.value, 300);

	const updateScroll = (title) => {
		const input = document.getElementById(`score-input-${title}`);
		if (input) {
			const paddingRight = parseInt(getStyle(input, 'padding-right').replace('px', ''), 0);
			const textLength = homeScore.value.toString().length;
			if (textLength > 5) input.scrollLeft = paddingRight + textLength * 1.5;
			else input.scrollLeft = paddingRight / 1.5;
		}
	};

	const onScoreChange = (increase, amount = 0) => {
		if (increase) {
			setHomeScore({ value: homeScore.value + amount });
		} else {
			setHomeScore({ value: homeScore.value - amount });
		}
	};

	useEffect(() => {
		isMounted.current = true;

		return () => {
			isMounted.current = false;
			clearTimeout(timerHomeScoreName.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!isMounted.current) return;

		const _tmpUUID = `scoreboard-editCounterWidget-${generate()}`;
		const unlisten = once(_tmpUUID, ({ response }) => {
			if (response.toLowerCase().indexOf('Failed') < 0 && isNumber(response)) {
				const returnedValue = parseInt(response, 0);
				const currentValue = parseInt(homeScore.value, 0);
				if (returnedValue !== currentValue) {
					setHomeScore({ value: returnedValue });
					updateScroll(homeScore.widgetName);
				}
			}
		});

		XpnEvents.EditCounterWidget({
			uuid: _tmpUUID,
			name: homeScore.widgetName,
			value: homeScore.value,
		});

		updateScroll(homeScore.widgetName);

		return () => {
			unlisten();
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [scoreValue]);

	useEffect(() => {
		if (!isMounted.current) return;

		if (timerHomeScoreName.current) clearTimeout(timerHomeScoreName.current);

		const _tmpUUID = `scoreboard-getCounterWidgetValue-${generate()}`;
		once(_tmpUUID, ({ response }) => {
			if (response.toLowerCase().indexOf('Failed') < 0 && isNumber(response)) {
				const returnedValue = parseInt(response, 0);
				setHomeScore({ value: returnedValue });
			}
			setLoadState((prevState) => ({ ...prevState, homeScore: true }));
		});

		timerHomeScoreName.current = setTimeout(() => {
			XpnEvents.GetCounterWidgetValue({
				uuid: _tmpUUID,
				name: homeScore.widgetName,
			});
		}, 250);

		return () => {
			clearTimeout(timerHomeScoreName.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [scoreName]);

	return (
		<Score
			widgetName={homeScore.widgetName}
			placeholder='Home Score Widget Name'
			value={homeScore.value}
			onNameChange={(value) => setHomeScore({ widgetName: value })}
			onScoreChange={(increase, amount) => onScoreChange(increase, amount)}
		/>
	);
};
export const HomeScore = memo(Home, isEqual);

const Away = ({ setLoadState }) => {
	const isMounted = useRef(false);
	const timerAwayScoreName = useRef(null);
	const awayScore = useAtomValue(getAwayScoreSelector);
	const setAwayScore = useSetAtom(setAwayScoreAtom);
	const scoreName = useDebounce(awayScore.widgetName, 300);
	const scoreValue = useDebounce(awayScore.value, 300);

	const updateScroll = (title) => {
		const input = document.getElementById(`score-input-${title}`);
		if (input) {
			const paddingRight = parseInt(getStyle(input, 'padding-right').replace('px', ''), 0);
			const textLength = awayScore.value.toString().length;
			if (textLength > 5) input.scrollLeft = paddingRight + textLength * 1.5;
			else input.scrollLeft = paddingRight / 1.5;
		}
	};

	const onScoreChange = (increase, amount = 0) => {
		if (increase) {
			setAwayScore({ value: awayScore.value + amount });
		} else {
			setAwayScore({ value: awayScore.value - amount });
		}
	};

	useEffect(() => {
		isMounted.current = true;

		return () => {
			isMounted.current = false;
			clearTimeout(timerAwayScoreName.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!isMounted.current) return;

		const _tmpUUID = `scoreboard-editCounterWidget-${generate()}`;
		once(_tmpUUID, ({ response }) => {
			if (response.toLowerCase().indexOf('Failed') < 0 && isNumber(response)) {
				const returnedValue = parseInt(response, 0);
				const currentValue = parseInt(awayScore.value, 0);
				if (returnedValue !== currentValue) {
					setAwayScore({ value: returnedValue });
					updateScroll(awayScore.widgetName);
				}
			}
		});

		XpnEvents.EditCounterWidget({
			uuid: _tmpUUID,
			name: awayScore.widgetName,
			value: awayScore.value,
		});

		updateScroll(awayScore.widgetName);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [scoreValue]);

	useEffect(() => {
		if (!isMounted.current) return;

		if (timerAwayScoreName.current) clearTimeout(timerAwayScoreName.current);

		const _tmpUUID = `scoreboard-getCounterWidgetValue-${generate()}`;
		once(_tmpUUID, ({ response }) => {
			if (response.toLowerCase().indexOf('Failed') < 0 && isNumber(response)) {
				const returnedValue = parseInt(response, 0);
				setAwayScore({ value: returnedValue });
			}
			setLoadState((prevState) => ({ ...prevState, awayScore: true }));
		});

		timerAwayScoreName.current = setTimeout(() => {
			XpnEvents.GetCounterWidgetValue({
				uuid: _tmpUUID,
				name: awayScore.widgetName,
			});
		}, 250);

		return () => {
			clearTimeout(timerAwayScoreName.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [scoreName]);

	return (
		<Score
			widgetName={awayScore.widgetName}
			placeholder='Away Score Widget Name'
			value={awayScore.value}
			onNameChange={(value) => setAwayScore({ widgetName: value })}
			onScoreChange={(increase, amount) => onScoreChange(increase, amount)}
		/>
	);
};

export const AwayScore = memo(Away, isEqual);
