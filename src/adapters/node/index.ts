import { IncomingMessage } from 'node:http'
import { WebSocketServer } from 'ws'
import { NodeClientAdapter } from './socket'
import { CommonWebSocket } from '~lib/types'

export class NanoSocket {
	private server: WebSocketServer

	constructor() {
		this.server = new WebSocketServer({ port: 8080 })
		this.server.on('connection', (socket, req) => {
			const ws = new NodeClientAdapter(socket)

			this.handleConnection(ws, req)
		})
	}

	private handleConnection(
		socket: CommonWebSocket,
		req: IncomingMessage
	): void {}
}
