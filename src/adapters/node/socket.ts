import { CommonSendData, CommonWebSocket, WebSocketReadyState } from '~types'
import type { WebSocket } from 'ws'
import { CommonClientEmitter } from '~core/common-emitter'

export class NodeClientAdapter
	extends CommonClientEmitter
	implements CommonWebSocket
{
	private ws: WebSocket

	constructor(ws: WebSocket) {
		super()
		this.ws = ws
		this.ws.on('close', (code, reason) => this.emit('close', code, reason))
		this.ws.on('message', (data, isBinary) =>
			this.emit('message', data, isBinary)
		)
		this.ws.on('error', (err) => this.emit('error', err))
	}

	get readyState(): WebSocketReadyState {
		return this.ws.readyState
	}

	close(code?: number, reason?: string): void {
		this.ws.close(code, reason)
		this.emit('close', code, reason)
	}

	send(data: CommonSendData): void {
		this.ws.send(data)
	}

	terminate(): void {
		this.ws.terminate()
		this.emit('close')
	}
}
