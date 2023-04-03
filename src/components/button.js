import { memo, useEffect, useCallback, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { generate } from 'shortid';
import { isEqual } from 'lodash';
import { RiDeleteBinLine, RiEditBoxLine } from 'react-icons/ri';

import { getButtonSelector, setButtonAtom, getLockedModeAtom } from '../jotai/selectors';
import { zeroPad } from '../services/utilities';
import Emitter from '../services/emitter';

const Button = ({ index, highlight, onRemove, onEdit }) => {
	const isLocked = useAtomValue(getLockedModeAtom);
	const button = useAtomValue(getButtonSelector(index));
	const setButton = useSetAtom(setButtonAtom(index));
	const isOnlineClass = useMemo(() => (button.isOnline ? 'isOnline' : ''), [button.isOnline]);
	const isHiddenClass = useMemo(() => (isLocked ? 'hidden' : ''), [isLocked]);

	const onButtonClick = useCallback(() => {
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

	return (
		<div className={`button ${highlight ? 'highlight' : ''}`}>
			<div className='button-name'>
				<button className={`button-remove ${isHiddenClass}`} title='Delete' onClick={onRemove}>
					<RiDeleteBinLine title='Delete' />
				</button>
				<button className={`button-edit ${isHiddenClass}`} onClick={onEdit}>
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
