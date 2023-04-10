import { listen, once, emit } from '@tauri-apps/api/event';

const Emitter = {
	on: (event, fn) => listen(event, fn),
	once: (event, fn) => once(event, fn),
	emit: (event, payload) => emit(event, payload),
};

Object.freeze(Emitter);

export default Emitter;
