import { useState, useEffect, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';

import { defaultButton } from '../jotai/atoms';
import {
	addButtonAtom,
	getNextButtonTakeId,
	getMetadataSelector,
	setMetadataAtom,
	getLockedModeAtom,
} from '../jotai/selectors';
import { zeroPad } from '../services/utilities';

const AddButtonForm = () => {
	const isLocked = useAtomValue(getLockedModeAtom);
	const addButton = useSetAtom(addButtonAtom);
	const nextTakeId = useAtomValue(getNextButtonTakeId);
	const metadata = useAtomValue(getMetadataSelector);
	const setMetadata = useSetAtom(setMetadataAtom);
	const [state, setState] = useState({
		...defaultButton,
		index: metadata.index + 1,
		order: metadata.order + 1,
		title: '',
		xpnTakeId: zeroPad(nextTakeId),
	});
	const isDisabled = useMemo(
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
		setMetadata({ ...metadata, index: state.index, order: state.order });
		addButton({
			...defaultButton,
			...state,
			xpnTakeId: parseInt(zeroPad(state.xpnTakeId), 0),
		});
	};

	useEffect(() => {
		setState({
			...defaultButton,
			index: metadata.index + 1,
			order: metadata.order + 1,
			xpnTakeId: zeroPad(nextTakeId),
		});
	}, [metadata, nextTakeId]);

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

export default AddButtonForm;
