import { memo, useState, useEffect, useRef } from 'react';
import { generate } from 'shortid';
import { isEqual } from 'lodash';
import { RiCloseCircleLine } from 'react-icons/ri';
import { useAutoAnimate } from '@formkit/auto-animate/react';

import Emitter from '../services/emitter';

const defaultError = {
	index: generate(),
	message: '',
};

export const Error = (props) => {
	const error = props.error ? props.error : defaultError;

	return (
		<div className='button' key={`error-div -${error.index}`}>
			<div className='button-name'>
				<div className={`button-remove`} title='Remove' onClick={props.onRemove}>
					<RiCloseCircleLine title='Remove' />
				</div>
				{error.message}
			</div>
		</div>
	);
};

const ErrorList = () => {
	const [errorState, setErrorState] = useState([]);
	const [errorsListRef] = useAutoAnimate();
	const isMounted = useRef(false);

	useEffect(() => {
		isMounted.current = true;

		Emitter.on('xpression.error', (error) => {
			if (!isMounted.current) return;
			console.log('xpression.error', error);

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

		return () => {
			isMounted.current = false;
			Emitter.off('xpression.error');
		};
	}, []);

	return (
		<div className='errors__row' ref={errorsListRef}>
			{errorState.map((error) => (
				<Error
					index={error.index}
					key={`error-${error.index}`}
					onRemove={() => setErrorState((prev) => prev.filter((item) => item.index !== error.index))}
				/>
			))}
		</div>
	);
};

export default memo(ErrorList, isEqual);
