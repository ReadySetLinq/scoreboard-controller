import { useState, useCallback, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';

import { defaultNetworkSettingsData } from '../jotai/atoms';
import {
	getLoginAtom,
	setLoginAtom,
	getNetworkSettingsAtom,
	setNetworkSettingsIPAtom,
	setNetworkSettingsPortAtom,
	setNetworkSettingsUserNameAtom,
	setNetworkSettingsPasswordAtom,
} from '../jotai/selectors';
import Wrapper from './wrapper';

const Login = () => {
	const [settings, setSettings] = useState({ ...defaultNetworkSettingsData });
	const loggedIn = useAtomValue(getLoginAtom);
	const seLoggedIn = useSetAtom(setLoginAtom);
	const networkSettings = useAtomValue(getNetworkSettingsAtom);
	const setNetworkIP = useSetAtom(setNetworkSettingsIPAtom);
	const setNetworkPort = useSetAtom(setNetworkSettingsPortAtom);
	const setNetworkUserName = useSetAtom(setNetworkSettingsUserNameAtom);
	const setNetworkPassword = useSetAtom(setNetworkSettingsPasswordAtom);
	const canSaveSettings = useMemo(() => {
		if (settings.ip !== networkSettings.ip) return true;
		if (settings.port !== networkSettings.port) return true;
		if (settings.userName !== networkSettings.userName) return true;
		return settings.password !== networkSettings.password;
	}, [settings, networkSettings]);
	const canLogin = useMemo(() => {
		if (settings.ip === '') return false;
		if (settings.port.toString() === '') return false;
		if (settings.userName === '') return false;
		return settings.password !== '';
	}, [settings]);

	const SaveSettings = useCallback(() => {
		if (settings.ip !== networkSettings.ip) {
			setNetworkIP(settings.ip);
		}
		if (settings.port !== networkSettings.port) {
			setNetworkPort(settings.port);
		}
		if (settings.userName !== networkSettings.userName) {
			setNetworkUserName(settings.userName);
		}
		if (settings.password !== networkSettings.password) {
			setNetworkPassword(settings.password);
		}
	}, [settings, networkSettings, setNetworkIP, setNetworkPort, setNetworkUserName, setNetworkPassword]);

	const Cancel = useCallback(() => {
		setSettings({ ...networkSettings });
	}, [setSettings, networkSettings]);

	const Login = useCallback(() => {
		SaveSettings();
		seLoggedIn(true);
	}, [SaveSettings, seLoggedIn]);

	return (
		<div className={`confirm-box ${!loggedIn ? 'show' : 'hidden no_display'}`}>
			<Wrapper
				elements={{
					top: null,
					bottom: null,
				}}
			>
				<div className='confirm-box__content'>
					<div className='confirm-box__title'>Network Settings</div>
					<div className='confirm-box__message'>
						<div className='confirm-box__input'>
							<label className='confirm-box__label'>IP</label>
							<input
								className='confirm-box__input-field'
								type='text'
								value={settings.ip}
								onChange={(e) => setSettings({ ...settings, ip: e.target.value })}
							/>
						</div>
						<div className='confirm-box__input'>
							<label className='confirm-box__label'>Port</label>
							<input
								className='confirm-box__input-field'
								type='text'
								value={settings.port}
								onChange={(e) => setSettings({ ...settings, port: e.target.value })}
							/>
						</div>
						<div className='confirm-box__input'>
							<label className='confirm-box__label'>User Name</label>
							<input
								className='confirm-box__input-field'
								type='text'
								value={settings.userName}
								onChange={(e) => setSettings({ ...settings, userName: e.target.value })}
							/>
						</div>
						<div className='confirm-box__input'>
							<label className='confirm-box__label'>Password</label>
							<input
								className='confirm-box__input-field'
								type='password'
								value={settings.password}
								onChange={(e) => setSettings({ ...settings, password: e.target.value })}
							/>
						</div>
						<div className='confirm-box__actions'>
							<button
								className={
									canSaveSettings
										? 'confirm-box__action confirm-box__action--continue'
										: 'confirm-box__action confirm-box__action--continue confirm-box__action--disabled'
								}
								disabled={!canSaveSettings}
								onClick={() => SaveSettings()}
							>
								Save Settings
							</button>
							<button
								className={
									canSaveSettings
										? 'confirm-box__action confirm-box__action--cancel'
										: 'confirm-box__action confirm-box__action--cancel confirm-box__action--disabled'
								}
								disabled={!canSaveSettings}
								onClick={() => Cancel()}
							>
								Cancel
							</button>
							<button
								className={
									canLogin
										? 'confirm-box__action confirm-box__action--confirm'
										: 'confirm-box__action confirm-box__action--confirm confirm-box__action--disabled'
								}
								disabled={!canLogin}
								onClick={() => Login()}
							>
								Login
							</button>
						</div>
					</div>
				</div>
			</Wrapper>
		</div>
	);
};

export default Login;
