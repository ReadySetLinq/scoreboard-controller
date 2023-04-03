import { useState, useEffect, useMemo, useRef, lazy, Suspense, useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { RiLockLine, RiLockUnlockLine, RiArrowUpSLine, RiArrowDownSLine } from 'react-icons/ri';

import {
	getButtonsSelector,
	getLockedModeAtom,
	setLockedModeAtom,
	getNodesAtom,
	setNodesAtom,
} from '../jotai/selectors';
import Wrapper from './wrapper';
import GameClock from './gameClock';
import Period from './period';
import { HomeScore, AwayScore } from './score';
import ConfirmBox from './confirmBox';
import Load from './load';
import ButtonList from './buttonList';
import ErrorList from './errorList';

const AddButtonForm = lazy(() => import('./addButtonForm'));
const EditButtonForm = lazy(() => import('./editButtonForm'));

const Scoreboard = () => {
	const isMounted = useRef(false);
	const isLocked = useAtomValue(getLockedModeAtom);
	const setIsLocked = useSetAtom(setLockedModeAtom);
	const buttons = useAtomValue(getButtonsSelector);
	const nodes = useAtomValue(getNodesAtom);
	const setNodes = useSetAtom(setNodesAtom);
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
	const maxNodeLength = useMemo(() => nodes.length - 1, [nodes]);
	const homeScoreIndex = useMemo(() => nodes.find((node) => node.name === 'homeScoreElement').id, [nodes]);
	const awayScoreIndex = useMemo(() => nodes.find((node) => node.name === 'awayScoreElement').id, [nodes]);
	const periodIndex = useMemo(() => nodes.find((node) => node.name === 'periodElement').id, [nodes]);
	const buttonListIndex = useMemo(() => nodes.find((node) => node.name === 'buttonListElement').id, [nodes]);
	const components = useMemo(
		() =>
			[
				{
					component: <HomeScore name='homeScoreElement' setLoadState={setLoadState} />,
					index: homeScoreIndex,
				},
				{
					component: <AwayScore name='awayScoreElement' setLoadState={setLoadState} />,
					index: awayScoreIndex,
				},
				{ component: <Period name='periodElement' setLoadState={setLoadState} />, index: periodIndex },
				{
					component: (
						<ButtonList name='buttonListElement' setLoadState={setLoadState} setConfirmState={setConfirmState} />
					),
					index: buttonListIndex,
				},
			].sort((a, b) => a.index - b.index),
		[homeScoreIndex, awayScoreIndex, periodIndex, buttonListIndex],
	);
	const headerIconClass = useMemo(() => `icon-left icon-clickable ${isLocked ? 'icon-red' : ''}`, [isLocked]);
	const isLoading = useMemo(() => Object.values(loadState).some((value) => value === false), [loadState]);

	const moveNodeUp = useCallback(
		(index) => {
			if (index === 0) return nodes;

			const newNodes = [...nodes];
			const current = nodes[index];
			const prev = nodes[index - 1];

			newNodes[index - 1] = { ...current, id: prev.id };
			newNodes[index] = { ...prev, id: current.id };

			setNodes(newNodes);
			return newNodes;
		},
		[nodes, setNodes],
	);

	const moveNodeDown = useCallback(
		(id) => {
			const index = nodes.findIndex((node) => node.id === id);

			if (index === nodes.length - 1) return nodes;

			const newNodes = [...nodes];
			const current = newNodes[index];
			const next = newNodes[index + 1];

			newNodes[index] = { ...next, id: current.id };
			newNodes[index + 1] = { ...current, id: next.id };

			setNodes(newNodes);
			return newNodes;
		},
		[nodes, setNodes],
	);

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
		return <Load title='Syncing with Xpression' message={'Please wait.'} showXpression={true} />;
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
				{components.map(({ component, index }) => (
					<div className='moveable' key={`moveable-${component.props.name}`}>
						<div className='moveable__controls'>
							<RiArrowUpSLine
								className={`icon-clickable icon-up ${isLocked || index === 0 ? 'hidden' : ''}`}
								onClick={() => moveNodeUp(index)}
								disabled={isLocked || index === 0}
							/>
							<RiArrowDownSLine
								className={`icon-clickable arrow-down icon-down ${isLocked || index === maxNodeLength ? 'hidden' : ''}`}
								onClick={() => moveNodeDown(index)}
								disabled={isLocked || index === maxNodeLength}
							/>
						</div>
						<div className='moveable__content'>{component}</div>
					</div>
				))}{' '}
				<ErrorList name='errorListElement' />
			</div>
			<Suspense
				fallback={
					buttonToEdit === null ? <div className='add-button-form'></div> : <div className='edit-button-form'></div>
				}
			>
				{buttonToEdit === null ? (
					<AddButtonForm />
				) : (
					<EditButtonForm index={buttonToEdit.index} onSubmit={onEditButtonSubmit} />
				)}
			</Suspense>
		</Wrapper>
	);
};

export default Scoreboard;
