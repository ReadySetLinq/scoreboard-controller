import React, { useState, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { urlParamsAtom } from './jotai/atoms';
import { getConnectionAtom, getConnectionConnectedSelector } from './jotai/selectors';
import Connect from './components/connect';
import Scoreboard from './components/scoreboard';

import './App.css';

const App = () => {
	const [urlParams, setUrlParams] = useAtom(urlParamsAtom);
	const getConnectionState = useAtomValue(getConnectionAtom);
	const isConnected = useAtomValue(getConnectionConnectedSelector);
	const [startup, setStartup] = useState(true);

	useEffect(() => {
		const urlSearchParams = new URLSearchParams(window.location.search);
		if (urlParams !== urlSearchParams) setUrlParams(urlParams);
	}, [setUrlParams, urlParams]);

	useEffect(() => {
		let settings = { ...getConnectionState.settings };

		if (urlParams.has('ip')) settings.ip = urlParams.get('ip');
		try {
			if (urlParams.has('port')) settings.port = parseInt(urlParams.get('port'), 0);
		} catch {}

		if (urlParams.has('username')) settings.username = urlParams.get('username');
		if (urlParams.has('password')) settings.password = urlParams.get('password');

		const hasUpdated =
			getConnectionState.settings.ip !== settings.ip ||
			getConnectionState.settings.port !== settings.port ||
			getConnectionState.settings.username !== settings.userName ||
			getConnectionState.settings.password !== settings.password;

		if (startup || hasUpdated) getConnectionState.updateSettings(settings);
		if (startup) setStartup(false);
	}, [urlParams, getConnectionState, startup]);

	//if (!isConnected) return <Connect />;

	return <Scoreboard />;
};

export default App;
