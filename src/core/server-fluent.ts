import { Fluent } from '~types'
import { Parser } from '~core/parser'
import { ClientsConnectedManager } from '~managers/clients-connected'
import { RoomManager } from '~managers/rooms'

interface ServerFluentIProps {
	parser: Parser
	clients: ClientsConnectedManager
	roomManager: RoomManager
}

export class ServerFluent implements Fluent {
	private excludeIds: Set<string> = new Set()
	private excludeRooms: Set<string> = new Set()
	private targetRooms: Set<string> = new Set()
	private clients: ClientsConnectedManager
	private roomManager: RoomManager
	private parser: Parser

	constructor({ clients, parser, roomManager }: ServerFluentIProps) {
		this.clients = clients
		this.parser = parser
		this.roomManager = roomManager
	}

	private setTargetRooms(...rooms: string[]) {
		this.targetRooms = new Set([...this.targetRooms, ...rooms])
	}

	private getTargetClients() {
		let clients = this.clients.getAllClients().map((client) => client.id)

		if (
			this.targetRooms.size === 0 &&
			this.excludeIds.size === 0 &&
			this.excludeRooms.size === 0
		) {
			return clients
		}

		if (this.targetRooms.size > 0) {
			clients = this.roomManager.getRoomsMembers(
				...Array.from(this.targetRooms)
			)
		}

		if (this.excludeIds.size > 0) {
			clients = clients.filter((client) => !this.excludeIds.has(client))
		}

		if (this.excludeRooms.size > 0) {
			clients = clients.filter((client) => {
				const clientRooms = this.roomManager.getMemberRooms(client)
				const isInExcludedRoom = Array.from(this.excludeRooms).some(
					(room) => clientRooms.includes(room)
				)
				const isInTargetRoom = Array.from(this.targetRooms).some((room) =>
					clientRooms.includes(room)
				)

				return !(isInExcludedRoom && !isInTargetRoom)
			})
		}

		return clients
	}

	emit(event: string, ...args: any[]): void {
		const msg = this.parser.serialize(event, args)
		const clients = this.getTargetClients()

		console.log('clients', clients)

		this.clients.sendToSpecificClients(msg, ...clients)
	}

	exclude(...args: string[]): this {
		args.forEach((arg) => {
			if (this.clients.has(arg)) {
				this.excludeIds.add(arg)
			} else {
				this.excludeRooms.add(arg)
			}
		})
		return this
	}

	to(...rooms: string[]): this {
		this.setTargetRooms(...rooms)
		return this
	}
}
