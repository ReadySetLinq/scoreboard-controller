import React, { useEffect, useMemo, lazy, Suspense } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { invoke } from '@tauri-apps/api/tauri';

import { useConnet } from './hooks/useConnect';
import { getWindowSelector, setWindowAtom } from './jotai/selectors';
import Load from './components/load';

import './App.css';

const Scoreboard = lazy(() => import('./components/scoreboard'));
const Connect = lazy(() => import('./components/connect'));

const App = () => {
	const getWindowSize = useAtomValue(getWindowSelector);
	const setWindowSize = useSetAtom(setWindowAtom);
	const { isConnected, isConnecting, isStarted } = useConnet(new URLSearchParams(window.location.search));
	const showConnect = useMemo(() => !isConnected || isConnecting || !isStarted, [isConnected, isConnecting, isStarted]);
	const loadTitle = useMemo(
		() => (!isConnected || isConnecting ? 'Connecting' : 'Loading'),
		[isConnected, isConnecting],
	);

	useEffect(() => {
		invoke('greet', { name: 'World' }).then(console.log).catch(console.error);
	}, []);

	useEffect(() => {
		invoke('set_window_size', { width: getWindowSize.width, height: getWindowSize.height })
			.then(console.log)
			.catch(console.error);
	}, [getWindowSize]);

	useEffect(() => {
		// Detect when the window size has changed and update the width and height atom selectors
		const handleResize = () => {
			setWindowSize({ width: window.innerWidth, height: window.innerHeight });
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	/*
	return (
		<Suspense fallback={<Load title={loadTitle} message={'Please wait.'} showXpression={showConnect} />}>
			{showConnect ? <Connect /> : <Scoreboard />}
		</Suspense>
	);
	//*/

	/* */
	return (
		<Suspense fallback={<Load title={loadTitle} message={'Please wait.'} showXpression={showConnect} />}>
			<Scoreboard />
		</Suspense>
	);
	//*/
};

export default App;
