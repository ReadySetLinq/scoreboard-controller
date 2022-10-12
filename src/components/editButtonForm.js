import { memo, useState, useEffect, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { isEqual } from 'lodash';

import { defaultButton } from '../jotai/atoms';
import { getButtonSelector, setButtonAtom, getLockedModeAtom } from '../jotai/selectors';
import { zeroPad } from '../services/utilities';

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

export default memo(EditButtonForm, isEqual);
