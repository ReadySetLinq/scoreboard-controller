import React from 'react';
import { useAtomValue } from 'jotai';

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
					value={props.title}
					onChange={(event) => props.onTitleChange(event.target.value)}
				/>
			</div>
			<div className='score-score'>
				<Counter title={`score-input-${props.title}`} onChange={props.onScoreChange} value={props.value} />
			</div>
		</div>
	);
};

export default Score;
