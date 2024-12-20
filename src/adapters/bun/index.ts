import { CommonWebSocket } from '~lib/types'
import { BunClientAdapter } from './socket'
import { CommonServer } from '~core/server'
import { SocketClient } from '~core/client'

type WebSocketData = {
	adapter: BunClientAdapter
}

export class Server extends CommonServer {
	constructor() {
		super()

		Bun.serve<WebSocketData>({
			fetch(req, server) {
				server.upgrade(req, {
					data: {},
				})

				console.log({ req, server })

				return undefined
			},
			websocket: {
				open: (ws) => {
					const bunWs = new BunClientAdapter(ws)

					ws.data.adapter = bunWs

					this.handleConnection(bunWs)
				},
				message: (ws, message) => {
					const bunWs = ws.data.adapter
					if (bunWs) {
						bunWs.emit('message', message)
					}
				},
				close: (ws, code, reason) => {
					const bunWs = ws.data.adapter
					if (bunWs) {
						bunWs.emit('close', code, reason)
					}
				},
			},
			port: 8080,
		})
	}

	private handleConnection(ws: CommonWebSocket): void {
		const socket = new SocketClient({
			ws,
			parser: this.parser,
			clients: this.clientManager,
			roomManager: this.roomManager,
		})

		this.middlewareManager.run(socket, (err) => {
			if (err) {
				socket.terminate()
				return
			}
			this.clientManager.add(socket)
			this.eventManager.emit('connection', socket)
		})
	}
}
