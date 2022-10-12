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

export const timeSpan = (milliseconds, seconds, minutes, hours, days) => {
	let version = '1.2',
		// Millisecond-constants
		msecPerSecond = 1000,
		msecPerMinute = 60000,
		msecPerHour = 3600000,
		msecPerDay = 86400000,
		// Internally we store the TimeSpan as Milliseconds
		msecs = 0,
		// Helper functions
		isNumeric = function (input) {
			return !isNaN(parseFloat(input)) && isFinite(input);
		};

	// Constructor Logic
	if (isNumeric(days)) {
		msecs += days * msecPerDay;
	}
	if (isNumeric(hours)) {
		msecs += hours * msecPerHour;
	}
	if (isNumeric(minutes)) {
		msecs += minutes * msecPerMinute;
	}
	if (isNumeric(seconds)) {
		msecs += seconds * msecPerSecond;
	}
	if (isNumeric(milliseconds)) {
		msecs += milliseconds;
	}

	// Addition Functions
	this.addMilliseconds = function (milliseconds) {
		if (!isNumeric(milliseconds)) {
			return;
		}
		msecs += milliseconds;
	};
	this.addSeconds = function (seconds) {
		if (!isNumeric(seconds)) {
			return;
		}
		msecs += seconds * msecPerSecond;
	};
	this.addMinutes = function (minutes) {
		if (!isNumeric(minutes)) {
			return;
		}
		msecs += minutes * msecPerMinute;
	};
	this.addHours = function (hours) {
		if (!isNumeric(hours)) {
			return;
		}
		msecs += hours * msecPerHour;
	};
	this.addDays = function (days) {
		if (!isNumeric(days)) {
			return;
		}
		msecs += days * msecPerDay;
	};

	// Subtraction Functions
	this.subtractMilliseconds = function (milliseconds) {
		if (!isNumeric(milliseconds)) {
			return;
		}
		msecs -= milliseconds;
	};
	this.subtractSeconds = function (seconds) {
		if (!isNumeric(seconds)) {
			return;
		}
		msecs -= seconds * msecPerSecond;
	};
	this.subtractMinutes = function (minutes) {
		if (!isNumeric(minutes)) {
			return;
		}
		msecs -= minutes * msecPerMinute;
	};
	this.subtractHours = function (hours) {
		if (!isNumeric(hours)) {
			return;
		}
		msecs -= hours * msecPerHour;
	};
	this.subtractDays = function (days) {
		if (!isNumeric(days)) {
			return;
		}
		msecs -= days * msecPerDay;
	};

	// Functions to interact with other TimeSpans
	this.isTimeSpan = true;
	this.add = function (otherTimeSpan) {
		if (!otherTimeSpan.isTimeSpan) {
			return;
		}
		msecs += otherTimeSpan.totalMilliseconds();
	};
	this.subtract = function (otherTimeSpan) {
		if (!otherTimeSpan.isTimeSpan) {
			return;
		}
		msecs -= otherTimeSpan.totalMilliseconds();
	};
	this.equals = function (otherTimeSpan) {
		if (!otherTimeSpan.isTimeSpan) {
			return;
		}
		return msecs === otherTimeSpan.totalMilliseconds();
	};

	// Getters
	this.totalMilliseconds = function (roundDown) {
		var result = msecs;
		if (roundDown === true) {
			result = Math.floor(result);
		}
		return result;
	};
	this.totalSeconds = function (roundDown) {
		var result = msecs / msecPerSecond;
		if (roundDown === true) {
			result = Math.floor(result);
		}
		return result;
	};
	this.totalMinutes = function (roundDown) {
		var result = msecs / msecPerMinute;
		if (roundDown === true) {
			result = Math.floor(result);
		}
		return result;
	};
	this.totalHours = function (roundDown) {
		var result = msecs / msecPerHour;
		if (roundDown === true) {
			result = Math.floor(result);
		}
		return result;
	};
	this.totalDays = function (roundDown) {
		var result = msecs / msecPerDay;
		if (roundDown === true) {
			result = Math.floor(result);
		}
		return result;
	};
	// Return a Fraction of the TimeSpan
	this.milliseconds = function () {
		return msecs % 1000;
	};
	this.seconds = function () {
		return Math.floor(msecs / msecPerSecond) % 60;
	};
	this.minutes = function () {
		return Math.floor(msecs / msecPerMinute) % 60;
	};
	this.hours = function () {
		return Math.floor(msecs / msecPerHour) % 24;
	};
	this.days = function () {
		return Math.floor(msecs / msecPerDay);
	};

	// Misc. Functions
	this.getVersion = function () {
		return version;
	};
	// toString use this format "hh:mm.dd"
	this.toString = function () {
		var text = '';
		var negative = false;
		if (msecs < 0) {
			negative = true;
			text += '-';
			msecs = Math.abs(msecs);
		}
		text += this.to2Digits(Math.floor(this.totalHours())) + ':' + this.to2Digits(this.minutes());
		if (negative) msecs *= -1;
		return text;
	};
	this.to2Digits = function (n) {
		if (n < 10) return '0' + n;
		return n;
	};
};

// "Static Constructors"
timeSpan.FromMilliseconds = (milliseconds) => {
	return new timeSpan(milliseconds, 0, 0, 0, 0);
};
timeSpan.FromSeconds = (seconds) => {
	return new timeSpan(0, seconds, 0, 0, 0);
};
timeSpan.FromMinutes = function (minutes) {
	return new timeSpan(0, 0, minutes, 0, 0);
};
timeSpan.FromHours = function (hours) {
	return new timeSpan(0, 0, 0, hours, 0);
};
timeSpan.FromDays = function (days) {
	return new timeSpan(0, 0, 0, 0, days);
};
timeSpan.FromDates = function (firstDate, secondDate, forcePositive) {
	let differenceMsecs = secondDate.valueOf() - firstDate.valueOf();
	if (forcePositive === true) {
		differenceMsecs = Math.abs(differenceMsecs);
	}
	return new timeSpan(differenceMsecs, 0, 0, 0, 0);
};
timeSpan.Parse = function (timespanText) {
	let tokens = timespanText.split(':');
	let days = tokens[0].split('.');
	if (days.length === 2) return new timeSpan(0, tokens[2], tokens[1], days[1], days[0]);

	return new timeSpan(0, tokens[2], tokens[1], tokens[0], 0);
};

export const Utilities = {
	webSockets,
	connection,
	objHas,
	zeroPad,
	getStyle,
	isNumber,
	timeSpan,
};

export default Utilities;
