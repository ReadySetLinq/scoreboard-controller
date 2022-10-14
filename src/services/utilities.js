import { Websockets } from './websockets';
import { Connection } from './connection';

export const webSockets = new Websockets();
export const connection = new Connection();

export const objHas = Object.prototype.hasOwnProperty;

export const zeroPad = (num, places = 3) => String(num).padStart(places, '0');

export const getStyle = (oElm, strCssRule) => {
	var strValue = '';
	if (document.defaultView && document.defaultView.getComputedStyle) {
		strValue = document.defaultView.getComputedStyle(oElm, '').getPropertyValue(strCssRule);
	} else if (oElm.currentStyle) {
		strCssRule = strCssRule.replace(/-(\w)/g, function (strMatch, p1) {
			return p1.toUpperCase();
		});
		strValue = oElm.currentStyle[strCssRule];
	}
	return strValue;
};

export const isNumber = (n) => !isNaN(parseFloat(n)) && !isNaN(n - 0);

export const getTimeFromDecimal = (decimal) => {
	const hours = Math.floor(decimal);
	const minutes = Math.floor((decimal - hours) * 60);
	const seconds = Math.floor(((decimal - hours) * 60 - minutes) * 60);
	const milliseconds = Math.floor((((decimal - hours) * 60 - minutes) * 60 - seconds) * 1000);
	return { minutes, seconds, milliseconds };
};

export const getDecimalFromTime = (time) => {
	const { minutes, seconds } = time;
	const decimal = minutes / 60 + seconds / 3600;
	return decimal;
};

export const getDecimalFromMilliseconds = (milliseconds) => {
	const seconds = milliseconds / 1000;
	const decimal = seconds / 3600;
	return decimal;
};

export const Utilities = {
	webSockets,
	connection,
	objHas,
	zeroPad,
	getStyle,
	isNumber,
	getTimeFromDecimal,
	getDecimalFromTime,
	getDecimalFromMilliseconds,
};

export default Utilities;
