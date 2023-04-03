import { memo, useEffect, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { isEqual } from 'lodash';

import { defaultButton } from '../jotai/atoms';
import { getButtonsSelector, removeButtonAtom } from '../jotai/selectors';

import Button from './button';

const ButtonList = ({ setLoadState, setConfirmState, buttonToEdit, setButtonToEdit }) => {
	const isMounted = useRef(false);
	const buttons = useAtomValue(getButtonsSelector);
	const removeButton = useSetAtom(removeButtonAtom);

	const onEditButton = (button = defaultButton) => {
		if (buttonToEdit !== null && button.index === buttonToEdit.index) setButtonToEdit(null);
		else setButtonToEdit(button);
	};

	const onRemoveButton = (button = defaultButton) => {
		if (!isMounted.current) return;

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
	}, [buttons, setLoadState]);

	return (
		<div className='buttons__row'>
			<p className='buttonList__scene'>Scene Buttons</p>
			{buttons.map((button) => {
				return (
					<Button
						index={button.index}
						key={`buttons-${button.index}`}
						highlight={buttonToEdit && buttonToEdit.index === button.index ? true : false}
						onRemove={() => onRemoveButton(button)}
						onEdit={() => onEditButton(button)}
					/>
				);
			})}
		</div>
	);
};

export default memo(ButtonList, isEqual);
