import { SocketClient } from '~core/client'
import { SocketFluent } from '~types'

export class SocketClientFluent implements SocketFluent {
	private socket: SocketClient

	constructor(socket: SocketClient) {
		this.socket = socket
	}

	to(...rooms: string[]): this {
		this.socket.to(...rooms)
		return this
	}

	emit(event: string, ...args: any[]): void {
		this.socket.emit(event, ...args)
	}
}
