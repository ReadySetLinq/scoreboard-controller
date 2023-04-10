import React, { useRef, useEffect, useMemo, lazy, Suspense } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';

import { useConnet } from './hooks/useConnect';
import { useEmitter } from './hooks/useEmitter';
import Emitter from './services/emitter';
import { getWindowSelector, setWindowAtom } from './jotai/selectors';
import Load from './components/load';

import './App.css';

const Scoreboard = lazy(() => import('./components/scoreboard'));
const Connect = lazy(() => import('./components/connect'));

const App = () => {
	const isMounted = useRef();
	const getWindowSize = useAtomValue(getWindowSelector);
	const setWindowSize = useSetAtom(setWindowAtom);
	const { isConnected, isConnecting, isStarted } = useConnet(new URLSearchParams(window.location.search));
	const showConnect = useMemo(() => !isConnected || isConnecting || !isStarted, [isConnected, isConnecting, isStarted]);
	const loadTitle = useMemo(
		() => (!isConnected || isConnecting ? 'Connecting' : 'Loading'),
		[isConnected, isConnecting],
	);

	useEffect(() => {
		let unlisten = () => null;

		const app_event = async () => {
			unlisten = await Emitter.on('app::event', (event) => {
				if (event.payload) {
					console.log('useEffect app::event', event.payload);
				}
			});
		};
		app_event();

		if (!isMounted.current) {
			appWindow.emit('app::event', 'App Mounted');

			let position = appWindow.outerPosition();
			if (getWindowSize.x && getWindowSize.x !== position.x) {
				position.x = getWindowSize.x;
			}
			if (getWindowSize.y && getWindowSize.y !== position.y) {
				position.y = getWindowSize.y;
			}

			invoke('set_window', {
				width: getWindowSize.width,
				height: getWindowSize.height,
				x: position.x,
				y: position.y,
			}).catch(console.error);
		}

		isMounted.current = true;

		return () => {
			isMounted.current = false;
			unlisten();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		let unlisten = () => null;
		const watch = async () => {
			unlisten = await appWindow.onMoved(({ payload: position }) => {
				setWindowSize({ x: position.x, y: position.y });
			});
		};
		watch();

		return () => {
			// you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
			unlisten();
		};
	}, [setWindowSize]);

	useEffect(() => {
		let unlisten = () => null;
		const watch = async () => {
			unlisten = await appWindow.onResized(({ payload: size }) => {
				setWindowSize({ width: size.width, height: size.height });
			});
		};
		watch();

		return () => {
			// you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
			unlisten();
		};
	}, [setWindowSize]);

	useEmitter('app::event', ({ payload }) => {
		console.log('useEmitter app::event', payload);
	});

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
