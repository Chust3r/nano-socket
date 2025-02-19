import { nanoid } from 'nanoid'
import { EventEmitter } from '~core/event-emitter'
import type { IncomingData, Socket, SocketAdapter, SocketEvents } from '~types'

interface SocketClientContext {
	id: string
	events: EventEmitter<any>
	adapter: SocketAdapter
}

interface SocketClientProps {
	adapter: SocketAdapter
}

export class SocketClient<T extends Record<string, any>> implements Socket<T> {
	private context: SocketClientContext

	constructor(props: SocketClientProps) {
		this.context = {
			id: nanoid(),
			events: new EventEmitter(),
			adapter: props.adapter,
		}

		this.context.adapter.on('message', this.handleMessage)
	}

	private handleMessage = (data: IncomingData) => {}

	on<K extends keyof T>(event: K, listener: T[K]): void

	on<K extends keyof SocketEvents>(event: K, listener: SocketEvents[K]): void

	on<K extends keyof (T & SocketEvents)>(
		event: K,
		listener: (T & SocketEvents)[K],
	): void {
		this.context.events.on(event as string, listener)
	}

	emit<K extends keyof T>(event: K, ...params: Parameters<T[K]>) {}
}
