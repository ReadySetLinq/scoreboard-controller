import { memo, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { generate } from 'shortid';
import { isEqual } from 'lodash';

import { getGameClockSelector, setGameClockAtom, getLockedModeAtom } from '../jotai/selectors';
import { timeSpan } from '../services/utilities';
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
		previouseTime: '0',
	});
	const isDisabled = useMemo(() => (isLocked || state.running ? 'disabled' : ''), [isLocked, state]);

	// ADD EXPRESSION LOGIC HERE

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

	const onStart = () => {
		clearInterval(interval.current);
		const ts = timeSpan.FromMilliseconds(Date.now().getMilliseconds());
		const time = `${ts.minutes}:${ts.seconds}`;
		setState((oldState) => ({
			...oldState,
			running: true,
			isStarted: true,
			previouseTime: time,
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

	const onReset = useCallback(() => {
		const ts = timeSpan.FromMilliseconds(Date.now().getMilliseconds());
		const time = `${ts.minutes}:${ts.seconds}`;
		setState((oldState) => ({
			...oldState,
			previouseTime: time,
		}));
		onClockChange('00:00');
	}, [onClockChange]);

	const onTick = () => {
		const ts = timeSpan.FromMilliseconds(Date.now().getMilliseconds());
		const time = `${ts.minutes}:${ts.seconds}`;
		setState((oldState) => ({
			...oldState,
			previouseTime: time,
		}));
	};

	useEffect(() => {
		interval.current = null;
		isMounted.current = true;

		return () => {
			isMounted.current = false;
			clearInterval(interval.current);
		};
	}, []);

	useEffect(() => {
		if (!isMounted.current) return;

		let _tmpUUID = `scoreboard-widget-${generate()}`;
		if (state.running) {
			_tmpUUID = `scoreboard-startClockWidget-${generate()}`;
			Emitter.once(_tmpUUID, ({ response }) => {
				console.log(response);
			});

			Emitter.emit('xpn.StartClockWidget', {
				uuid: _tmpUUID,
				name: gameClock.widgetName,
			});
		} else {
			_tmpUUID = `scoreboard-stopClockWidget-${generate()}`;
			Emitter.once(_tmpUUID, ({ response }) => {
				console.log(response);
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
			const ts = timeSpan.FromMilliseconds(response);
			const time = `${ts.minutes}:${ts.seconds}`;
			onClockChange(time);
			console.log(time, ts);
		});

		Emitter.emit('xpn.GetClockWidgetTimerValue', {
			uuid: _tmpUUID_value,
			name: gameClock.widgetName,
		});

		const _tmpUUID_callback = `scoreboard-setClockWidgetCallback-${generate()}`;
		Emitter.once(_tmpUUID_callback, ({ response }) => {
			console.log(response);
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
	}, [gameClock.widgetName]);

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
			<div className='stopwatch-time'> {gameClock.value} </div>
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
