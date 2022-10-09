import { Websockets } from './websockets';
import { Connection } from './connection';

export const webSockets = new Websockets();
export const connection = new Connection();

export const objHas = Object.prototype.hasOwnProperty;

export const Utilities = {
	webSockets,
	connection,
	objHas,
};

export default Utilities;
