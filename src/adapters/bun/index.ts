import { CommonWebSocket, SocketRequest } from '~types'
import { BunClientAdapter } from './socket'
import { CommonServer } from '~core/server'
import { SocketClient } from '~core/client'
import { getBunRequest } from '~lib/request'
import { Server as IServe } from 'bun'

type WebSocketData = {
	adapter: BunClientAdapter
	req: Request
	server: IServe
}

export class Server extends CommonServer {
	constructor() {
		super()

		Bun.serve<WebSocketData>({
			fetch(req, server) {
				server.upgrade(req, {
					data: {
						req,
						server,
					},
				})

				return undefined
			},
			websocket: {
				open: (ws) => {
					const bunWs = new BunClientAdapter(ws)

					ws.data.adapter = bunWs

					const req = getBunRequest(ws.data.req, ws.data.server)

					this.handleConnection(bunWs, req)
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

	private handleConnection(ws: CommonWebSocket, req: SocketRequest): void {
		const socket = new SocketClient({
			ws,
			parser: this.parser,
			clients: this.clientManager,
			roomManager: this.roomManager,
			request: req,
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
