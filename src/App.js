import React, { useRef, useEffect, useMemo, lazy, Suspense } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { listen, emit } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';

import { useConnet } from './hooks/useConnect';
import { useEmitter } from './hooks/useEmitter';
import { getWindowSelector, setWindowAtom, getLoginAtom } from './jotai/selectors';
import Load from './components/load';
import Login from './components/login';

import './App.css';

const Scoreboard = lazy(() => import('./components/scoreboard'));
const Connect = lazy(() => import('./components/connect'));

const App = () => {
	const isMounted = useRef();
	const getWindowSize = useAtomValue(getWindowSelector);
	const setWindowSize = useSetAtom(setWindowAtom);
	const isLoggedIn = useAtomValue(getLoginAtom);
	const { isConnected, isConnecting, isStarted } = useConnet(new URLSearchParams(window.location.search));
	const showConnect = useMemo(() => !isConnected || isConnecting || !isStarted, [isConnected, isConnecting, isStarted]);
	const loadTitle = useMemo(
		() => (!isConnected || isConnecting ? 'Connecting' : 'Loading'),
		[isConnected, isConnecting],
	);

	useEffect(() => {
		let unlisten = () => null;

		const app_event = async () => {
			unlisten = await listen('app::event', (event) => {
				if (event.payload) {
					console.log('useEffect app::event', event.payload);
				}
			});
		};
		app_event();

		if (!isMounted.current) {
			emit('app::event', 'App Mounted');

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
		let unlistenOnMove = () => null;
		let unlistenOnResized = () => null;
		const watch = async () => {
			unlistenOnMove = await appWindow.onMoved(({ payload: position }) => {
				setWindowSize({ x: position.x, y: position.y });
			});
			unlistenOnResized = await appWindow.onResized(({ payload: size }) => {
				setWindowSize({ width: size.width, height: size.height });
			});
		};
		watch();

		return () => {
			unlistenOnMove();
			unlistenOnResized();
		};
	}, [setWindowSize]);

	useEmitter('app::event', ({ payload }) => {
		console.log('useEmitter app::event', payload);
	});

	if (!isLoggedIn) {
		return (
			<Suspense fallback={<Load title={loadTitle} message={'Please login to continue.'} showXpression={false} />}>
				<Login />
			</Suspense>
		);
	}

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
