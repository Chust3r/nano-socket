import {
	Socket,
	CommonWebSocket,
	SocketEventMap,
	CommonRecivedData,
} from '~types'
import { nanoid } from 'nanoid'
import { Parser } from '~core/parser'
import { ClientEventsManager } from '~managers/client-events'
import { ClientsConnectedManager } from '~managers/clients-connected'
import { RoomManager } from '~core/managers/rooms'

interface SocketClientProps {
	ws: CommonWebSocket
	parser: Parser
	clients: ClientsConnectedManager
	roomManager: RoomManager
}

export class SocketClient implements Socket {
	private _id: string
	private ws: CommonWebSocket
	private parser: Parser
	private eventManager: ClientEventsManager
	private clients: ClientsConnectedManager
	private roomManager: RoomManager

	constructor({ ws, parser, clients, roomManager }: SocketClientProps) {
		this._id = nanoid(36)
		this.ws = ws
		this.parser = parser
		this.clients = clients
		this.roomManager = roomManager
		this.eventManager = new ClientEventsManager()

		this.ws.on('message', this.handleMessage)
		this.ws.on('close', this.handleClose)
	}

	private handleMessage = (
		data: CommonRecivedData,
		isBinary?: boolean
	): void => {
		const { event, args } = this.parser.deserialize(data)
		this.eventManager.emit(event, ...args)
	}

	private handleClose = (): void => {
		this.clients.remove(this._id)
		this.roomManager.remove(this._id)
		this.eventManager.emit('disconnect', 1000, 'Socket Closed')
	}

	get id(): string {
		return this._id
	}

	get rooms(): string[] {
		return this.roomManager.getMemberRooms(this._id)
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

	emit(event: string, ...args: any[]): void {
		const data = this.parser.serialize(event, ...args)
		this.ws.send(data)
	}

	close(): void {
		this.ws.close()
	}

	terminate(): void {
		this.ws.terminate()
	}

	in(...rooms: string[]): boolean {
		return this.roomManager.in(this._id, ...rooms)
	}

	join(...rooms: string[]): void {
		rooms.forEach((room) => this.roomManager.add(room, this._id))
	}

	leave(...rooms: string[]): void {
		this.roomManager.remove(this._id, ...rooms)
	}
}
