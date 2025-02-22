import type { CustomEvents, Server, ServerEvents } from '~types'
import { dependencies } from '~utils/dependencies'
import { EventEmitter } from './event-emitter'

export class ServerBase<T extends CustomEvents> implements Server<T> {
	protected context = {
		events: new EventEmitter(),
		dependencies: dependencies,
	}

	on<K extends keyof ServerEvents<T>>(event: K, listener: ServerEvents<T>[K]) {
		this.context.events.on(event, listener)
	}
}
