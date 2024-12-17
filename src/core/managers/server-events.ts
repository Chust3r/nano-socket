import type { ServerEventMap } from '~types'
import { createNanoEvents } from 'nanoevents'

export class ServerEvents {
	private emitter = createNanoEvents<ServerEventMap>()

	emit<K extends keyof ServerEventMap>(
		event: K,
		...args: Parameters<ServerEventMap[K]>
	) {
		this.emitter.emit(event, ...args)
	}

	on<K extends keyof ServerEventMap>(event: K, cb: ServerEventMap[K]): void {
		this.emitter.on(event, cb)
	}
}
