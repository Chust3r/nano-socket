import { ServerEventsManager } from '~managers/server-events'
import { ClientsConnectedManager } from '~managers/clients-connected'
import { Parser } from '~core/parser'
import { RoomManager } from '~managers/rooms'
import { MiddlewareManager } from '~managers/middlewares'
import { IServer, Middleware, ServerEventMap, ServerFluent } from '~lib/types'
import { ServerFluentI } from '~core/server-fluent'

export class CommonServer implements IServer {
	protected parser: Parser
	protected roomManager: RoomManager
	protected eventManager: ServerEventsManager
	protected clientManager: ClientsConnectedManager
	protected middlewareManager: MiddlewareManager
	protected fluent: ServerFluent

	constructor() {
		this.eventManager = new ServerEventsManager()
		this.parser = new Parser()
		this.clientManager = new ClientsConnectedManager()
		this.roomManager = new RoomManager()
		this.middlewareManager = new MiddlewareManager()
		this.fluent = new ServerFluentI({
			parser: this.parser,
			clients: this.clientManager,
			roomManager: this.roomManager,
		})
	}

	on<K extends keyof ServerEventMap>(event: K, cb: ServerEventMap[K]): void {
		this.eventManager.on(event, cb)
	}

	use(middleware: Middleware): void {
		this.middlewareManager.use(middleware)
	}

	emit(event: string, ...args: any[]): void {
		const msg = this.parser.serialize(event, args)
		this.clientManager.broadcast(msg)
	}

	to(...rooms: string[]): ServerFluent {
		return this.fluent.to(...rooms)
	}

	exclude(...ids: string[]): ServerFluent {
		return this.fluent.exclude(...ids)
	}
}
