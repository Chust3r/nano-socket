import { WebSocketServer } from 'ws'
import { ServerBase } from '~core/server-base'
import type { ExtendedEvents } from '~types'
import { NodeSocketAdapter } from './socket'

export class Nano<
	T extends ExtendedEvents = ExtendedEvents,
	U extends ExtendedEvents = T,
> extends ServerBase<T, U> {
	private server: WebSocketServer

	constructor() {
		super()
		this.server = new WebSocketServer({ port: 8080 })

		this.server.on('connection', (socket, req) => {
			const adapter = new NodeSocketAdapter(socket)
			const client = this.createClient<T>(adapter)
			const path = this.getRequestPath(req.url, '/')
			const namespace = this.getNamespace(path)
			const context = this.createContext(client)

			this.run(path, context, () => {
				namespace.handleConnection(client)
			})
		})
	}
}
