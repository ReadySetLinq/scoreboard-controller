import { memo, useEffect, useCallback, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { generate } from 'shortid';
import { isEqual } from 'lodash';
import { RiDeleteBinLine, RiEditBoxLine } from 'react-icons/ri';

import { getButtonSelector, setButtonAtom, getLockedModeAtom } from '../jotai/selectors';
import { zeroPad } from '../services/utilities';
import Emitter from '../services/emitter';

const Button = (props) => {
	const isLocked = useAtomValue(getLockedModeAtom);
	const button = useAtomValue(getButtonSelector(props.index));
	const setButton = useSetAtom(setButtonAtom(props.index));
	const isOnlineClass = useMemo(() => (button.online ? 'isOnline' : ''), [button.online]);
	const isHiddenClass = useMemo(() => (isLocked ? 'hidden' : ''), [isLocked]);

	const onButtonClick = useCallback(() => {
		const _tmpUUID = `scoreboard-setTakeItemOnline-${generate()}`;

		Emitter.once(_tmpUUID, (data) => {
			setButton({ online: !!data.response });
		});

		// Take the text back online
		Emitter.emit('xpn.SetTakeItemOnline', {
			uuid: _tmpUUID,
			takeID: button.xpnTakeId,
		});
	}, [button.xpnTakeId, setButton]);

	useEffect(() => {
		const _tmpUUID = `scoreboard-getTakeItemStatus-${generate()}`;
		Emitter.once(_tmpUUID, ({ response = false }) => {
			setButton({ online: response });
		});

		Emitter.emit('xpn.GetTakeItemStatus', {
			uuid: _tmpUUID,
			takeID: button.xpnTakeId,
		});

		return () => {
			Emitter.off(_tmpUUID);
		};
	}, [button.xpnTakeId, setButton]);

	return (
		<div className='button'>
			<div className='button-name'>
				<a className={`button-remove ${isHiddenClass}`} title='Delete' onClick={props.onRemove}>
					<RiDeleteBinLine title='Delete' />
				</a>
				<a className={`button-edit ${isHiddenClass}`} onClick={props.onEdit}>
					<RiEditBoxLine title='Edit' />
				</a>
				<button className={`button-action ${isOnlineClass}`} onClick={onButtonClick}>
					{`[${zeroPad(button.xpnTakeId)}] ${button.title}`}
				</button>
			</div>
		</div>
	);
};

export default memo(Button, isEqual);
