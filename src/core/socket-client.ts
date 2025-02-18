import { nanoid } from 'nanoid'
import { EventEmitter } from '~core/event-emitter'
import type { Socket, SocketEvents } from '~types'

export class SocketClient<T extends Record<string, any>> implements Socket<T> {
	private context = {
		id: nanoid(),
		events: new EventEmitter(),
	}

	on<K extends keyof T>(event: K, listener: T[K]): void

	on<K extends keyof SocketEvents>(event: K, listener: SocketEvents[K]): void

	on<K extends keyof (T & SocketEvents)>(
		event: K,
		listener: (T & SocketEvents)[K],
	): void {
		this.context.events.on(event as string, listener)
	}

	emit<K extends keyof T>(event: K, ...params: Parameters<T[K]>) {
		this.context.events.emit(event as string, ...params)
	}
}
