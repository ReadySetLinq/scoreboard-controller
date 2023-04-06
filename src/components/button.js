import { useRef, memo, useEffect, useCallback, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { generate } from 'shortid';
import { isEqual } from 'lodash';
import { RiDeleteBinLine, RiEditBoxLine } from 'react-icons/ri';

import { defaultButton } from '../jotai/atoms';
import {
	getButtonsSelector,
	removeButtonAtom,
	getButtonSelector,
	setButtonAtom,
	getLockedModeAtom,
} from '../jotai/selectors';
import { zeroPad } from '../services/utilities';
import Emitter from '../services/emitter';

const Button = ({ index, highlight, setLoadState, setConfirmState, buttonToEdit, setButtonToEdit }) => {
	const isMounted = useRef(false);
	const isLocked = useAtomValue(getLockedModeAtom);
	const buttons = useAtomValue(getButtonsSelector);
	const removeButton = useSetAtom(removeButtonAtom);
	const button = useAtomValue(getButtonSelector(index));
	const setButton = useSetAtom(setButtonAtom(index));
	const isOnlineClass = useMemo(() => (button.isOnline ? 'isOnline' : ''), [button.isOnline]);
	const isHiddenClass = useMemo(() => (isLocked ? 'hidden' : ''), [isLocked]);

	const onButtonClick = useCallback(() => {
		if (!isMounted.current) return;

		const _tmpUUID = `scoreboard-setTakeItemOnline-${generate()}`;

		Emitter.once(_tmpUUID, (data) => {
			setButton({ isOnline: !!data.response });
		});

		// Take the text back online
		Emitter.emit('xpn.SetTakeItemOnline', {
			uuid: _tmpUUID,
			takeID: button.xpnTakeId,
		});
	}, [button.xpnTakeId, setButton]);

	useEffect(() => {
		if (!isMounted.current) return;

		const _tmpUUID = `scoreboard-getTakeItemStatus-${generate()}`;
		Emitter.once(_tmpUUID, ({ response = false }) => {
			setButton({ isOnline: response });
		});

		Emitter.emit('xpn.GetTakeItemStatus', {
			uuid: _tmpUUID,
			takeID: button.xpnTakeId,
		});

		return () => {
			Emitter.off(_tmpUUID);
		};
	}, [button.xpnTakeId, setButton]);

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

	return (
		<div className={`button ${highlight ? 'highlight' : ''}`}>
			<div className='button-name'>
				<button className={`button-remove ${isHiddenClass}`} title='Delete' onClick={() => onRemoveButton(button)}>
					<RiDeleteBinLine title='Delete' />
				</button>
				<button className={`button-edit ${isHiddenClass}`} onClick={() => onEditButton(button)}>
					<RiEditBoxLine title='Edit' />
				</button>
				<button className={`button-action ${isOnlineClass}`} onClick={onButtonClick}>
					{`[${zeroPad(button.xpnTakeId)}] ${button.title}`}
				</button>
			</div>
		</div>
	);
};

export default memo(Button, isEqual);
