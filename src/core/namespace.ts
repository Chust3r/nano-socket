import type { Parser } from '~core/parser'
import { ServerFluent } from '~core/server-fluent'
import { ClientsConnectedManager } from '~managers/clients-connected'
import { MiddlewareManager } from '~managers/middlewares'
import { RoomManager } from '~managers/rooms'
import { ServerEventsManager } from '~managers/server-events'
import type {
	Fluent,
	Middleware,
	Namespace as Nam,
	ServerEventMap,
} from '~types'

export class Namespace implements Nam {
	public roomManager: RoomManager
	public eventManager: ServerEventsManager
	public clientManager: ClientsConnectedManager
	public middlewareManager: MiddlewareManager
	protected fluent: Fluent

	constructor(
		protected parser: Parser,
		middlewareTimeout?: number,
	) {
		this.eventManager = new ServerEventsManager()
		this.clientManager = new ClientsConnectedManager()
		this.roomManager = new RoomManager()
		this.middlewareManager = new MiddlewareManager(middlewareTimeout)
		this.fluent = new ServerFluent({
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
			getMembers: (room: string) =>
				this.roomManager
					.getRoomMembers(room)
					.map((id) => this.clientManager.get(id))
					.filter((s) => s !== undefined),
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

	get clients() {
		return {
			clients: this.clientManager.getAllClients(),
			count: this.clientManager.getTotalClients(),
			get: (id: string) => {
				const client = this.clientManager.get(id)
				return client
			},
			has: (id: string) => this.clientManager.has(id),
			getExcluding: (...excludedIds: string[]) =>
				this.clientManager.getClientsExcluding(...excludedIds),
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

	to(...rooms: string[]): Fluent {
		return this.fluent.to(...rooms)
	}

	exclude(...ids: string[]): Fluent {
		return this.fluent.exclude(...ids)
	}
}
