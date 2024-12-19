import { IncomingMessage } from 'node:http'
import { WebSocketServer } from 'ws'
import { CommonWebSocket, ServerEventMap } from '~lib/types'
import { NodeClientAdapter } from './socket'
import { Server } from '~core/server'
import { SocketClient } from '~core/client'

export class NanoSocket extends Server {
	private server: WebSocketServer

	constructor() {
		super()
		this.server = new WebSocketServer({ port: 8080 })
		this.server.on('connection', (socket, req) => {
			const ws = new NodeClientAdapter(socket)
			this.handleConnection(ws, req)
		})
	}

	private handleConnection(ws: CommonWebSocket, req: IncomingMessage): void {
		const socket = new SocketClient({
			ws,
			parser: this.parser,
			clients: this.clientManager,
			roomManager: this.roomManager,
		})

		this.clientManager.add(socket)
		this.eventManager.emit('connection', socket)
	}

	on<K extends keyof ServerEventMap>(event: K, cb: ServerEventMap[K]): void {
		this.eventManager.on(event, cb)
	}
}
