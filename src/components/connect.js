import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { TbPlugConnectedX, TbPlugConnected } from 'react-icons/tb';

import {
	getConnectionAtom,
	getIsConnectedSelector,
	getIsConnectingSelector,
	setConnectedAtom,
	setIsConnectingAtom,
	setConnectionMessageAtom,
} from '../jotai/selectors';
import Wrapper from './wrapper';
import Emitter from '../services/emitter';

const Connect = () => {
	const getConnectionState = useAtomValue(getConnectionAtom);
	const isConnected = useAtomValue(getIsConnectedSelector);
	const isConnecting = useAtomValue(getIsConnectingSelector);
	const setConnectedStore = useSetAtom(setConnectedAtom);
	const setIsConnectingStore = useSetAtom(setIsConnectingAtom);
	const setConnectionMessageStore = useSetAtom(setConnectionMessageAtom);
	const [state, setState] = useState({ base: 'Connecting', dots: 0, message: '' });
	const headerIconClass = useMemo(() => `icon-left ${state.dots % 3 ? 'icon-red' : ''}`, [state.dots]);
	let isMounted = useRef(false);

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
		if (!isMounted.current) return;

		if (!isConnected && !isConnecting) {
			console.log('connect: not connected and not connecting');
		}
	}, [getConnectionState, isConnected, isConnecting]);

	useEffect(() => {
		isMounted.current = true;

		Emitter.on('network.connecting', (displayMsg = '') => {
			if (!isMounted.current) return;
			console.log('network.connecting', displayMsg);
			setConnectedStore(false);
			setIsConnectingStore(true);
			setConnectionMessageStore(displayMsg);
		});

		Emitter.on('network.connected', (displayMsg = '') => {
			if (!isMounted.current) return;
			console.log('network.connected', displayMsg);
			setConnectedStore(true);
			setIsConnectingStore(false);
			setConnectionMessageStore(displayMsg);
		});

		if (!isConnected && !isConnecting) Emitter.emit('conn.connect', {});

		return () => {
			isMounted.current = false;
			Emitter.off('network.connecting');
			Emitter.off('network.connected');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Wrapper
			elements={{
				top: <div className={headerIconClass}>{state.dots % 2 ? <TbPlugConnectedX /> : <TbPlugConnected />}</div>,
			}}
		>
			<div className='buttons'>
				<div className={`confirm-box show`}>
					<div className='confirm-box__content'>
						<div className='confirm-box__title error'>{`${state.base}${state.message}`}</div>
						<div className='confirm-box__message'>{`Please make sure the Xpression server is running and connected to the same network.\n\nChange the IP or Port by providing a URL parameter for ip or port`}</div>
						<div className='confirm-box__actions'></div>
					</div>
				</div>
			</div>
		</Wrapper>
	);
};

export default Connect;
