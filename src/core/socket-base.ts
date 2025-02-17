import type { SocketAdapterEvents } from '~types'
import { EventEmitter } from './event-emitter'

export class SocketBase {
	private context = {
		events: new EventEmitter(),
	}

	on<Event extends keyof SocketAdapterEvents>(
		event: Event,
		listener: SocketAdapterEvents[Event],
	): void {
		this.context.events.on(event, listener)
	}

	emit<Event extends keyof SocketAdapterEvents>(
		event: Event,
		...args: Parameters<SocketAdapterEvents[Event]>
	): void {
		this.context.events.emit(event, ...args)
	}
}
