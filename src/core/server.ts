import { ServerEventsManager } from '~managers/server-events'
import { ClientsConnectedManager } from '~managers/clients-connected'
import { Parser } from '~core/parser'
import { RoomManager } from '~managers/rooms'
import { MiddlewareManager } from '~managers/middlewares'
import {
	IServer,
	Middleware,
	ServerEventMap,
	ServerFluent,
	Socket,
} from '~lib/types'
import { ServerFluentI } from '~core/server-fluent'

export class CommonServer implements IServer {
	protected parser: Parser
	protected roomManager: RoomManager
	protected eventManager: ServerEventsManager
	protected clientManager: ClientsConnectedManager
	protected middlewareManager: MiddlewareManager
	protected fluent: ServerFluent

	constructor() {
		this.eventManager = new ServerEventsManager()
		this.parser = new Parser()
		this.clientManager = new ClientsConnectedManager()
		this.roomManager = new RoomManager()
		this.middlewareManager = new MiddlewareManager()
		this.fluent = new ServerFluentI({
			parser: this.parser,
			clients: this.clientManager,
			roomManager: this.roomManager,
		})
	}

	get rooms() {
		return {
			rooms: this.roomManager.getRooms(),
			merge: (target: string, ...rooms: string[]) =>
				this.roomManager.merge(target, ...rooms),
			getMembers: (room: string) => this.roomManager.getRoomMembers(room),
			move: (member: string, from: string, to: string) =>
				this.roomManager.moveClientToRoom(member, from, to),
			delete: (room: string) => this.roomManager.deleteRoom(room),
			in: (member: string, ...rooms: string[]) =>
				this.roomManager.in(member, ...rooms),
			remove: (member: string, ...rooms: string[]) =>
				this.roomManager.remove(member, ...rooms),
			getCount: (room: string) => this.roomManager.getRoomMembersCount(room),
		}
	}

	private getClientPublicData(client: Socket): Socket {
		return {
			id: client.id,
			rooms: client.rooms,
			data: client.data,
			on: client.on.bind(client),
			once: client.once.bind(client),
			onAny: client.onAny.bind(client),
			emit: client.emit.bind(client),
			send: client.send.bind(client),
			close: client.close.bind(client),
			terminate: client.terminate.bind(client),
			in: client.in.bind(client),
			join: client.join.bind(client),
			leave: client.leave.bind(client),
			to: client.to.bind(client),
			broadcast: client.broadcast,
		}
	}

	get clients() {
		return {
			clients: this.clientManager
				.getAllClients()
				.map(this.getClientPublicData),
			count: this.clientManager.getTotalClients(),
			get: (id: string) => {
				const client = this.clientManager.get(id)
				return client ? this.getClientPublicData(client) : undefined
			},
			has: (id: string) => this.clientManager.has(id),
			getExcluding: (...excludedIds: string[]) =>
				this.clientManager
					.getClientsExcluding(...excludedIds)
					.map(this.getClientPublicData),
		}
	}

	on<K extends keyof ServerEventMap>(event: K, cb: ServerEventMap[K]): void {
		this.eventManager.on(event, cb)
	}

	use(middleware: Middleware): void {
		this.middlewareManager.use(middleware)
	}

	emit(event: string, ...args: any[]): void {
		const msg = this.parser.serialize(event, args)
		this.clientManager.broadcast(msg)
	}

	to(...rooms: string[]): ServerFluent {
		return this.fluent.to(...rooms)
	}

	exclude(...ids: string[]): ServerFluent {
		return this.fluent.exclude(...ids)
	}
}
