import {
	Socket,
	CommonWebSocket,
	SocketEventMap,
	CommonRecivedData,
} from '~types'
import { nanoid } from 'nanoid'
import { Parser } from './parser'
import { ClientEventsManager } from './managers/client-events'

interface SocketClientProps {
	ws: CommonWebSocket
	parser: Parser
}

export class SocketClient implements Socket {
	private _id: string
	private ws: CommonWebSocket
	private parser: Parser
	private eventManager: ClientEventsManager

	constructor({ ws, parser }: SocketClientProps) {
		this._id = nanoid(36)
		this.ws = ws
		this.parser = parser
		this.eventManager = new ClientEventsManager()

		this.ws.on('message', this.handleMessage)
		this.ws.on('close', this.handleClose)
	}

	get id(): string {
		return this._id
	}

	on<K extends keyof SocketEventMap | string>(
		event: K,
		cb: K extends keyof SocketEventMap
			? SocketEventMap[K]
			: (...args: any[]) => void | Promise<void>
	): void {
		this.eventManager.on(event, cb)
	}

	once<K extends keyof SocketEventMap | string>(
		event: K,
		cb: K extends keyof SocketEventMap
			? SocketEventMap[K]
			: (...args: any[]) => void | Promise<void>
	): void {
		this.eventManager.once(event, cb)
	}

	onAny(cb: (event: string, ...args: any[]) => void): void {
		this.eventManager.on('*', cb)
	}

	send(data: any): void {
		this.ws.send(data)
	}

	emit(event: string, ...args: any[]): void {
		//→ TODO: IMPLEMENT EMIT
	}

	private handleMessage = (
		data: CommonRecivedData,
		isBinary?: boolean
	): void => {
		const { event, args } = this.parser.deserialize(data)
		this.eventManager.emit(event, ...args)
	}

	private handleClose = (): void => {
		this.eventManager.emit('disconnect', 1000, 'Socket Closed')
	}
}
