import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { RiLockLine, RiLockUnlockLine, RiDeleteBinLine, RiEditBoxLine } from 'react-icons/ri';
import { generate } from 'shortid';

import { defaultButton } from './jotai/atoms';
import {
	getHomeScoreSelector,
	getAwayScoreSelector,
	getGameClockSelector,
	setHomeScoreAtom,
	setAwayScoreAtom,
	setGameClockAtom,
	getButtonsSelector,
	addButtonAtom,
	removeButtonAtom,
	getButtonSelector,
	getNextButtonIndexAtom,
	getNextButtonTakeId,
	setButtonAtom,
	getLockedModeAtom,
	setLockedModeAtom,
} from './jotai/selectors';

import Emitter from './services/emitter';

import './App.css';

const zeroPad = (num, places = 3) => String(num).padStart(places, '0');
const getStyle = (oElm, strCssRule) => {
	var strValue = '';
	if (document.defaultView && document.defaultView.getComputedStyle) {
		strValue = document.defaultView.getComputedStyle(oElm, '').getPropertyValue(strCssRule);
	} else if (oElm.currentStyle) {
		strCssRule = strCssRule.replace(/-(\w)/g, function (strMatch, p1) {
			return p1.toUpperCase();
		});
		strValue = oElm.currentStyle[strCssRule];
	}
	return strValue;
};

