import React, { useState, useEffect, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { generate } from 'shortid';
import { RiLockLine, RiLockUnlockLine } from 'react-icons/ri';

import { defaultButton } from '../jotai/atoms';
import {
	getHomeScoreSelector,
	getAwayScoreSelector,
	setHomeScoreAtom,
	setAwayScoreAtom,
	getButtonsSelector,
	removeButtonAtom,
	getLockedModeAtom,
	setLockedModeAtom,
} from '../jotai/selectors';

import { getStyle } from '../services/utilities';
import Emitter from '../services/emitter';
import Wrapper from './wrapper';
import GameClock from './gameClock';
import Button from './button';
import Score from './score';
import ConfirmBox from './confirmBox';
import AddButtonForm from './addButtonForm';
import EditButtonForm from './editButtonForm';

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
	const [confirmState, setConfirmState] = useState({
		show: false,
		title: '',
		message: '',
		onConfirm: null,
		onCancel: null,
	});
	const headerIconClass = useMemo(() => `icon-left icon-clickable ${isLocked ? 'icon-red' : ''}`, [isLocked]);

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
		setConfirmState({
			show: true,
			title: 'Remove Button',
			message: `Are you sure you want to remove the "[${button.xpnTakeId}] ${button.title}" button?`,
			onConfirm: () => {
				removeButton(button);
				if (buttonToEdit && buttonToEdit.index === button.index) setButtonToEdit(null);
				setConfirmState({ show: false, title: '', message: '', onConfirm: null, onCancel: null });
			},
			onCancel: () => setConfirmState({ show: false, title: '', message: '', onConfirm: null, onCancel: null }),
		});
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

	if (confirmState.show) {
		return (
			<Wrapper
				elements={{
					top: (
						<div
							className={`${headerIconClass}`}
							title={`${isLocked ? 'Unlock Edit Mode' : 'Lock Edit Mode'}`}
							onClick={onLockButton}
						>
							{isLocked ? <RiLockLine /> : <RiLockUnlockLine />}
						</div>
					),
					bottom: <GameClock />,
				}}
			>
				<div className='buttons'>
					<ConfirmBox
						show={confirmState.show}
						title={confirmState.title}
						message={confirmState.message}
						onConfirm={confirmState.onConfirm}
						onCancel={confirmState.onCancel}
					/>
				</div>
			</Wrapper>
		);
	}

	return (
		<Wrapper
			elements={{
				top: (
					<div
						className={`${headerIconClass}`}
						title={`${isLocked ? 'Unlock Edit Mode' : 'Lock Edit Mode'}`}
						onClick={onLockButton}
					>
						{isLocked ? <RiLockLine /> : <RiLockUnlockLine />}
					</div>
				),
				bottom: <GameClock />,
			}}
		>
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
		</Wrapper>
	);
};

export default Scoreboard;
