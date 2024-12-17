import { Socket, CommonWebSocket, SocketEventMap } from '~types'
import { nanoid } from 'nanoid'

export class SocketClient implements Socket {
	private _id: string
	private ws: CommonWebSocket

	constructor(ws: CommonWebSocket) {
		this._id = nanoid(36)
		this.ws = ws
	}

	get id(): string {
		return this._id
	}

	on<K extends keyof SocketEventMap | string>(
		event: K,
		callback: K extends keyof SocketEventMap
			? SocketEventMap[K]
			: (...args: any[]) => void | Promise<void>
	): void {}

	send(data: any): void {
		this.ws.send(data)
	}

	emit(event: string, ...args: any[]): void {}
}
