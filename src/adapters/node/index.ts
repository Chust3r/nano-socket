import { WebSocketServer } from 'ws'
import { ServerBase } from '~core/server-base'
import { SocketClient } from '~core/socket-client'
import type { CustomEvents, Middleware } from '~types'
import { NodeSocketAdapter } from './socket'

export class Nano<T extends CustomEvents> extends ServerBase<T> {
	private server: WebSocketServer

	constructor() {
		super()
		this.server = new WebSocketServer({ port: 8080 })

		this.server.on('connection', (socket, req) => {
			const adapter = new NodeSocketAdapter(socket)
			const client = new SocketClient<T>(adapter)
			const namespace = this.context.namespaces.getOrCreate('/')

			this.context.middlewares.run(
				'/',
				{ socket: client as any, url: req.url || '/' },
				() => {
					namespace.context.events.emit('connection', client)
				},
			)
		})
	}

	use = (middleware: Middleware) => {
		this.context.middlewares.add('/', middleware)
	}
}
