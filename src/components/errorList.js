import { memo, useState, useEffect, useRef } from 'react';
import { generate } from 'shortid';
import { isEqual } from 'lodash';
import { RiCloseCircleLine } from 'react-icons/ri';
import { useAutoAnimate } from '@formkit/auto-animate/react';

import { useEmitter } from '../hooks/useEmitter';

const defaultError = {
	index: generate(),
	message: '',
};

const ErrorDisplay = ({ error, onRemove }) => {
	const curError = error ? error : defaultError;

	return (
		<div className='button' key={`error-div -${curError.index}`}>
			<div className='button-name'>
				<div className={`button-remove`} title='Remove' onClick={onRemove}>
					<RiCloseCircleLine title='Remove' />
				</div>
				{curError.message}
			</div>
		</div>
	);
};
export const ErrorDisp = memo(ErrorDisplay, isEqual);

const ErrorList = () => {
	const [errorState, setErrorState] = useState([]);
	const [errorsListRef] = useAutoAnimate();
	const isMounted = useRef(false);

	useEffect(() => {
		isMounted.current = true;

		return () => {
			isMounted.current = false;
		};
	}, []);

	useEmitter('xpression::error', (error) => {
		if (!isMounted.current) return;
		console.log('xpression::error', error);

		setErrorState((prevErrors) => {
			return [
				...prevErrors,
				{
					index: generate(),
					message: error.data.message,
				},
			];
		});
	});

	return (
		<div className='errors__row' ref={errorsListRef}>
			{errorState.map((error) => (
				<ErrorDisp
					key={`error-${error.index}`}
					index={error.index}
					onRemove={() => setErrorState((prev) => prev.filter((item) => item.index !== error.index))}
				/>
			))}
		</div>
	);
};

export default ErrorList;
