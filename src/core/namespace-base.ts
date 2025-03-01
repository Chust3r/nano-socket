import { SocketsManager } from '~managers/sockets'
import type {
	ExtendedEvents,
	Namespace,
	OutgoingData,
	ServerEvents,
	Socket,
} from '~types'
import { dependencies } from '~utils/dependencies'
import { EventEmitter } from './event-emitter'

export class NamespaceBase<T extends ExtendedEvents, U extends ExtendedEvents>
	implements Namespace<T, U>
{
	private context = {
		events: new EventEmitter(),
		parser: dependencies.resolve('parser'),
		sockets: new SocketsManager<T>(),
		broadcast: false,
	}

	public handleConnection = (client: Socket<T>) => {
		this.context.sockets.add(client)
		this.context.events.emit('connection', client)
	}

	public on<K extends keyof ServerEvents<T>>(
		event: K,
		listener: ServerEvents<T>[K],
	) {
		this.context.events.on(event, listener)
	}

	public emit<K extends keyof U>(event: K, ...params: Parameters<U[K]>) {
		this.send(this.context.parser.serialize(event as string, ...params))
	}

	public send(message: OutgoingData): void {
		this.context.sockets.map((client) => client.send(message))
	}
}
