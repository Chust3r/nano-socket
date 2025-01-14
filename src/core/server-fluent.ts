import type { Parser } from '~core/parser'
import type { ClientsConnectedManager } from '~managers/clients-connected'
import type { RoomManager } from '~managers/rooms'
import type { Fluent } from '~types'

interface ServerFluentIProps {
	parser: Parser
	clients: ClientsConnectedManager
	roomManager: RoomManager
}

export class ServerFluent implements Fluent {
	private excludeIds = new Set<string>()
	private excludeRooms = new Set<string>()
	private targetRooms = new Set<string>()
	private clients: ClientsConnectedManager
	private roomManager: RoomManager
	private parser: Parser

	constructor({ clients, parser, roomManager }: ServerFluentIProps) {
		this.clients = clients
		this.parser = parser
		this.roomManager = roomManager
	}

	private setTargetRooms(...rooms: string[]) {
		for (const room of rooms) {
			this.targetRooms.add(room)
		}
	}

	private getTargetClients() {
		let clients = this.clients.getAllClients().map((client) => client.id)

		if (this.targetRooms.size > 0) {
			clients = this.roomManager.getRoomsMembers(...this.targetRooms)
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

	emit = (event: string, ...args: any[]): void => {
		const msg = this.parser.serialize(event, ...args)
		const clients = this.getTargetClients()

		this.clients.sendToSpecificClients(msg, ...clients)
	}

	exclude = (...args: string[]): this => {
		for (const arg of args) {
			if (this.clients.has(arg)) {
				this.excludeIds.add(arg)
			} else {
				this.excludeRooms.add(arg)
			}
		}
		return this
	}

	to = (...rooms: string[]): this => {
		this.setTargetRooms(...rooms)
		return this
	}
}
