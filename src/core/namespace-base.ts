import type { CustomEvents, Namespace, ServerEvents } from '~types'
import { EventEmitter } from './event-emitter'

export class NamespaceBase<T extends CustomEvents> implements Namespace<T> {
	protected context = {
		events: new EventEmitter(),
	}

	public on<K extends keyof ServerEvents<T>>(
		event: K,
		listener: ServerEvents<T>[K]
	) {
		this.context.events.on(event, listener)
	}
}
