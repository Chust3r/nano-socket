import { EventEmitter } from '~core/event-emitter'
import type { SocketAdapterEventMap } from '~types'

export class WebSocketAdapter {
	private emitter = new EventEmitter()
	protected isClosed = false

	on = <K extends keyof SocketAdapterEventMap>(
		event: K,
		cb: SocketAdapterEventMap[K],
	): void => {
		this.emitter.on(event, cb)
	}

	emit = <K extends keyof SocketAdapterEventMap>(
		event: K,
		...args: Parameters<SocketAdapterEventMap[K]>
	): void => {
		this.emitter.emit(event, ...args)
	}
}
