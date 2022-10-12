import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { isEqual } from 'lodash';

import { getLockedModeAtom } from '../jotai/selectors';
import Counter from './counter';

const Score = (props) => {
	const isLocked = useAtomValue(getLockedModeAtom);

	return (
		<div className='score'>
			<div className='score-name'>
				<input
					className={isLocked ? 'disabled' : ''}
					disabled={isLocked}
					type='text'
					value={props.widgetName}
					placeholder='Widget Name'
					onChange={(event) => props.onNameChange(event.target.value)}
				/>
			</div>
			<div className='score-score'>
				<Counter title={`score-input-${props.widgetName}`} onChange={props.onScoreChange} value={props.value} />
			</div>
		</div>
	);
};

export default memo(Score, isEqual);
