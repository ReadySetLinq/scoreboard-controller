import { listen, once, emit } from '@tauri-apps/api/event';

export class Emitter {
	constructor() {
		this.listeners = {};
	}

	async on(event, fn) {
		return listen(event, fn);
	}

	async once(event, fn) {
		return once(event, fn);
	}

	async emit(event, payload) {
		return emit(event, payload);
	}

	async off(event) {
		return listen(event, () => null);
	}

	async removeAllListeners() {
		return listen('*', () => null);
	}
}

export default Emitter;
