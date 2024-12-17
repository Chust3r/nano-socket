import { EventEmitter } from '~core/event-emitter'
import type { ServerEventMap } from '~types'

export class ServerEventsManager {
	private manager = new EventEmitter()

	on<K extends keyof ServerEventMap>(event: K, cb: ServerEventMap[K]) {
		this.manager.on(event, cb)
	}

	emit<K extends keyof ServerEventMap>(
		event: K,
		...args: Parameters<ServerEventMap[K]>
	) {
		this.manager.emit(event, ...args)
	}
}