const Scoreboard = () => {
	const isLocked = useAtomValue(getLockedModeAtom);
	const setIsLocked = useSetAtom(setLockedModeAtom);
	const homeScore = useAtomValue(getHomeScoreSelector);
	const setHomeScore = useSetAtom(setHomeScoreAtom);
	const awayScore = useAtomValue(getAwayScoreSelector);
	const setAwayScore = useSetAtom(setAwayScoreAtom);
	const buttons = useAtomValue(getButtonsSelector);
	const removeButton = useSetAtom(removeButtonAtom);
	const [buttonToEdit, setButtonToEdit] = useState(null);
	const headerLockClass = useMemo(() => (isLocked ? 'header-lock-toggle' : 'header-unlock-toggle'), [isLocked]);

	const updateScroll = (title) => {
		const input = document.getElementById(`score-input-${title}`);
		if (input) {
			const paddingRight = parseInt(getStyle(input, 'padding-right').replace('px', ''), 0);
			const textLength = homeScore.value.toString().length;
			if (textLength > 5) input.scrollLeft = paddingRight + textLength * 1.5;
			else input.scrollLeft = paddingRight / 1.5;
		}
	};

	const onScoreChange = (title, increase, amount = 0) => {
		switch (title) {
			case 'HomeScore':
				if (increase) {
					setHomeScore({ value: homeScore.value + amount });
				} else {
					setHomeScore({ value: homeScore.value - amount });
				}
				break;

			case 'AwayScore':
				if (increase) {
					setAwayScore({ value: awayScore.value + amount });
				} else {
					setAwayScore({ value: awayScore.value - amount });
				}
				break;

			default:
				break;
		}
	};

	const onEditButton = (button = defaultButton) => {
		if (buttonToEdit === null) setButtonToEdit(button);
		else if (button.index === buttonToEdit.index) setButtonToEdit(null);
	};

	const onEditButtonSubmit = () => {
		setButtonToEdit(null);
	};

	const onRemoveButton = (button = defaultButton) => {
		if (window.confirm(`Are you sure you want to remove button ${button.title}?`)) {
			console.log('onRemoveButton', button);
			removeButton(button);
			if (buttonToEdit && buttonToEdit.index === button.index) {
				setButtonToEdit(null);
			}
		}
	};

	const onLockButton = () => setIsLocked(!isLocked);

	useEffect(() => {
		const _tmpUUID = `scoreboard-editCounterWidget-${generate()}`;
		Emitter.once(_tmpUUID, ({ response }) => {
			const returnedValue = parseInt(response, 0);
			const currentValue = parseInt(homeScore.value, 0);
			if (returnedValue !== currentValue) setHomeScore({ value: returnedValue });
			updateScroll(homeScore.title);
		});

		Emitter.emit('xpn.EditCounterWidget', {
			uuid: _tmpUUID,
			name: homeScore.widgetName,
			value: homeScore.value,
		});

		updateScroll(homeScore.title);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [homeScore.value]);

	useEffect(() => {
		const _tmpUUID = `scoreboard-editCounterWidget-${generate()}`;
		Emitter.once(_tmpUUID, ({ response }) => {
			const returnedValue = parseInt(response, 0);
			const currentValue = parseInt(awayScore.value, 0);
			if (returnedValue !== currentValue) setHomeScore({ value: returnedValue });
			updateScroll(awayScore.title);
		});

		Emitter.emit('xpn.EditCounterWidget', {
			uuid: _tmpUUID,
			name: awayScore.widgetName,
			value: awayScore.value,
		});

		updateScroll(awayScore.title);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [awayScore.value]);

	useEffect(() => {
		const _tmpUUID = `scoreboard-getCounterWidgetValue-${generate()}`;
		Emitter.once(_tmpUUID, ({ response }) => {
			setHomeScore({ value: response });
		});

		Emitter.emit('xpn.GetCounterWidgetValue', {
			uuid: _tmpUUID,
			name: homeScore.widgetName,
		});

		return () => {
			Emitter.off(_tmpUUID);
		};
	}, [homeScore.widgetName, setHomeScore]);

	useEffect(() => {
		const _tmpUUID = `scoreboard-getCounterWidgetValue-${generate()}`;
		Emitter.once(_tmpUUID, ({ response }) => {
			setAwayScore({ value: response });
		});

		Emitter.emit('xpn.GetCounterWidgetValue', {
			uuid: _tmpUUID,
			name: awayScore.widgetName,
		});

		return () => {
			Emitter.off(_tmpUUID);
		};
	}, [awayScore.widgetName, setAwayScore]);

	return (
		<div className='scoreboard'>
			<div className='header'>
				<a
					className={`${headerLockClass}`}
					title={`${isLocked ? 'Unlock Edit Mode' : 'Lock Edit Mode'}`}
					onClick={onLockButton}
				>
					{isLocked ? <RiLockLine /> : <RiLockUnlockLine />}
				</a>
				<h1>Scoreboard</h1>
				<GameClock />
			</div>
			<div className='buttons'>
				<Score
					title={homeScore.title}
					widgetName={homeScore.widgetName}
					value={homeScore.value}
					onTitleChange={(value) => setHomeScore({ title: value })}
					onScoreChange={(increase, amount) => onScoreChange('HomeScore', increase, amount)}
				/>
				<Score
					title={awayScore.title}
					widgetName={awayScore.widgetName}
					value={awayScore.value}
					onTitleChange={(value) => setAwayScore({ title: value })}
					onScoreChange={(increase, amount) => onScoreChange('AwayScore', increase, amount)}
				/>
				{buttons.map((button) => {
					return (
						<Button
							index={button.index}
							key={`buttons-${button.index}`}
							onRemove={() => onRemoveButton(button)}
							onEdit={() => onEditButton(button)}
						/>
					);
				})}
			</div>
			{buttonToEdit === null ? (
				<AddButtonForm />
			) : (
				<EditButtonForm index={buttonToEdit.index} onSubmit={onEditButtonSubmit} />
			)}
		</div>
	);
};

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

const Score = (props) => {
	const isLocked = useAtomValue(getLockedModeAtom);

	return (
		<div className='score'>
			<div className='score-name'>
				<input
					className={isLocked ? 'disabled' : ''}
					disabled={isLocked}
					type='text'
					value={props.title}
					onChange={(event) => props.onTitleChange(event.target.value)}
				/>
			</div>
			<div className='score-score'>
				<Counter title={`score-input-${props.title}`} onChange={props.onScoreChange} value={props.value} />
			</div>
		</div>
	);
};

const Button = (props) => {
	const isLocked = useAtomValue(getLockedModeAtom);
	const button = useAtomValue(getButtonSelector(props.index));
	const setButton = useSetAtom(setButtonAtom(props.index));
	const isOnlineClass = useMemo(() => (button.online ? 'isOnline' : ''), [button.online]);
	const isHiddenClass = useMemo(() => (isLocked ? 'hidden' : ''), [isLocked]);

	const onButtonClick = useCallback(() => {
		const _tmpUUID = `scoreboard-setTakeItemOnline-${generate()}`;

		Emitter.once(_tmpUUID, (data) => {
			console.log('onButtonClick', _tmpUUID, data);
			setButton({ online: !!data.response });
		});

		// Take the text back online
		Emitter.emit('xpn.SetTakeItemOnline', {
			uuid: _tmpUUID,
			takeID: button.xpnTakeId,
		});

		props.onClick();
	}, [button.xpnTakeId, props, setButton]);

	useEffect(() => {
		const _tmpUUID = `scoreboard-getTakeItemStatus-${generate()}`;
		Emitter.once(_tmpUUID, ({ response = false }) => {
			setButton({ online: response });
		});

		Emitter.emit('xpn.GetTakeItemStatus', {
			uuid: _tmpUUID,
			takeID: button.xpnTakeId,
		});

		return () => {
			Emitter.off(_tmpUUID);
		};
	}, [button.xpnTakeId, setButton]);

	return (
		<div className='button'>
			<div className='button-name'>
				<a className={`button-remove ${isHiddenClass}`} title='Delete' onClick={props.onRemove}>
					<RiDeleteBinLine title='Delete' />
				</a>
				<a className={`button-edit ${isHiddenClass}`} onClick={props.onEdit}>
					<RiEditBoxLine title='Edit' />
				</a>
				<button className={`button-action ${isOnlineClass}`} onClick={onButtonClick}>
					{`[${zeroPad(button.xpnTakeId)}] ${button.title}`}
				</button>
			</div>
		</div>
	);
};

const Counter = (props) => {
	const canDecrease = {
		single: props.value <= 0 ? 'disabled' : '',
		double: props.value < 2 ? 'disabled' : '',
	};

	return (
		<div className='counter'>
			<button
				className={`counter-action decrement ${canDecrease.double}`}
				disabled={canDecrease.double === 'disabled'}
				onClick={() => props.onChange(false, 2)}
			>
				-2
			</button>
			<button
				className={`counter-action decrement ${canDecrease.single}`}
				disabled={canDecrease.single === 'disabled'}
				onClick={() => props.onChange(false, 1)}
			>
				-1
			</button>
			<div id={props.title} className='counter-score'>
				{props.value}
			</div>
			<button className='counter-action increment' onClick={() => props.onChange(true, 1)}>
				+1
			</button>
			<button className='counter-action increment' onClick={() => props.onChange(true, 2)}>
				+2
			</button>
		</div>
	);
};

const EditButtonForm = (props) => {
	const isLocked = useAtomValue(getLockedModeAtom);
	const button = useAtomValue(getButtonSelector(props.index));
	const setButton = useSetAtom(setButtonAtom(props.index));
	const [state, setState] = useState({ ...defaultButton });
	const isDisabled = useMemo(
		() => (isLocked || state.title.length === 0 || state.xpnTakeId.toString().length <= 0 ? 'disabled' : ''),
		[isLocked, state],
	);

	const submitBtnText = useMemo(
		() => (button.title !== state.title || button.xpnTakeId !== state.xpnTakeId ? 'Save Changes' : 'Cancel'),
		[button, state],
	);

	const onTitleChange = (e) => {
		const title = e.target.value;
		setState((oldState) => ({ ...oldState, title: title }));
	};

	const onTakeIdChange = (e) => {
		const takeId = e.target.value.toString();
		setState((oldState) => ({ ...oldState, xpnTakeId: takeId.length < 3 ? zeroPad(takeId) : takeId }));
	};

	const onSubmit = (e) => {
		if (e) e.preventDefault();
		setButton({ ...button, title: state.title, xpnTakeId: zeroPad(state.xpnTakeId) });
		props.onSubmit();
	};

	useEffect(() => {
		setState({ ...defaultButton, ...button, xpnTakeId: zeroPad(button.xpnTakeId) });
	}, [button, props.index]);

	return (
		<div className='edit-button-form'>
			<form onSubmit={onSubmit}>
				<input
					className={isLocked ? 'disabled' : ''}
					disabled={isLocked}
					type='text'
					value={state.title}
					onChange={onTitleChange}
					placeholder='Button Tile'
				/>
				<input
					className={isLocked ? 'disabled' : ''}
					disabled={isLocked}
					type='number'
					value={state.xpnTakeId}
					onChange={onTakeIdChange}
					placeholder={`${zeroPad(defaultButton.xpnTakeId)}`}
				/>
				<input
					className={`counter-action decrement ${isDisabled}`}
					disabled={isDisabled === 'disabled'}
					type='submit'
					value={submitBtnText}
				/>
			</form>
		</div>
	);
};

const AddButtonForm = () => {
	const isLocked = useAtomValue(getLockedModeAtom);
	const addButton = useSetAtom(addButtonAtom);
	const nextIndex = useAtomValue(getNextButtonIndexAtom);
	const nextTakeId = useAtomValue(getNextButtonTakeId);
	const [state, setState] = useState({
		...defaultButton,
		index: nextIndex,
		title: '',
		xpnTakeId: zeroPad(nextTakeId),
	});
	const isDisabled = React.useMemo(
		() => (isLocked || state.title.length === 0 || state.xpnTakeId.toString().length <= 0 ? 'disabled' : ''),
		[isLocked, state],
	);

	const onTitleChange = (e) => {
		const title = e.target.value;
		setState((oldState) => ({ ...oldState, title: title }));
	};

	const onTakeIdChange = (e) => {
		const takeId = e.target.value.toString();
		setState((oldState) => ({ ...oldState, xpnTakeId: takeId.length < 3 ? zeroPad(takeId) : takeId }));
	};

	const onSubmit = (e) => {
		if (e) e.preventDefault();
		addButton({
			...defaultButton,
			...state,
			xpnTakeId: parseInt(zeroPad(state.xpnTakeId), 0),
		});
	};

	useEffect(() => {
		setState({ ...defaultButton, index: nextIndex + 1, xpnTakeId: zeroPad(nextTakeId) });
	}, [nextIndex, nextTakeId]);

	return (
		<div className='add-button-form'>
			<form onSubmit={onSubmit}>
				<input
					className={isLocked ? 'disabled' : ''}
					disabled={isLocked}
					type='text'
					title={`${isLocked ? '' : 'Display Title'}`}
					value={state.title}
					onChange={onTitleChange}
					placeholder='Button Tile'
				/>
				<input
					className={isLocked ? 'disabled' : ''}
					disabled={isLocked}
					type='number'
					title={`${isLocked ? '' : 'Sequencer Take ID'}`}
					value={state.xpnTakeId}
					onChange={onTakeIdChange}
					placeholder={`${zeroPad(nextTakeId)}`}
				/>
				<input
					className={`counter-action decrement ${isDisabled}`}
					disabled={isDisabled === 'disabled'}
					type='submit'
					value='Add Button'
				/>
			</form>
		</div>
	);
};

export default Scoreboard;
