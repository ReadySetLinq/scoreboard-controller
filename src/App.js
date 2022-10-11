import React, { useState, useEffect, useRef } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { generate } from 'shortid';
import { isEqual } from 'lodash';

import { urlParamsAtom } from './jotai/atoms';
import {
	getConnectionAtom,
	getIsConnectedSelector,
	setConnectedAtom,
	setIsConnectingAtom,
	setConnectionMessageAtom,
} from './jotai/selectors';
import Connect from './components/connect';
import Scoreboard from './components/scoreboard';
import Emitter from './services/emitter';
import { connection } from './services/utilities';

import './App.css';

const App = () => {
	const [urlParams, setUrlParams] = useAtom(urlParamsAtom);
	const getConnectionState = useAtomValue(getConnectionAtom);
	const isConnected = useAtomValue(getIsConnectedSelector);
	const setConnectedStore = useSetAtom(setConnectedAtom);
	const setIsConnectingStore = useSetAtom(setIsConnectingAtom);
	const setConnectionMessageStore = useSetAtom(setConnectionMessageAtom);
	const [startup, setStartup] = useState(true);
	let isMounted = useRef(false);

	useEffect(() => {
		const urlSearchParams = new URLSearchParams(window.location.search);
		if (urlParams !== urlSearchParams) setUrlParams(urlParams);
	}, [setUrlParams, urlParams]);

	useEffect(() => {
		let settings = { ...connection.settings };

		if (urlParams.has('ip')) settings.ip = urlParams.get('ip');
		try {
			if (urlParams.has('port')) settings.port = parseInt(urlParams.get('port'), 0);
		} catch {}

		if (urlParams.has('username')) settings.username = urlParams.get('username');
		if (urlParams.has('password')) settings.password = urlParams.get('password');

		if (startup || !isEqual(connection.settings, settings)) Emitter.emit('conn.updateSettings', settings);
		if (startup) {
			setStartup(false);
		}
		//if (hasUpdated) Emitter.emit('conn.connect', {});
	}, [urlParams, getConnectionState, startup]);

	useEffect(() => {
		isMounted.current = true;

		Emitter.on('network.disconnected', (displayMsg = '') => {
			if (!isMounted.current) return;
			console.log('network.disconnected', displayMsg);
			setConnectedStore(false);
			setIsConnectingStore(false);
			setConnectionMessageStore(displayMsg);
		});

		Emitter.on('conn.status', ({ connected = false, connecting = false, displayMsg = '' }) => {
			if (!isMounted.current) return;
			console.log('conn.status', { connected, connecting, displayMsg });
			setConnectedStore(connected);
			setIsConnectingStore(connecting);
			setConnectionMessageStore(displayMsg);
		});

		Emitter.on('xpression.loggedIn', () => {
			console.log('xpression.loggedIn');
			if (!isMounted.current) return;
			Emitter.emit('xpn.start', { uuid: generate() });
		});

		Emitter.on('xpression.error', (value) => {
			if (!isMounted.current) return;
			console.log('xpression.error', value);
			Emitter.emit('conn.disconnect', {});
			setTimeout(() => {
				if (!isMounted.current) return;
				setConnectedStore(false);
				setIsConnectingStore(false);
				setConnectionMessageStore(value.data.message);
			}, 1500);
		});

		Emitter.on('xpression.controllerStarted', (value) => {
			if (!isMounted.current) return;
			console.log('xpression.controllerStarted', value);
			setConnectedStore(true);
			setIsConnectingStore(false);
			setConnectionMessageStore('');
		});

		// componentWillUnmount
		return () => {
			isMounted.current = false;
			Emitter.off('xpression-started');
			Emitter.off('xpression.loggedIn');
			Emitter.off('xpression.error');
			Emitter.off('xpression.controllerStarted');
			Emitter.off('network.disconnected');
			Emitter.off('conn.status');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!isConnected) return <Connect />;

	//return <div></div>;

	return <Scoreboard />;
};

export default App;
