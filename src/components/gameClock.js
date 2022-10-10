import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';

import { getGameClockSelector, setGameClockAtom, getLockedModeAtom } from '../jotai/selectors';

const GameClock = () => {
	const isLocked = useAtomValue(getLockedModeAtom);
	const gameClock = useAtomValue(getGameClockSelector);
	const setGameClock = useSetAtom(setGameClockAtom);
	const [state, setState] = useState({
		running: false,
		previouseTime: 0,
		elapsedTime: gameClock.value,
	});
	const isDisabled = useMemo(() => (isLocked || state.running ? 'disabled' : ''), [isLocked, state]);
	const interval = useRef(null);

	const onClockTitleChange = useCallback(
		(event) => {
			setGameClock({ title: event.target.value });
		},
		[setGameClock],
	);

	const onClockChange = useCallback(
		(value) => {
			setGameClock({ value: Math.floor(value / 1000) });
		},
		[setGameClock],
	);

	const onStart = () => {
		setState((oldState) => ({
			...oldState,
			running: true,
			previouseTime: Date.now(),
		}));
		interval.current = setInterval(() => onTick(), 100);
	};

	const onStop = () => {
		setState((oldState) => ({
			...oldState,
			running: false,
		}));
		clearInterval(interval.current);
	};

	const onReset = useCallback(() => {
		setState((oldState) => ({
			...oldState,
			elapsedTime: 0,
			previouseTime: Date.now(),
		}));
		onClockChange(0);
	}, [onClockChange]);

	const onTick = () => {
		const now = Date.now();
		setState((oldState) => ({
			...oldState,
			elapsedTime: oldState.elapsedTime + (now - oldState.previouseTime),
			previouseTime: now,
		}));
	};

	useEffect(() => {
		onClockChange(state.elapsedTime);
	}, [onClockChange, state.elapsedTime]);

	useEffect(() => {
		interval.current = null;

		return () => clearInterval(interval.current);
	}, []);

	return (
		<div className='stopwatch'>
			<input
				type='text'
				className={isDisabled}
				disabled={isDisabled === 'disabled'}
				value={gameClock.title}
				onChange={onClockTitleChange}
				placeholder='Button Tile'
			/>
			<div className='stopwatch-time'> {gameClock.value} </div>
			{state.running ? (
				<button className='stopwatch-stop' onClick={onStop}>
					Stop
				</button>
			) : (
				<button className='stopwatch-start' onClick={onStart}>
					{state.elapsedTime === 0 ? 'Start' : 'Resume'}
				</button>
			)}
			<button className='stopwatch-reset' onClick={onReset}>
				Reset
			</button>
		</div>
	);
};

export default GameClock;
