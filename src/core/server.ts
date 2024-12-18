import { ServerEventsManager } from '~managers/server-events'
import { Parser } from './parser'

export class Server extends ServerEventsManager {
	protected parser: Parser

	constructor() {
		super()
		this.parser = new Parser()
	}
}
