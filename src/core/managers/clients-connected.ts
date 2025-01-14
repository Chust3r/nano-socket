import type { Socket } from '~types'

export class ClientsConnectedManager {
	private clients = new Map<string, Socket>()

	add = (socket: Socket): void => {
		this.clients.set(socket.id, socket)
	}

	remove = (id: string): void => {
		this.clients.delete(id)
	}

	get = (id: string): Socket | undefined => this.clients.get(id)

	has = (id: string): boolean => this.clients.has(id)

	getAllClients = (): Socket[] => [...this.clients.values()]

	getTotalClients = (): number => this.clients.size

	getClientsExcluding = (...excludedIds: string[]): Socket[] => {
		const excludedSet = new Set(excludedIds)
		const result: Socket[] = []
		for (const client of this.clients.values()) {
			if (!excludedSet.has(client.id)) result.push(client)
		}
		return result
	}

	broadcast = (message: any): void => {
		for (const client of this.clients.values()) {
			client.send(message)
		}
	}

	broadcastExcluding = (message: any, ...excludedIds: string[]): void => {
		const excludedSet = new Set(excludedIds)
		for (const client of this.clients.values()) {
			if (!excludedSet.has(client.id)) {
				client.send(message)
			}
		}
	}

	sendToSpecificClients = (message: any, ...ids: string[]): void => {
		for (const id of ids) {
			const client = this.clients.get(id)
			client?.send(message)
		}
	}
}
