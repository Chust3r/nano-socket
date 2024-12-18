import { ServerEventsManager } from '~managers/server-events'
import { ClientsConnectedManager } from '~managers/clients-connected'
import { Parser } from './parser'

export class Server extends ServerEventsManager {
	protected parser: Parser
	protected clients: ClientsConnectedManager

	constructor() {
		super()
		this.parser = new Parser()
		this.clients = new ClientsConnectedManager()
	}
}
