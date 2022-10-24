import { memo } from 'react';
import { isEqual } from 'lodash';

const Counter = ({ title, onChange, value }) => {
	const canDecrease = {
		single: value <= 0 ? 'disabled' : '',
		double: value < 2 ? 'disabled' : '',
	};

	return (
		<div className='counter'>
			<button
				className={`counter-action decrement ${canDecrease.double}`}
				disabled={canDecrease.double === 'disabled'}
				onClick={() => onChange(false, 2)}
			>
				-2
			</button>
			<button
				className={`counter-action decrement ${canDecrease.single}`}
				disabled={canDecrease.single === 'disabled'}
				onClick={() => onChange(false, 1)}
			>
				-1
			</button>
			<div id={title} className='counter-score'>
				{value}
			</div>
			<button className='counter-action increment' onClick={() => onChange(true, 1)}>
				+1
			</button>
			<button className='counter-action increment' onClick={() => onChange(true, 2)}>
				+2
			</button>
		</div>
	);
};

export default memo(Counter, isEqual);
