import { useState, useEffect, useMemo, useRef, lazy, Suspense, useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { RiLockLine, RiLockUnlockLine, RiArrowUpSLine, RiArrowDownSLine } from 'react-icons/ri';

import {
	getButtonsSelector,
	getLockedModeAtom,
	setLockedModeAtom,
	getNodesSortedAtom,
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
	const sortedNodes = useAtomValue(getNodesSortedAtom);
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
	const maxNodeLength = useMemo(() => sortedNodes.length - 1, [sortedNodes]);
	const homeScoreNode = useMemo(() => sortedNodes.find((node) => node.name === 'homeScoreElement'), [sortedNodes]);
	const awayScoreNode = useMemo(() => sortedNodes.find((node) => node.name === 'awayScoreElement'), [sortedNodes]);
	const periodNode = useMemo(() => sortedNodes.find((node) => node.name === 'periodElement'), [sortedNodes]);
	const buttonListNode = useMemo(() => sortedNodes.find((node) => node.name === 'buttonListElement'), [sortedNodes]);
	const components = useMemo(
		() =>
			[
				{
					index: homeScoreNode.id,
					order: homeScoreNode.order,
					component: <HomeScore name='homeScoreElement' setLoadState={setLoadState} />,
				},
				{
					index: awayScoreNode.id,
					order: awayScoreNode.order,
					component: <AwayScore name='awayScoreElement' setLoadState={setLoadState} />,
				},
				{
					index: periodNode.id,
					order: periodNode.order,
					component: <Period name='periodElement' setLoadState={setLoadState} />,
				},
				{
					index: buttonListNode.id,
					order: buttonListNode.order,
					component: (
						<ButtonList name='buttonListElement' setLoadState={setLoadState} setConfirmState={setConfirmState} />
					),
				},
			].sort((a, b) => a.order - b.order),
		[homeScoreNode, awayScoreNode, periodNode, buttonListNode],
	);
	const headerIconClass = useMemo(() => `icon-left icon-clickable ${isLocked ? 'icon-red' : ''}`, [isLocked]);
	const isLoading = useMemo(() => Object.values(loadState).some((value) => value === false), [loadState]);

	const moveNodeUp = useCallback(
		(id) => {
			const index = sortedNodes.findIndex((node) => node.id === id);

			console.log('moveNodeUp', index, sortedNodes[index]);

			if (index === 0) return sortedNodes;

			const newNodes = [...sortedNodes];
			const current = newNodes[index];
			const prev = newNodes[index - 1];

			newNodes[index - 1] = { ...prev, order: current.order };
			newNodes[index] = { ...current, order: prev.order };

			setNodes(newNodes);
			return newNodes;
		},
		[sortedNodes, setNodes],
	);

	const moveNodeDown = useCallback(
		(id) => {
			const index = sortedNodes.findIndex((node) => node.id === id);

			console.log('moveNodeDown', index, sortedNodes[index]);

			if (index === sortedNodes.length - 1) return sortedNodes;

			const newNodes = [...sortedNodes];
			const current = newNodes[index];
			const next = newNodes[index + 1];

			newNodes[index] = { ...current, order: next.order };
			newNodes[index + 1] = { ...next, order: current.order };

			setNodes(newNodes);
			return newNodes;
		},
		[sortedNodes, setNodes],
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

	/*
	if (isLoading) {
		return <Load title='Syncing with Xpression' message={'Please wait.'} showXpression={true} />;
	}
	// */

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
				{components.map(({ component, index, order }) => (
					<div className='moveable' key={`moveable-${component.props.name}`}>
						<div className='moveable__controls'>
							<RiArrowUpSLine
								className={`icon-clickable icon-up ${isLocked || order === 0 ? 'hidden' : ''}`}
								onClick={() => moveNodeUp(index)}
								disabled={isLocked || order === 0}
							/>
							<RiArrowDownSLine
								className={`icon-clickable arrow-down icon-down ${isLocked || order === maxNodeLength ? 'hidden' : ''}`}
								onClick={() => moveNodeDown(index)}
								disabled={isLocked || order === maxNodeLength}
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
