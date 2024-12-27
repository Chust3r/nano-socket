import type {
	Socket,
	CommonWebSocket,
	SocketEventMap,
	CommonRecivedData,
	SocketFluent,
	CommonSendData,
	SocketRequest,
} from '~types'
import { WebSocketReadyState } from '~types'
import { nanoid } from 'nanoid'
import type { Parser } from '~core/parser'
import { ClientEventsManager } from '~managers/client-events'
import type { ClientsConnectedManager } from '~managers/clients-connected'
import type { RoomManager } from '~core/managers/rooms'
import { SocketClientFluent } from '~core/client-fluent'

interface SocketClientProps {
	ws: CommonWebSocket
	parser: Parser
	clients: ClientsConnectedManager
	roomManager: RoomManager
	request: SocketRequest
}

export class SocketClient implements Socket {
	private _id: string
	private ws: CommonWebSocket
	private parser: Parser
	private clients: ClientsConnectedManager
	private roomManager: RoomManager
	private eventManager = new ClientEventsManager()
	private targetRooms = new Set<string>()
	private fluent: SocketFluent
	private isBroadcast = false
	public data = new Map<string, any>()
	private req: SocketRequest
	private isClosed = false

	constructor({
		ws,
		parser,
		clients,
		roomManager,
		request,
	}: SocketClientProps) {
		this._id = nanoid()
		this.ws = ws
		this.parser = parser
		this.clients = clients
		this.roomManager = roomManager
		this.fluent = new SocketClientFluent(this)
		this.req = request

		this.ws.on('message', this.handleMessage)
		this.ws.on('close', this.handleClose)
	}

	private handleMessage = (data: CommonRecivedData): void => {
		const { event, args } = this.parser.deserialize(data)
		this.eventManager.emit(event, ...args)
	}

	private handleClose = (): void => {
		if (this.isClosed) return
		this.isClosed = true

		this.clients.remove(this._id)
		this.roomManager.remove(this._id)
		this.eventManager.emit('disconnect', 1000, 'Socket Closed')
	}

	private clear(): void {
		this.targetRooms.clear()
		this.isBroadcast = false
	}

	private getClientsForEmit(): string[] {
		let clients: string[] = []
		const rooms = Array.from(this.targetRooms)

		if (this.isBroadcast && this.targetRooms.size > 0) {
			clients = this.roomManager
				.getRoomsMembers(...rooms)
				.filter((clientId) => clientId !== this.id)
		} else if (!this.isBroadcast && this.targetRooms.size > 0) {
			clients = this.roomManager.getRoomsMembers(...rooms)
		} else if (this.isBroadcast) {
			clients = this.clients
				.getClientsExcluding(this.id)
				.map((client) => client.id)
		}

		return clients
	}

	get id(): string {
		return this._id
	}

	get rooms(): string[] {
		return this.roomManager.getMemberRooms(this._id)
	}

	get broadcast() {
		this.isBroadcast = true
		return this.fluent
	}

	get request(): SocketRequest {
		return this.req
	}

	on<K extends keyof SocketEventMap | string>(
		event: K,
		cb: K extends keyof SocketEventMap
			? SocketEventMap[K]
			: (...args: any[]) => void | Promise<void>,
	): void {
		this.eventManager.on(event, cb)
	}

	send(data: CommonSendData): void {
		if (this.ws.readyState === WebSocketReadyState.OPEN) {
			this.ws.send(data)
		}
	}

	once<K extends keyof SocketEventMap | string>(
		event: K,
		cb: K extends keyof SocketEventMap
			? SocketEventMap[K]
			: (...args: any[]) => void | Promise<void>,
	): void {
		this.eventManager.once(event, cb)
	}

	onAny(cb: (event: string, ...args: any[]) => void): void {
		this.eventManager.on('*', cb)
	}

	emit(event: string, ...args: any[]): void {
		const data = this.parser.serialize(event, ...args)
		const clients = this.getClientsForEmit()

		if (clients.length > 0) {
			this.clients.sendToSpecificClients(data, ...clients)
			this.clear()
			return
		}

		if (!this.isBroadcast) {
			this.send(data)
		}
	}

	close(): void {
		this.ws.close()
	}

	terminate(): void {
		this.ws.terminate()
	}

	setTargetRooms(...rooms: string[]) {
		this.targetRooms = new Set([...this.targetRooms, ...rooms])
	}

	in(...rooms: string[]): boolean {
		return this.roomManager.in(this._id, ...rooms)
	}

	join(...rooms: string[]): void {
		for (const room of rooms) {
			this.roomManager.add(room, this._id)
		}
	}

	leave(...rooms: string[]): void {
		this.roomManager.remove(this._id, ...rooms)
	}

	to(...rooms: string[]) {
		for (const room of rooms) {
			if (this.in(room)) {
				this.join(room)
			}
		}

		this.setTargetRooms(...rooms)
		return this.fluent
	}
}
