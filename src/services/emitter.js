import EventEmitter from 'eventemitter3';

const eventEmitter = new EventEmitter();

const Emitter = {
	on: (event, fn) => eventEmitter.on(event, fn),
	once: (event, fn) => eventEmitter.once(event, fn),
	off: (event) => eventEmitter.off(event),
	emit: (event, payload) => eventEmitter.emit(event, payload),
};

Object.freeze(Emitter);

export default Emitter;
