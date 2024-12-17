import { ClientNanoSocket, CommonWebSocket, NanoSocketEventMap } from '~types'
import { nanoid } from 'nanoid'

export class NanoSocketSocket implements ClientNanoSocket {
	private _id: string
	private ws: CommonWebSocket

	constructor(ws: CommonWebSocket) {
		this._id = nanoid()
		this.ws = ws
	}

	get id(): string {
		return this._id
	}

	on<K extends keyof NanoSocketEventMap | string>(
		event: K,
		callback: K extends keyof NanoSocketEventMap
			? NanoSocketEventMap[K]
			: (...args: any[]) => void | Promise<void>
	): void {}

	send(data: any): void {
		this.ws.send(data)
	}

	emit(event: string, ...args: any[]): void {}
}
