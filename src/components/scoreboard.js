import { useState, useEffect, useMemo, useRef, lazy, Suspense, useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { RiLockLine, RiLockUnlockLine, RiArrowUpSLine, RiArrowDownSLine } from 'react-icons/ri';

import {
	getButtonsSelector,
	setButtonsAtom,
	getLockedModeAtom,
	setLockedModeAtom,
	getMetadataOrderSelector,
	getNodesAtom,
	setNodesAtom,
} from '../jotai/selectors';
import Wrapper from './wrapper';
import GameClock from './gameClock';
import Period from './period';
import { HomeScore, AwayScore } from './score';
import ConfirmBox from './confirmBox';
import Load from './load';
import Button from './button';
import ErrorList from './errorList';

const AddButtonForm = lazy(() => import('./addButtonForm'));
const EditButtonForm = lazy(() => import('./editButtonForm'));

const Scoreboard = () => {
	const isMounted = useRef(false);
	const isLocked = useAtomValue(getLockedModeAtom);
	const setIsLocked = useSetAtom(setLockedModeAtom);
	const buttons = useAtomValue(getButtonsSelector);
	const setButtons = useSetAtom(setButtonsAtom);
	const nodes = useAtomValue(getNodesAtom);
	const setNodes = useSetAtom(setNodesAtom);
	const metadataOrder = useAtomValue(getMetadataOrderSelector);
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
	const homeScoreNode = useMemo(() => nodes.find((node) => node.name === 'homeScoreElement'), [nodes]);
	const awayScoreNode = useMemo(() => nodes.find((node) => node.name === 'awayScoreElement'), [nodes]);
	const periodNode = useMemo(() => nodes.find((node) => node.name === 'periodElement'), [nodes]);
	const components = useMemo(
		() =>
			[
				...[
					{
						index: homeScoreNode.index,
						order: homeScoreNode.order,
						isNode: true,
						component: <HomeScore name='homeScoreElement' setLoadState={setLoadState} />,
					},
					{
						index: awayScoreNode.index,
						order: awayScoreNode.order,
						isNode: true,
						component: <AwayScore name='awayScoreElement' setLoadState={setLoadState} />,
					},
					{
						index: periodNode.index,
						order: periodNode.order,
						isNode: true,
						component: <Period name='periodElement' setLoadState={setLoadState} />,
					},
				],
				...buttons.map((button) => {
					return {
						index: button.index,
						order: button.order,
						isNode: false,
						component: (
							<Button
								key={`buttons-${button.index}`}
								name={`customBtn-${button.xpnTakeId}`}
								index={button.index}
								highlight={buttonToEdit && buttonToEdit.index === button.index ? true : false}
								setLoadState={setLoadState}
								setConfirmState={setConfirmState}
								buttonToEdit={buttonToEdit}
								setButtonToEdit={setButtonToEdit}
							/>
						),
					};
				}),
			].sort((a, b) => a.order - b.order),
		[
			homeScoreNode.index,
			homeScoreNode.order,
			awayScoreNode.index,
			awayScoreNode.order,
			periodNode.index,
			periodNode.order,
			buttons,
			buttonToEdit,
		],
	);
	const headerIconClass = useMemo(() => `icon-left icon-clickable ${isLocked ? 'icon-red' : ''}`, [isLocked]);
	const isLoading = useMemo(() => Object.values(loadState).some((value) => value === false), [loadState]);

	const moveNodeUp = useCallback(
		(order) => {
			// Find the node and button with the same index
			const node = nodes.findIndex((node) => node.order === order);
			const prevNode = nodes.findIndex((node) => node.order === order - 1);
			const button = buttons.findIndex((button) => button.order === order);
			const prevButton = buttons.findIndex((button) => button.order === order - 1);

			const newNodes = [...nodes];
			const newButtons = [...buttons];

			// If the node exists, update the order
			if (node >= 0 && order - 1 >= 0)
				newNodes[node] = {
					...newNodes[node],
					order: order - 1,
				};

			// If the previous node exists, update the order
			if (prevNode >= 0)
				newNodes[prevNode] = {
					...newNodes[prevNode],
					order: order,
				};

			// If the button exists, update the order
			if (button >= 0 && order - 1 >= 0)
				newButtons[button] = {
					...newButtons[button],
					order: order - 1,
				};

			// If the previous button exists, update the order
			if (prevButton >= 0 && order - 1 >= 0)
				newButtons[prevButton] = {
					...newButtons[prevButton],
					order: order,
				};

			// Update the nodes and buttons
			setNodes(newNodes);
			setButtons(newButtons);
		},
		[buttons, nodes, setButtons, setNodes],
	);

	const moveNodeDown = useCallback(
		(order) => {
			// Find the node and button with the same index
			const node = nodes.findIndex((node) => node.order === order);
			const nextNode = nodes.findIndex((node) => node.order === order + 1);
			const button = buttons.findIndex((button) => button.order === order);
			const nextButton = buttons.findIndex((button) => button.order === order + 1);

			const newNodes = [...nodes];
			const newButtons = [...buttons];

			// If the node exists, update the order
			if (node >= 0)
				newNodes[node] = {
					...newNodes[node],
					order: order + 1,
				};

			// If the next node exists, update the order
			if (nextNode >= 0)
				newNodes[nextNode] = {
					...newNodes[nextNode],
					order: order,
				};

			// If the button exists, update the order
			if (button >= 0)
				newButtons[button] = {
					...newButtons[button],
					order: order + 1,
				};

			// If the next button exists, update the order
			if (nextButton >= 0)
				newButtons[nextButton] = {
					...newButtons[nextButton],
					order: order,
				};

			// Update the nodes and buttons
			setNodes(newNodes);
			setButtons(newButtons);
		},
		[buttons, nodes, setButtons, setNodes],
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

	/* TOD: Re-add this for main deployment
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
					<div className='moveable' key={`moveable-${index}-${component.props.name}`}>
						{!isLocked && (
							<div className='moveable__controls'>
								<RiArrowUpSLine
									className={`icon-clickable icon-up ${order === 0 ? 'disabled' : ''} ${isLocked ? 'no_display' : ''}`}
									onClick={() => moveNodeUp(order)}
									disabled={isLocked || order === 0}
								/>
								<RiArrowDownSLine
									className={`icon-clickable arrow-down icon-down ${order === metadataOrder ? 'disabled' : ''} ${
										isLocked ? 'no_display' : ''
									}`}
									onClick={() => moveNodeDown(order)}
									disabled={isLocked || order === metadataOrder}
								/>
							</div>
						)}
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
