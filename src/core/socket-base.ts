import type { SocketAdapterEvents } from '~types'
import { EventEmitter } from './event-emitter'

export class SocketBase {
	private events = new EventEmitter()

	on<Event extends keyof SocketAdapterEvents>(
		event: Event,
		listener: SocketAdapterEvents[Event]
	): void {
		this.events.on(event, listener)
	}

	emit<Event extends keyof SocketAdapterEvents>(
		event: Event,
		...args: Parameters<SocketAdapterEvents[Event]>
	): void {
		this.events.emit(event, ...args)
	}
}
