import React, { useState, useEffect, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { TbPlugConnectedX, TbPlugConnected } from 'react-icons/tb';

import { getConnectionAtom, getConnectionConnectedSelector, getConnectionConnectingSelector } from '../jotai/selectors';

const Connect = () => {
	const getConnectionState = useAtomValue(getConnectionAtom);
	const isConnected = useAtomValue(getConnectionConnectedSelector);
	const isConnecting = useAtomValue(getConnectionConnectingSelector);
	const [state, setState] = useState({ base: 'Connecting', dots: 0, message: '' });
	const headerIconClass = useMemo(() => `icon-left ${state.dots % 3 ? 'icon-red' : ''}`, [state.dots]);

	useEffect(() => {
		const interval = setInterval(() => {
			const dots = state.dots === 3 ? 0 : state.dots + 1;
			let message = '';
			for (let i = 0; i < dots; i++) message += '.';
			setState((oldState) => ({ ...oldState, dots: dots, message: message }));
		}, 500);

		return () => clearInterval(interval);
	}, [state.dots]);

	useEffect(() => {
		if (!isConnected && !isConnecting) {
			getConnectionState.connect();
		}
	}, [getConnectionState, isConnected, isConnecting]);

	return (
		<div className='scoreboard'>
			<div className='header'>
				<a className={headerIconClass}>{state.dots % 2 ? <TbPlugConnectedX /> : <TbPlugConnected />}</a>
				<h1>Scoreboard</h1>
			</div>
			<div className='buttons'>
				<div className={`confirm-box show`}>
					<div className='confirm-box__content'>
						<div className='confirm-box__title error'>{`${state.base}${state.message}`}</div>
						<div className='confirm-box__message'>{`Please make sure the Xpression server is running and connected to the same network.\n\nChange the IP or Port by providing a URL parameter for ip or port`}</div>
						<div className='confirm-box__actions'></div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Connect;
