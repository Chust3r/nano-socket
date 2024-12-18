import { EventEmitter } from '~core/event-emitter'
import type { SocketEventMap } from '~types'

export class ClientEventsManager {
	private emitter = new EventEmitter()

	on<K extends keyof SocketEventMap | string>(
		event: K,
		cb: K extends keyof SocketEventMap
			? SocketEventMap[K]
			: (...args: any[]) => void
	): void {
		this.emitter.on(event, cb)
	}

	once<K extends keyof SocketEventMap | string>(
		event: K,
		cb: K extends keyof SocketEventMap
			? SocketEventMap[K]
			: (...args: any[]) => void
	): void {
		this.emitter.once(event, cb)
	}

	emit<K extends keyof SocketEventMap | string>(
		event: K,
		...args: K extends keyof SocketEventMap
			? Parameters<SocketEventMap[K]>
			: any[]
	): void {
		this.emitter.emit(event, ...args)
	}
}
