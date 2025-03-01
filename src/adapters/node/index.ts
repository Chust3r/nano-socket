import { WebSocketServer } from 'ws'
import { ServerBase } from '~core/server-base'
import { SocketClient } from '~core/socket-client'
import type { ExtendedEvents, Middleware } from '~types'
import { NodeSocketAdapter } from './socket'

export class Nano<
	T extends ExtendedEvents,
	U extends ExtendedEvents,
> extends ServerBase<T, U> {
	private server: WebSocketServer

	constructor() {
		super()
		this.server = new WebSocketServer({ port: 8080 })

		this.server.on('connection', (socket, req) => {
			const adapter = new NodeSocketAdapter(socket)
			const client = new SocketClient<T>(adapter)
			const path = this.getRequestPath(req.url, '/')
			const namespace = this.context.namespaces.getOrCreate(path)

			this.run(path, {}, () => {
				namespace.handleConnection(client)
			})
		})
	}

	use = (middleware: Middleware) => {
		this.context.middlewares.add('/', middleware)
	}
}
