import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { generate } from 'shortid';
import { isEqual } from 'lodash';
import { RiLockLine, RiLockUnlockLine } from 'react-icons/ri';

import { defaultButton } from '../jotai/atoms';
import {
	getPeriodSelector,
	getHomeScoreSelector,
	getAwayScoreSelector,
	setPeriodAtom,
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
import Period from './period';
import Score from './score';
import ConfirmBox from './confirmBox';
import AddButtonForm from './addButtonForm';
import EditButtonForm from './editButtonForm';

const Scoreboard = () => {
	const isLocked = useAtomValue(getLockedModeAtom);
	const setIsLocked = useSetAtom(setLockedModeAtom);
	const period = useAtomValue(getPeriodSelector);
	const setPeriod = useSetAtom(setPeriodAtom);
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
	let updateTimeouts = useRef({
		periodName: null,
		periodValue: null,
		homeScoreName: null,
		awayScoreName: null,
	});
	let isMounted = useRef(false);

	const updateScroll = (title) => {
		const input = document.getElementById(`score-input-${title}`);
		if (input) {
			const paddingRight = parseInt(getStyle(input, 'padding-right').replace('px', ''), 0);
			const textLength = homeScore.value.toString().length;
			if (textLength > 5) input.scrollLeft = paddingRight + textLength * 1.5;
			else input.scrollLeft = paddingRight / 1.5;
		}
	};

	const onPeriodChange = (value) => {
		if (value === 'reset') {
			setPeriod({ value: '1st' });
		} else setPeriod({ value: value });
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
		isMounted.current = true;

		return () => {
			isMounted.current = false;
			clearTimeout(updateTimeouts.current.periodName);
			clearTimeout(updateTimeouts.current.periodValue);
			clearTimeout(updateTimeouts.current.homeScoreName);
			clearTimeout(updateTimeouts.current.awayScoreName);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!isMounted.current) return;

		if (updateTimeouts.current.homeScoreName) clearTimeout(updateTimeouts.current.periodValue);

		const _tmpUUID_set = `scoreboard-setTextListWidgetValues-${generate()}`;
		const _tmpUUID_index = `scoreboard-setTextListWidgetItemIndex-${generate()}`;
		Emitter.once(_tmpUUID_set, () => {
			Emitter.once(_tmpUUID_index, ({ response }) => {
				if (period.value !== response) {
					setPeriod({ value: response });
				}
			});

			Emitter.emit('xpn.SetTextListWidgetItemIndex', {
				uuid: _tmpUUID_index,
				name: homeScore.widgetName,
				index: '0',
			});
		});

		Emitter.emit('xpn.SetTextListWidgetValues', {
			uuid: _tmpUUID_set,
			name: homeScore.widgetName,
			values: homeScore.value,
		});

		return () => {
			Emitter.off(_tmpUUID_set);
			Emitter.off(_tmpUUID_index);
			clearTimeout(updateTimeouts.current.periodValue);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [period.value]);

	useEffect(() => {
		if (!isMounted.current) return;

		const _tmpUUID = `scoreboard-editCounterWidget-${generate()}`;
		Emitter.once(_tmpUUID, ({ response }) => {
			const returnedValue = parseInt(response, 0);
			const currentValue = parseInt(homeScore.value, 0);
			if (returnedValue !== currentValue) {
				setHomeScore({ value: returnedValue });
				updateScroll(homeScore.widgetName);
			}
		});

		Emitter.emit('xpn.EditCounterWidget', {
			uuid: _tmpUUID,
			name: homeScore.widgetName,
			value: homeScore.value,
		});

		updateScroll(homeScore.widgetName);

		return () => {
			Emitter.off(_tmpUUID);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [homeScore.value]);

	useEffect(() => {
		if (!isMounted.current) return;

		const _tmpUUID = `scoreboard-editCounterWidget-${generate()}`;
		Emitter.once(_tmpUUID, ({ response }) => {
			const returnedValue = parseInt(response, 0);
			const currentValue = parseInt(awayScore.value, 0);
			if (returnedValue !== currentValue) {
				setHomeScore({ value: returnedValue });
				updateScroll(awayScore.widgetName);
			}
		});

		Emitter.emit('xpn.EditCounterWidget', {
			uuid: _tmpUUID,
			name: awayScore.widgetName,
			value: awayScore.value,
		});

		updateScroll(awayScore.widgetName);

		return () => {
			Emitter.off(_tmpUUID);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [awayScore.value]);

	useEffect(() => {
		if (!isMounted.current) return;

		if (updateTimeouts.current.periodName) clearTimeout(updateTimeouts.current.periodName);

		const _tmpUUID = `scoreboard-getTextListWidgetValue-${generate()}`;
		Emitter.once(_tmpUUID, ({ response }) => {
			setPeriod({ value: response });
		});

		updateTimeouts.current.periodName = setTimeout(() => {
			Emitter.emit('xpn.GetTextListWidgetValue', {
				uuid: _tmpUUID,
				name: period.widgetName,
			});
		}, 250);

		return () => {
			Emitter.off(_tmpUUID);
			clearTimeout(updateTimeouts.current.periodName);
		};
	}, [period.widgetName, setPeriod]);

	useEffect(() => {
		if (!isMounted.current) return;

		if (updateTimeouts.current.homeScoreName) clearTimeout(updateTimeouts.current.homeScoreName);

		const _tmpUUID = `scoreboard-getCounterWidgetValue-${generate()}`;
		Emitter.once(_tmpUUID, ({ response }) => {
			setHomeScore({ value: response });
		});

		updateTimeouts.current.homeScoreName = setTimeout(() => {
			Emitter.emit('xpn.GetCounterWidgetValue', {
				uuid: _tmpUUID,
				name: homeScore.widgetName,
			});
		}, 250);

		return () => {
			Emitter.off(_tmpUUID);
			clearTimeout(updateTimeouts.current.homeScoreName);
		};
	}, [homeScore.widgetName, setHomeScore]);

	useEffect(() => {
		if (!isMounted.current) return;

		if (updateTimeouts.current.awayScoreName) clearTimeout(updateTimeouts.current.awayScoreName);

		const _tmpUUID = `scoreboard-getCounterWidgetValue-${generate()}`;
		Emitter.once(_tmpUUID, ({ response }) => {
			setAwayScore({ value: response });
		});

		updateTimeouts.current.awayScoreName = setTimeout(() => {
			Emitter.emit('xpn.GetCounterWidgetValue', {
				uuid: _tmpUUID,
				name: awayScore.widgetName,
			});
		}, 250);

		return () => {
			Emitter.off(_tmpUUID);
			clearTimeout(updateTimeouts.current.awayScoreName);
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
				<Period
					widgetName={period.widgetName}
					value={period.value}
					onNameChange={(value) => setPeriod({ widgetName: value })}
					onTextChange={(value) => onPeriodChange(value)}
				/>
				<Score
					widgetName={homeScore.widgetName}
					value={homeScore.value}
					onNameChange={(value) => setHomeScore({ widgetName: value })}
					onScoreChange={(increase, amount) => onScoreChange('HomeScore', increase, amount)}
				/>
				<Score
					widgetName={awayScore.widgetName}
					value={awayScore.value}
					onNameChange={(value) => setAwayScore({ widgetName: value })}
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

export default React.memo(Scoreboard, isEqual);
