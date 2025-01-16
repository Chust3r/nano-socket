import type { WebSocket } from 'ws'
import { WebSocketAdapter } from '~core/adapter'
import {
	type OutgoingData,
	type SocketAdapter,
	WebSocketReadyState,
} from '~types'

export class NodeClientAdapter
	extends WebSocketAdapter
	implements SocketAdapter
{
	constructor(private ws: WebSocket) {
		super()
		this.ws = ws
		this.ws.on('close', (code, reason) => this.emit('close', code, reason))
		this.ws.on('message', (data) => this.emit('message', data))
		this.ws.on('error', (err) => this.emit('error', err))
	}

	get readyState(): WebSocketReadyState {
		return this.ws.readyState
	}

	close = (code?: number, reason?: string): void => {
		if (this.isClosed) return

		this.isClosed = true
		this.ws.close(code, reason)
		this.emit('close', code, reason)
	}

	send = (data: OutgoingData): void => {
		if (this.readyState === WebSocketReadyState.OPEN) this.ws.send(data)
	}

	terminate = (): void => {
		this.ws.terminate()
		this.emit('close')
	}
}
