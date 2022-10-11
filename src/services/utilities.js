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

export const Utilities = {
	webSockets,
	connection,
	objHas,
	zeroPad,
	getStyle,
	isNumber,
};

export default Utilities;
