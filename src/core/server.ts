import { ServerEventsManager } from '~managers/server-events'
import { ClientsConnectedManager } from '~managers/clients-connected'
import { Parser } from '~core/parser'
import { RoomManager } from '~core/managers/rooms'

export class Server extends ServerEventsManager {
	protected parser: Parser
	protected clientManager: ClientsConnectedManager
	protected roomManager: RoomManager

	constructor() {
		super()
		this.parser = new Parser()
		this.clientManager = new ClientsConnectedManager()
		this.roomManager = new RoomManager()
	}
}
