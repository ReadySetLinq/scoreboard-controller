import React, { useState, useEffect, useMemo } from 'react';
import { isEqual } from 'lodash';
import { TbPlugConnectedX, TbPlugConnected } from 'react-icons/tb';

import Wrapper from './wrapper';

const Load = ({ title = '', message = '' }) => {
	const [state, setState] = useState({ dots: 0, dotText: '' });
	const headerIconClass = useMemo(() => `icon-left ${state.dots % 3 ? 'icon-red' : ''}`, [state.dots]);

	useEffect(() => {
		const interval = setInterval(() => {
			const dots = state.dots === 3 ? 0 : state.dots + 1;
			let dotText = '';
			for (let i = 0; i < dots; i++) dotText += '.';
			setState((oldState) => ({ ...oldState, dots: dots, dotText: dotText }));
		}, 500);

		return () => clearInterval(interval);
	}, [state.dots]);

	return (
		<Wrapper
			elements={{
				top: <div className={headerIconClass}>{state.dots % 2 ? <TbPlugConnectedX /> : <TbPlugConnected />}</div>,
			}}
		>
			<div className='buttons'>
				<div className={`confirm-box show`}>
					<div className='confirm-box__content'>
						<div className='confirm-box__title error'>{`${title}${state.dotText}`}</div>
						<div className='confirm-box__message'>{`Please make sure the Xpression server is running and connected to the same network.\n\nChange the IP or Port by providing a URL parameter for ip or port`}</div>
						<div className='confirm-box__actions error'>{message}</div>
					</div>
				</div>
			</div>
		</Wrapper>
	);
};

export default React.memo(Load, isEqual);
