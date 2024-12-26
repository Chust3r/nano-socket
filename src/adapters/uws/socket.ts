import { CommonSendData, CommonWebSocket, WebSocketReadyState } from '~types'
import { CommonClientEmitter } from '~core/common-emitter'
import { WebSocket } from 'uWebSockets.js'

type WebSocketData = {
	adapter: UWSClientAdapter
}

export class UWSClientAdapter
	extends CommonClientEmitter
	implements CommonWebSocket
{
	private ws: WebSocket<WebSocketData>
	private isClosed: boolean = false

	constructor(ws: WebSocket<WebSocketData>) {
		super()
		this.ws = ws
	}

	get readyState(): WebSocketReadyState {
		return this.isClosed
			? WebSocketReadyState.CLOSED
			: WebSocketReadyState.OPEN
	}

	close(code?: number, reason?: string): void {
		this.ws.end(code || 1000, reason || '')
		this.emit('close', code, reason)
	}

	send(data: CommonSendData): void {
		this.ws.send(data as string | ArrayBuffer)
	}

	terminate(): void {
		this.close()
	}
}
