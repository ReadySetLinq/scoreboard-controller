import { memo } from 'react';
import { isEqual } from 'lodash';

const Counter = (props) => {
	const canDecrease = {
		single: props.value <= 0 ? 'disabled' : '',
		double: props.value < 2 ? 'disabled' : '',
	};

	return (
		<div className='counter'>
			<button
				className={`counter-action decrement ${canDecrease.double}`}
				disabled={canDecrease.double === 'disabled'}
				onClick={() => props.onChange(false, 2)}
			>
				-2
			</button>
			<button
				className={`counter-action decrement ${canDecrease.single}`}
				disabled={canDecrease.single === 'disabled'}
				onClick={() => props.onChange(false, 1)}
			>
				-1
			</button>
			<div id={props.title} className='counter-score'>
				{props.value}
			</div>
			<button className='counter-action increment' onClick={() => props.onChange(true, 1)}>
				+1
			</button>
			<button className='counter-action increment' onClick={() => props.onChange(true, 2)}>
				+2
			</button>
		</div>
	);
};

export default memo(Counter, isEqual);
