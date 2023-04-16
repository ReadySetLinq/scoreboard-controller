import { useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { debounce } from 'lodash';

export const useEmitter = (event = '', callback = () => {}) => {
	const isMounted = useRef(false);
	const listenerOn = useRef(false);

	useEffect(() => {
		isMounted.current = true;
		let unlisten = () => null;

		debounce(async () => {
			listenerOn.current = true;
			unlisten = await listen(`${event.replace('.', '::')}`, (response) => {
				if (isMounted.current) callback(response);
			});
		}, 250)();

		return () => {
			isMounted.current = false;
			if (listenerOn.current) unlisten();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { event, callback, isListenerOn: listenerOn.current };
};

export default useEmitter;
