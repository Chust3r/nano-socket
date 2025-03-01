import type { ExtendedEvents, Namespace, ServerEvents, Socket } from '~types'
import { EventEmitter } from './event-emitter'

export class NamespaceBase<T extends ExtendedEvents, U extends ExtendedEvents>
	implements Namespace<T, U>
{
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

	public emit<K extends keyof U>(event: K, ...params: Parameters<U[K]>) {
		// TODO: emit event
	}
}
