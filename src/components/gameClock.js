import { memo, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { generate } from 'shortid';
import { isEqual } from 'lodash';

import { getGameClockSelector, setGameClockAtom, getLockedModeAtom } from '../jotai/selectors';
import { getTimeFromDecimal, getDecimalFromMilliseconds } from '../services/utilities';
import useDebounce from '../services/useDebounce';
import Emitter from '../services/emitter';

const GameClock = () => {
	const isMounted = useRef(false);
	const interval = useRef(null);
	const isLocked = useAtomValue(getLockedModeAtom);
	const gameClock = useAtomValue(getGameClockSelector);
	const setGameClock = useSetAtom(setGameClockAtom);
	const [state, setState] = useState({
		running: false,
		isStarted: false,
		originalValue: 20.0,
		value: 20.0,
		displayTime: '20:00',
		startTime: new Date(),
	});
	const clockName = useDebounce(gameClock.widgetName, 300);
	const isDisabled = useMemo(() => (isLocked || state.running ? 'disabled' : ''), [isLocked, state]);

	const onClockNameChange = useCallback(
		(event) => {
			setGameClock({ widgetName: event.target.value });
		},
		[setGameClock],
	);

	const onClockChange = useCallback(
		(value) => {
			setGameClock({ value: value.toString() });
		},
		[setGameClock],
	);

	const onClockCallback = ({ hours, minutes, seconds, milliseconds }) => {
		console.log('onClockCallback', hours, minutes, seconds, milliseconds);
	};

	const onTick = () => {
		const { minutes, seconds } = getTimeFromDecimal(state.value);
		let isRunning = state.running;
		let newValue = state.value - 0.01;
		if ((newValue - Math.floor(newValue)).toFixed(2) < 0.01) {
			if (state.value > 0.0) {
				newValue = Math.floor(parseFloat(`${newValue - 1}.${60}`)).toFixed(2);
			} else newValue = 0.0;
		}
		if (newValue < 0) newValue = 0;
		setState((oldState) => ({
			...oldState,
			value: newValue,
			running: isRunning,
			displayTime: `${minutes}:${seconds}`,
		}));
	};

	const onStart = () => {
		clearInterval(interval.current);
		setState((oldState) => ({
			...oldState,
			running: true,
			isStarted: true,
		}));
		interval.current = setInterval(() => onTick(), 100);
	};

	const onResume = () => {
		clearInterval(interval.current);
		setState((oldState) => ({
			...oldState,
			running: true,
			isStarted: true,
		}));
		interval.current = setInterval(() => onTick(), 100);
	};

	const onStop = () => {
		setState((oldState) => ({
			...oldState,
			running: false,
			isStarted: false,
		}));
		clearInterval(interval.current);
	};

	const onReset = () => {
		const { minutes, seconds } = getTimeFromDecimal(state.originalValue);
		setState((oldState) => ({
			...oldState,
			value: oldState.originalValue,
			displayTime: `${minutes}:${seconds}`,
		}));
		onClockChange(`${minutes}:${seconds}`);
	};

	useEffect(() => {
		if (!isMounted.current) return;

		let _tmpUUID = `scoreboard-widget-${generate()}`;
		if (state.running) {
			_tmpUUID = `scoreboard-startClockWidget-${generate()}`;
			Emitter.once(_tmpUUID, ({ response }) => {
				console.log(_tmpUUID, response);
			});

			Emitter.emit('xpn.StartClockWidget', {
				uuid: _tmpUUID,
				name: gameClock.widgetName,
			});
		} else {
			_tmpUUID = `scoreboard-stopClockWidget-${generate()}`;
			Emitter.once(_tmpUUID, ({ response }) => {
				console.log(_tmpUUID, response);
			});

			Emitter.emit('xpn.StartClockWidget', {
				uuid: _tmpUUID,
				name: gameClock.widgetName,
			});
		}

		return () => {
			Emitter.off(_tmpUUID);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state.running]);

	useEffect(() => {
		if (!isMounted.current) return;

		const _tmpUUID_value = `scoreboard-getClockWidgetTimerValue-${generate()}`;
		Emitter.once(_tmpUUID_value, ({ response }) => {
			const decimal = getDecimalFromMilliseconds(parseInt(response));
			const { minutes, seconds } = getTimeFromDecimal(state.originalValue);
			console.log(_tmpUUID_value, decimal, `${minutes}:${seconds}`);
			onClockChange(`${minutes}:${seconds}`);
		});

		Emitter.emit('xpn.GetClockWidgetTimerValue', {
			uuid: _tmpUUID_value,
			name: gameClock.widgetName,
		});

		const _tmpUUID_callback = `scoreboard-setClockWidgetCallback-${generate()}`;
		Emitter.once(_tmpUUID_callback, ({ response }) => {
			console.log(_tmpUUID_callback, response);
		});

		Emitter.emit('xpn.SetClockWidgetCallback', {
			uuid: _tmpUUID_callback,
			name: gameClock.widgetName,
			callback: onClockCallback,
		});

		return () => {
			Emitter.off(_tmpUUID_value);
			Emitter.off(_tmpUUID_callback);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [clockName]);

	useEffect(() => {
		interval.current = null;
		isMounted.current = true;

		return () => {
			isMounted.current = false;
			clearInterval(interval.current);
		};
	}, []);

	return (
		<div className='stopwatch'>
			<input
				type='text'
				className={isDisabled}
				disabled={isDisabled === 'disabled'}
				value={gameClock.widgetName}
				onChange={onClockNameChange}
				placeholder='Clock Widget Name'
			/>
			<div className='stopwatch-time'> {gameClock.displayTime} </div>
			{state.running ? (
				<button className='stopwatch-stop' onClick={onStop}>
					Stop
				</button>
			) : state.isStarted ? (
				<button className='stopwatch-start' onClick={onResume}>
					Resume
				</button>
			) : (
				<button className='stopwatch-start' onClick={onStart}>
					Start
				</button>
			)}
			<button className='stopwatch-reset' onClick={onReset}>
				Reset
			</button>
		</div>
	);
};

export default memo(GameClock, isEqual);
