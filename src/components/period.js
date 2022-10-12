import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { isEqual } from 'lodash';

import { getLockedModeAtom } from '../jotai/selectors';

const Period = (props) => {
	const isLocked = useAtomValue(getLockedModeAtom);

	return (
		<div className='period'>
			<div className='period-name'>
				<input
					className={isLocked ? 'disabled' : ''}
					disabled={isLocked}
					type='text'
					value={props.widgetName}
					placeholder='Widget Name'
					onChange={(event) => props.onNameChange(event.target.value)}
				/>
			</div>
			<div className='period-score'>
				<input
					className={isLocked ? 'disabled' : ''}
					disabled={isLocked}
					type='text'
					value={props.value}
					placeholder='Widget Value'
					onChange={(event) => props.onTextChange(event.target.value)}
				/>
			</div>
		</div>
	);
};

export default memo(Period, isEqual);
