import type { CommonEventMap } from '~types'
import { EventEmitter } from '~core/event-emitter'

export class CommonClientEmitter {
	private emitter = new EventEmitter()

	on<K extends keyof CommonEventMap>(event: K, cb: CommonEventMap[K]) {
		this.emitter.on(event, cb)
	}

	emit<K extends keyof CommonEventMap>(
		event: K,
		...args: Parameters<CommonEventMap[K]>
	) {
		this.emitter.emit(event, ...args)
	}
}
