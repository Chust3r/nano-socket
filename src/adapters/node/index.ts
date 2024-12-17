import { IncomingMessage } from 'node:http'
import { WebSocketServer } from 'ws'
import { CommonWebSocket } from '~lib/types'
import { NodeClientAdapter } from './socket'
import { Server } from '~core/server'

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

	private handleConnection(
		socket: CommonWebSocket,
		req: IncomingMessage
	): void {
		this.emit('connection', socket)
	}
}
