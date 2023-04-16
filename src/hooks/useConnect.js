import { useState, useEffect, useRef } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { generate } from 'shortid';
import { isEqual, debounce } from 'lodash';

import {
	getNetworkSettingsAtom,
	setNetworkSettingsAtom,
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
import { emitter, connection } from '../services/utilities';
import { useEmitter } from './useEmitter';

export const useConnet = (urlSearchParams = new URLSearchParams(window.location.search)) => {
	const isMounted = useRef(false);
	const networkSettings = useAtomValue(getNetworkSettingsAtom);
	const setNetworkSettings = useSetAtom(setNetworkSettingsAtom);
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
		let settings = { ...connection.settings };

		if (networkSettings.ip) settings.ip = networkSettings.ip;
		try {
			if (networkSettings.port) settings.port = parseInt(networkSettings.port, 0);
		} catch {}

		if (networkSettings.userName) settings.userName = networkSettings.userName;
		if (networkSettings.password) settings.password = networkSettings.password;

		if (startup || !isEqual(connection.settings, settings)) {
			setNetworkSettings(settings);
			emitter.emit('conn::updateSettings', settings);
		}
		if (startup) {
			setStartup(false);
		}
	}, [networkSettings, setNetworkSettings, getConnectionState, startup]);

	useEffect(() => {
		isMounted.current = true;

		debounce(() => {
			if (isMounted.current && !isConnected && !isConnecting) emitter.emit('conn::connect', {});
		}, 500)();

		return () => {
			isMounted.current = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEmitter('network::disconnected', (displayMsg = '') => {
		if (!isMounted.current) return;
		setConnectedStore(false);
		setIsConnectingStore(false);
		setConnectionMessageStore(displayMsg);
	});

	useEmitter('conn::status', ({ connected = false, connecting = false, displayMsg = '' }) => {
		if (!isMounted.current) return;
		setConnectedStore(connected);
		setIsConnectingStore(connecting);
		setConnectionMessageStore(displayMsg);
	});

	useEmitter('conn::displayMsg', (displayMsg = '') => {
		if (!isMounted.current) return;
		setConnectionMessageStore(displayMsg);
	});

	useEmitter('network::connectionMsg', (displayMsg = '') => {
		if (!isMounted.current) return;
		setConnectionMessageStore(displayMsg);
	});

	useEmitter('xpression.loggedIn', () => {
		if (!isMounted.current) return;
		emitter.emit('xpn.start', { uuid: generate() });
		setConnectionMessageStore('Connected! Starting controller...');
	});

	useEmitter('network::connecting', (displayMsg = '') => {
		if (!isMounted.current) return;
		setConnectedStore(false);
		setIsConnectingStore(true);
		setIsStartedStore(false);
		setConnectionMessageStore(displayMsg);
	});

	useEmitter('network::connected', () => {
		if (!isMounted.current) return;
		setConnectedStore(true);
		setIsConnectingStore(false);
		setConnectionMessageStore('Connected to Xpression! Logging in...');
	});

	useEmitter('xpression.controllerStarted', () => {
		if (!isMounted.current) return;
		setConnectedStore(true);
		setIsConnectingStore(false);
		setConnectionMessageStore('Controller Started...');
		setIsStartedStore(true);
	});

	return { isConnected, isConnecting, isStarted, connectionMessage };
};
