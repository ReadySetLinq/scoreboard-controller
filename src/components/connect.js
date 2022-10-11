import React, { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { isEqual } from 'lodash';

import { getConnectionMessageSelector } from '../jotai/selectors';
import Load from './load';

const Connect = () => {
	const connectionMessageState = useAtomValue(getConnectionMessageSelector);
	const message = useMemo(
		() => `${connectionMessageState !== '' ? `${connectionMessageState}\n\n\t\n` : ''}`,
		[connectionMessageState],
	);

	return <Load title='Connecting' message={message} />;
};

export default React.memo(Connect, isEqual);
