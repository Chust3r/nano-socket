import { ServerEventsManager } from '~managers/server-events'
import { ClientsConnectedManager } from '~managers/clients-connected'
import { Parser } from '~core/parser'
import { RoomManager } from '~core/managers/rooms'

export class Server {
	protected parser: Parser
	protected roomManager: RoomManager
	protected eventManager: ServerEventsManager
	protected clientManager: ClientsConnectedManager

	constructor() {
		this.eventManager = new ServerEventsManager()
		this.parser = new Parser()
		this.clientManager = new ClientsConnectedManager()
		this.roomManager = new RoomManager()
	}
}
