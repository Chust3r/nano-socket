import type { CustomEvents, Namespace, ServerEvents, Socket } from '~types'
import { EventEmitter } from './event-emitter'

export class NamespaceBase<T extends CustomEvents> implements Namespace<T> {
	private context = {
		events: new EventEmitter(),
	}

	public handleConnection = (client: Socket<T>) => {
		this.context.events.emit('connection', client)
	}

	public on<K extends keyof ServerEvents<T>>(
		event: K,
		listener: ServerEvents<T>[K],
	) {
		this.context.events.on(event, listener)
	}
}
