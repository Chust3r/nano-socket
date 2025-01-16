import type { ServerWebSocket } from 'bun'
import { WebSocketAdapter } from '~core/adapter'
import type { OutgoingData, SocketAdapter, WebSocketReadyState } from '~types'

type WebSocketData = {
	adapter?: BunClientAdapter
}

export class BunClientAdapter
	extends WebSocketAdapter
	implements SocketAdapter
{
	constructor(private ws: ServerWebSocket<WebSocketData>) {
		super()
	}

	get readyState(): WebSocketReadyState {
		return this.ws.readyState
	}

	close = (code?: number, reason?: string): void => {
		this.ws.close(code, reason)
		this.emit('close', code, reason)
	}

	send = (data: OutgoingData): void => {
		this.ws.send(data)
	}

	terminate = (): void => {
		this.ws.terminate()
		this.emit('close')
	}
}
