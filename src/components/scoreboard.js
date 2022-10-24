import { memo, useState, useEffect, useMemo, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { isEqual } from 'lodash';
import { RiLockLine, RiLockUnlockLine } from 'react-icons/ri';

import { getButtonsSelector, getLockedModeAtom, setLockedModeAtom } from '../jotai/selectors';
import Wrapper from './wrapper';
import GameClock from './gameClock';
import Period from './period';
import { HomeScore, AwayScore } from './score';
import ConfirmBox from './confirmBox';
import Load from './load';
import ButtonList from './buttonList';
import ErrorList from './errorList';
import AddButtonForm from './addButtonForm';
import EditButtonForm from './editButtonForm';

const Scoreboard = () => {
	const isMounted = useRef(false);
	const isLocked = useAtomValue(getLockedModeAtom);
	const setIsLocked = useSetAtom(setLockedModeAtom);
	const buttons = useAtomValue(getButtonsSelector);
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

	const onLockButton = () => setIsLocked(!isLocked);

	const onEditButtonSubmit = () => {
		setButtonToEdit(null);
	};

	useEffect(() => {
		isMounted.current = true;

		return () => {
			isMounted.current = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
				<Period setLoadState={setLoadState} />
				<HomeScore setLoadState={setLoadState} />
				<AwayScore setLoadState={setLoadState} />
				<ButtonList setLoadState={setLoadState} setConfirmState={setConfirmState} />
				<ErrorList />
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
