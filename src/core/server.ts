import { ServerEventsManager } from '~managers/server-events'
import { ClientsConnectedManager } from '~managers/clients-connected'
import { Parser } from '~core/parser'
import { RoomManager } from '~managers/rooms'
import { MiddlewareManager } from '~managers/middlewares'
import { Middleware, ServerEventMap } from '~lib/types'

export class CommonServer {
	protected parser: Parser
	protected roomManager: RoomManager
	protected eventManager: ServerEventsManager
	protected clientManager: ClientsConnectedManager
	protected middlewareManager: MiddlewareManager

	constructor() {
		this.eventManager = new ServerEventsManager()
		this.parser = new Parser()
		this.clientManager = new ClientsConnectedManager()
		this.roomManager = new RoomManager()
		this.middlewareManager = new MiddlewareManager()
	}

	on<K extends keyof ServerEventMap>(event: K, cb: ServerEventMap[K]): void {
		this.eventManager.on(event, cb)
	}

	use(middleware: Middleware): void {
		this.middlewareManager.use(middleware)
	}
}
