import React from 'react';
import { isEqual } from 'lodash';

import { useConnet } from './hooks/useConnect';
import Connect from './components/connect';
import Scoreboard from './components/scoreboard';

import './App.css';

const App = () => {
	const { isConnected, isConnecting, isStarted } = useConnet(new URLSearchParams(window.location.search));

	if (!isConnected || isConnecting || !isStarted) return <Connect />;
	//return <div></div>;
	return <Scoreboard />;
};

export default React.memo(App, isEqual);
