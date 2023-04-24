import { memo, useEffect, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { once } from '@tauri-apps/api/event';
import { generate } from 'shortid';
import { isEqual } from 'lodash';

import { getPeriodSelector, setPeriodAtom, getLockedModeAtom } from '../jotai/selectors';
import { useDebounce } from '../services/useDebounce';
import { XpnEvents } from '../services/xpnEvents';

const Period = ({ setLoadState }) => {
	const isMounted = useRef(false);
	const timerPeriodName = useRef(null);
	const isLocked = useAtomValue(getLockedModeAtom);
	const period = useAtomValue(getPeriodSelector);
	const setPeriod = useSetAtom(setPeriodAtom);
	const periodName = useDebounce(period.widgetName, 300);
	const periodValue = useDebounce(period.value, 300);

	const onPeriodChange = (value) => {
		if (value === 'reset') {
			setPeriod({ value: '1st' });
		} else setPeriod({ value: value });
	};

	useEffect(() => {
		isMounted.current = true;

		return () => {
			isMounted.current = false;
			clearTimeout(timerPeriodName.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!isMounted.current) return;

		const _tmpUUID_set = `scoreboard-setTextListWidgetValues-${generate()}`;
		const _tmpUUID_index = `scoreboard-setTextListWidgetItemIndex-${generate()}`;
		let unlistenIndex = null;

		XpnEvents.SetTextListWidgetValues({
			uuid: _tmpUUID_set,
			name: period.widgetName,
			values: period.value,
		});

		const unlistenValues = once(_tmpUUID_set, () => {
			if (!isMounted.current) return;
			XpnEvents.SetTextListWidgetItemIndex({
				uuid: _tmpUUID_index,
				name: period.widgetName,
				index: '0',
			});

			unlistenIndex = once(_tmpUUID_index, ({ response }) => {
				if (isMounted.current) {
					if (response !== false && period.value !== response) {
						if (isMounted.current) setPeriod({ value: response });
					}
				}
			});
		});

		return () => {
			if (unlistenValues !== null) unlistenValues.then((f) => f());
			if (unlistenIndex !== null) unlistenIndex.then((f) => f());
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [periodValue]);

	useEffect(() => {
		if (!isMounted.current) return;
		const _tmpUUID = `scoreboard-getTextListWidgetValue-${generate()}`;
		let unlisten = null;

		setLoadState((prevState) => ({ ...prevState, period: false }));

		if (timerPeriodName.current) clearTimeout(timerPeriodName.current);

		const getTextListWidgetValue = async () => {
			if (!isMounted.current) return;
			unlisten = once(_tmpUUID, ({ response }) => {
				if (!isMounted.current) return;

				if (response !== false) setPeriod({ value: response });
				else setPeriod({ value: '' });

				setLoadState((prevState) => ({ ...prevState, period: true }));
			});
		};

		getTextListWidgetValue();

		timerPeriodName.current = setTimeout(() => {
			XpnEvents.GetTextListWidgetValue({
				uuid: _tmpUUID,
				name: period.widgetName,
			});
		}, 250);

		return () => {
			clearTimeout(timerPeriodName.current);
			if (unlisten !== null) unlisten.then((f) => f());
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [periodName]);

	return (
		<div className='period'>
			<div className='period-name'>
				<input
					className={isLocked ? 'disabled' : ''}
					disabled={isLocked}
					type='text'
					value={period.widgetName}
					placeholder='Period Widget Name'
					onChange={(event) => setPeriod({ widgetName: event.target.value })}
				/>
			</div>
			<div className='period-score'>
				<input
					type='text'
					value={period.value}
					placeholder='Widget Value'
					onChange={(event) => onPeriodChange(event.target.value)}
				/>
			</div>
		</div>
	);
};

export default memo(Period, isEqual);
