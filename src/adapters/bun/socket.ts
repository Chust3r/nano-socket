import type {
	CommonSendData,
	CommonWebSocket,
	WebSocketReadyState,
} from '~types'
import { CommonClientEmitter } from '~core/common-emitter'
import type { ServerWebSocket } from 'bun'

type WebSocketData = {
	adapter?: BunClientAdapter
}

export class BunClientAdapter
	extends CommonClientEmitter
	implements CommonWebSocket
{
	private ws: ServerWebSocket<WebSocketData>

	constructor(ws: ServerWebSocket<WebSocketData>) {
		super()

		this.ws = ws
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
