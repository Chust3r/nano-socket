import {
	Socket,
	CommonWebSocket,
	SocketEventMap,
	CommonRecivedData,
} from '~types'
import { nanoid } from 'nanoid'
import { Parser } from './parser'

interface SocketClientProps {
	ws: CommonWebSocket
	parser: Parser
}

export class SocketClient implements Socket {
	private _id: string
	private ws: CommonWebSocket
	private parser: Parser

	constructor({ ws, parser }: SocketClientProps) {
		this._id = nanoid(36)
		this.ws = ws
		this.parser = parser

		this.ws.on('message', this.handleMessage)
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

	private handleMessage = (data: CommonRecivedData, isBinary?: boolean) => {
		const { event, args } = this.parser.deserialize(data)
	}
}
