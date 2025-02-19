import type { Server, ServerEvents } from '~types'
import { EventEmitter } from './event-emitter'

export class ServerBase<T extends Record<string, (...params: any[]) => void>>
	implements Server<T>
{
	protected context = {
		events: new EventEmitter(),
	}

	on<K extends keyof ServerEvents<T>>(event: K, listener: ServerEvents<T>[K]) {
		this.context.events.on(event, listener)
	}
}
