import { useState, useEffect, useRef } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { generate } from 'shortid';
import { isEqual } from 'lodash';

import { urlParamsAtom } from '../jotai/atoms';
import {
	getConnectionAtom,
	setConnectedAtom,
	getIsConnectedSelector,
	setIsConnectingAtom,
	getIsConnectingSelector,
	getIsStartedSelector,
	setIsStartedAtom,
	getConnectionMessageSelector,
	setConnectionMessageAtom,
} from '../jotai/selectors';
import Emitter from '../services/emitter';
import { connection } from '../services/utilities';

export const useConnet = (urlSearchParams = new URLSearchParams(window.location.search)) => {
	const isMounted = useRef(false);
	const [urlParams, setUrlParams] = useAtom(urlParamsAtom);
	const getConnectionState = useAtomValue(getConnectionAtom);
	const setConnectedStore = useSetAtom(setConnectedAtom);
	const isConnected = useAtomValue(getIsConnectedSelector);
	const isConnecting = useAtomValue(getIsConnectingSelector);
	const isStarted = useAtomValue(getIsStartedSelector);
	const connectionMessage = useSetAtom(getConnectionMessageSelector);
	const setIsConnectingStore = useSetAtom(setIsConnectingAtom);
	const setIsStartedStore = useSetAtom(setIsStartedAtom);
	const setConnectionMessageStore = useSetAtom(setConnectionMessageAtom);
	const [startup, setStartup] = useState(true);

	useEffect(() => {
		if (urlParams !== urlSearchParams) setUrlParams(urlParams);
	}, [setUrlParams, urlParams, urlSearchParams]);

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
			setConnectedStore(false);
			setIsConnectingStore(false);
			setConnectionMessageStore(displayMsg);
		});

		Emitter.on('conn.status', ({ connected = false, connecting = false, displayMsg = '' }) => {
			if (!isMounted.current) return;
			setConnectedStore(connected);
			setIsConnectingStore(connecting);
			setConnectionMessageStore(displayMsg);
		});

		Emitter.on('conn.displayMsg', (displayMsg = '') => {
			if (!isMounted.current) return;
			setConnectionMessageStore(displayMsg);
		});

		Emitter.on('network.connectionMsg', (displayMsg = '') => {
			if (!isMounted.current) return;
			setConnectionMessageStore(displayMsg);
		});

		Emitter.on('xpression.loggedIn', () => {
			if (!isMounted.current) return;
			Emitter.emit('xpn.start', { uuid: generate() });
			setConnectionMessageStore('Connected! Starting controller...');
		});

		Emitter.on('network.connecting', (displayMsg = '') => {
			if (!isMounted.current) return;
			setConnectedStore(false);
			setIsConnectingStore(true);
			setIsStartedStore(false);
			setConnectionMessageStore(displayMsg);
		});

		Emitter.on('network.connected', (displayMsg = '') => {
			if (!isMounted.current) return;
			setConnectedStore(true);
			setIsConnectingStore(false);
			setConnectionMessageStore('Connected to Xpression! Logging in...');
		});

		Emitter.on('xpression.controllerStarted', (value) => {
			if (!isMounted.current) return;
			setConnectedStore(true);
			setIsConnectingStore(false);
			setConnectionMessageStore('Controller Started...');
			setIsStartedStore(true);
		});

		if (!isConnected && !isConnecting) Emitter.emit('conn.connect', {});

		// componentWillUnmount
		return () => {
			isMounted.current = false;
			Emitter.off('xpression-started');
			Emitter.off('xpression.loggedIn');
			Emitter.off('xpression.controllerStarted');
			Emitter.off('network.disconnected');
			Emitter.off('conn.status');
			Emitter.off('conn.displayMsg');
			Emitter.off('network.connectionMsg');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { isConnected, isConnecting, isStarted, connectionMessage };
};
