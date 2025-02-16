import { EventEmitter } from './event-emitter'
import type { ServerEvents, Server } from '~types'

export class ServerBase implements Server {
	protected context = {
		events: new EventEmitter(),
	}

	on<Event extends keyof ServerEvents>(
		event: Event,
		listener: ServerEvents[Event]
	) {
		this.context.events.on(event, listener)
	}
}
