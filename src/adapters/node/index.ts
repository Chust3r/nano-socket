import { WebSocketServer } from 'ws'
import { ServerBase } from '~core/server-base'

export class Nano extends ServerBase {
	private server: WebSocketServer

	constructor() {
		super()
		this.server = new WebSocketServer({ port: 8080 })

		this.server.on('connection', (socket, req) => {
			this.context.events.emit('connection')
		})
	}
}
