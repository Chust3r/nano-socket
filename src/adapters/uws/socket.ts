import type { WebSocket } from 'uWebSockets.js'
import { CommonClientEmitter } from '~core/common-emitter'
import type { CommonSendData, CommonWebSocket } from '~types'
import { WebSocketReadyState } from '~types'

type WebSocketData = {
	adapter: UWSClientAdapter
}

export class UWSClientAdapter
	extends CommonClientEmitter
	implements CommonWebSocket
{
	private ws: WebSocket<WebSocketData>
	private isClosed = false

	constructor(ws: WebSocket<WebSocketData>) {
		super()
		this.ws = ws
	}

	get readyState(): WebSocketReadyState {
		return this.isClosed ? WebSocketReadyState.CLOSED : WebSocketReadyState.OPEN
	}

	close(code?: number, reason?: string): void {
		this.ws.close()
		this.isClosed = true
		this.emit('close', code, reason)
	}

	send(data: CommonSendData): void {
		this.ws.send(data as string | ArrayBuffer)
	}

	terminate(): void {
		this.close()
	}
}
