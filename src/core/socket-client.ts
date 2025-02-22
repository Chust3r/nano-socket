import { nanoid } from 'nanoid'
import { EventEmitter } from '~core/event-emitter'
import type {
	CustomEvents,
	IncomingData,
	Parser,
	Socket,
	SocketAdapter,
	SocketEvents,
} from '~types'
import { dependencies } from '~utils/dependencies'

interface SocketClientContext {
	id: string
	events: EventEmitter<any>
	adapter: SocketAdapter
	parser: Parser
}

export class SocketClient<T extends CustomEvents> implements Socket<T> {
	private context: SocketClientContext

	constructor(adapter: SocketAdapter) {
		this.context = {
			id: dependencies.resolve('generateId')(),
			events: new EventEmitter(),
			adapter,
			parser: dependencies.resolve('parser'),
		}

		this.context.adapter.on('message', this.handleMessage)
	}

	private handleMessage = (data: IncomingData) => {
		const { event, params } = this.context.parser.deserialize(data)
		this.context.events.emit(event, ...params)
	}

	get id() {
		return this.context.id
	}

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
