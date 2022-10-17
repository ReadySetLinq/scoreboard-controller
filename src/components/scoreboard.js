import { memo, useState, useEffect, useMemo, useRef } from 'react';
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

import { getStyle, isNumber } from '../services/utilities';
import Emitter from '../services/emitter';
import Wrapper from './wrapper';
import GameClock from './gameClock';
import Button from './button';
import Period from './period';
import Score from './score';
import ConfirmBox from './confirmBox';
import Load from './load';
import AddButtonForm from './addButtonForm';
import EditButtonForm from './editButtonForm';

const Scoreboard = () => {
	const isMounted = useRef(false);
	const timerPeriodName = useRef(null);
	const timerPeriodValue = useRef(null);
	const timerHomeScoreName = useRef(null);
	const timerAwayScoreName = useRef(null);
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
	const [loadState, setLoadState] = useState({
		period: false,
		homeScore: false,
		awayScore: false,
		buttons: false,
	});
	const headerIconClass = useMemo(() => `icon-left icon-clickable ${isLocked ? 'icon-red' : ''}`, [isLocked]);
	const isLoading = useMemo(() => Object.values(loadState).some((value) => value === false), [loadState]);

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
			clearTimeout(timerPeriodName.current);
			clearTimeout(timerPeriodValue.current);
			clearTimeout(timerHomeScoreName.current);
			clearTimeout(timerAwayScoreName.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!isMounted.current) return;

		if (timerPeriodValue.current) clearTimeout(timerPeriodValue.current);

		const _tmpUUID_set = `scoreboard-setTextListWidgetValues-${generate()}`;
		const _tmpUUID_index = `scoreboard-setTextListWidgetItemIndex-${generate()}`;
		Emitter.once(_tmpUUID_set, () => {
			Emitter.once(_tmpUUID_index, ({ response }) => {
				if (response !== false && period.value !== response) {
					setPeriod({ value: response });
				}
			});

			Emitter.emit('xpn.SetTextListWidgetItemIndex', {
				uuid: _tmpUUID_index,
				name: period.widgetName,
				index: '0',
			});
		});

		Emitter.emit('xpn.SetTextListWidgetValues', {
			uuid: _tmpUUID_set,
			name: period.widgetName,
			values: period.value,
		});

		return () => {
			Emitter.off(_tmpUUID_set);
			Emitter.off(_tmpUUID_index);
			clearTimeout(timerPeriodValue.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [period.value]);

	useEffect(() => {
		if (!isMounted.current) return;

		const _tmpUUID = `scoreboard-editCounterWidget-${generate()}`;
		Emitter.once(_tmpUUID, ({ response }) => {
			if (response.toLowerCase().indexOf('Failed') < 0 && isNumber(response)) {
				const returnedValue = parseInt(response, 0);
				const currentValue = parseInt(homeScore.value, 0);
				if (returnedValue !== currentValue) {
					setHomeScore({ value: returnedValue });
					updateScroll(homeScore.widgetName);
				}
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
			if (response.toLowerCase().indexOf('Failed') < 0 && isNumber(response)) {
				const returnedValue = parseInt(response, 0);
				const currentValue = parseInt(awayScore.value, 0);
				if (returnedValue !== currentValue) {
					setAwayScore({ value: returnedValue });
					updateScroll(awayScore.widgetName);
				}
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

		if (timerPeriodName.current) clearTimeout(timerPeriodName.current);

		const _tmpUUID = `scoreboard-getTextListWidgetValue-${generate()}`;
		Emitter.once(_tmpUUID, ({ response }) => {
			if (response !== false) setPeriod({ value: response });
			else setPeriod({ value: '' });
			setLoadState((prevState) => ({ ...prevState, period: true }));
		});

		timerPeriodName.current = setTimeout(() => {
			Emitter.emit('xpn.GetTextListWidgetValue', {
				uuid: _tmpUUID,
				name: period.widgetName,
			});
		}, 250);

		return () => {
			Emitter.off(_tmpUUID);
			clearTimeout(timerPeriodName.current);
		};
	}, [period.widgetName, setPeriod]);

	useEffect(() => {
		if (!isMounted.current) return;

		if (timerHomeScoreName.current) clearTimeout(timerHomeScoreName.current);

		const _tmpUUID = `scoreboard-getCounterWidgetValue-${generate()}`;
		Emitter.once(_tmpUUID, ({ response }) => {
			if (response.toLowerCase().indexOf('Failed') < 0 && isNumber(response)) {
				const returnedValue = parseInt(response, 0);
				setHomeScore({ value: returnedValue });
			}
			setLoadState((prevState) => ({ ...prevState, homeScore: true }));
		});

		timerHomeScoreName.current = setTimeout(() => {
			Emitter.emit('xpn.GetCounterWidgetValue', {
				uuid: _tmpUUID,
				name: homeScore.widgetName,
			});
		}, 250);

		return () => {
			Emitter.off(_tmpUUID);
			clearTimeout(timerHomeScoreName.current);
		};
	}, [homeScore.widgetName, setHomeScore]);

	useEffect(() => {
		if (!isMounted.current) return;

		if (timerAwayScoreName.current) clearTimeout(timerAwayScoreName.current);

		const _tmpUUID = `scoreboard-getCounterWidgetValue-${generate()}`;
		Emitter.once(_tmpUUID, ({ response }) => {
			if (response.toLowerCase().indexOf('Failed') < 0 && isNumber(response)) {
				const returnedValue = parseInt(response, 0);
				setAwayScore({ value: returnedValue });
			}

			setLoadState((prevState) => ({ ...prevState, awayScore: true }));
		});

		timerAwayScoreName.current = setTimeout(() => {
			Emitter.emit('xpn.GetCounterWidgetValue', {
				uuid: _tmpUUID,
				name: awayScore.widgetName,
			});
		}, 250);

		return () => {
			Emitter.off(_tmpUUID);
			clearTimeout(timerAwayScoreName.current);
		};
	}, [awayScore.widgetName, setAwayScore]);

	useEffect(() => {
		if (!isMounted.current) return;

		const buttonsLoaded = Object.values(buttons).some((value) => parseInt(value.xpnTakeId) !== 0);
		if (buttonsLoaded) setLoadState((prevState) => ({ ...prevState, buttons: true }));
	}, [buttons]);

	if (isLoading) {
		return <Load title='Syncing with Xpression' message={'Please wait.'} />;
	}

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

export default memo(Scoreboard, isEqual);
