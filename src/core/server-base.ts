import type { Server, ServerEvents } from '~types'
import { EventEmitter } from './event-emitter'

export class ServerBase implements Server {
	protected context = {
		events: new EventEmitter(),
	}

	on<Event extends keyof ServerEvents>(
		event: Event,
		listener: ServerEvents[Event],
	) {
		this.context.events.on(event, listener)
	}
}
