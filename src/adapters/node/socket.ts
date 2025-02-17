import type { WebSocket } from 'ws'
import { SocketBase } from '~core/socket-base'
import type { SocketAdapter } from '~types'

export class NodeSocketAdapter extends SocketBase implements SocketAdapter {
	constructor(private ws: WebSocket) {
		super()

		this.ws.on('close', (code, reason) =>
			this.emit('close', code, reason.toString()),
		)
		this.ws.on('message', (data) => this.emit('message', data))
		this.ws.on('error', (err) => this.emit('error', err))
	}

	close = (code?: number, reason?: string): void => {
		this.ws.close(code, reason)
	}

	send = (): void => {}

	terminate = (): void => {
		this.ws.terminate()
	}
}
