import { createNanoEvents } from 'nanoevents'
import type { CommonEventMap } from '~types'

export class CommonEventEmmiter {
	private emitter = createNanoEvents<CommonEventMap>()

	emit<K extends keyof CommonEventMap>(
		event: K,
		...args: Parameters<CommonEventMap[K]>
	) {
		this.emitter.emit(event, ...args)
	}

	on<K extends keyof CommonEventMap>(event: K, cb: CommonEventMap[K]): void {
		this.emitter.on(event, cb)
	}
}
