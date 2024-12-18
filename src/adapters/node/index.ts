import { IncomingMessage } from 'node:http'
import { WebSocketServer } from 'ws'
import { CommonWebSocket } from '~lib/types'
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
		})

		this.emit('connection', socket)
	}
}
