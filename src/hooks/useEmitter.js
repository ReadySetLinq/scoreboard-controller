import { useEffect, useRef } from 'react';
import { debounce } from 'lodash';

import { emitter } from '../services/utilities';

export const useEmitter = (event = '', callback = () => {}) => {
	const isMounted = useRef(false);
	const listenerOn = useRef(false);

	useEffect(() => {
		isMounted.current = true;
		let unlisten = () => null;

		debounce(async () => {
			listenerOn.current = true;
			unlisten = await emitter.on(`${event.replace('.', '::')}`, (response) => {
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
