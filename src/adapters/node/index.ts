import { WebSocketServer } from 'ws'
import { ServerBase } from '~core/server-base'
import { SocketClient } from '~core/socket-client'
import { NodeSocketAdapter } from './socket'

export class Nano<T extends Record<string, any>> extends ServerBase<T> {
	private server: WebSocketServer

	constructor() {
		super()
		this.server = new WebSocketServer({ port: 8080 })

		this.server.on('connection', (socket, req) => {
			const adapter = new NodeSocketAdapter(socket)

			const client = new SocketClient<T>({ adapter })

			this.context.events.emit('connection', client)
		})
	}
}
