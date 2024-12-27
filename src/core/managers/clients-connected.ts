import type { Socket } from '~types'

export class ClientsConnectedManager {
	private clients: Map<string, Socket> = new Map()

	add(socket: Socket): void {
		this.clients.set(socket.id, socket)
	}

	remove(id: string): void {
		this.clients.delete(id)
	}

	get(id: string): Socket | undefined {
		return this.clients.get(id)
	}

	has(id: string): boolean {
		return this.clients.has(id)
	}

	getAllClients(): Socket[] {
		return Array.from(this.clients.values())
	}

	getTotalClients(): number {
		return this.clients.size
	}

	getClientsExcluding(...excludedIds: string[]): Socket[] {
		const excludedSet = new Set(excludedIds)
		return Array.from(this.clients.values()).filter(
			(client) => !excludedSet.has(client.id),
		)
	}

	broadcast(message: any): void {
		for (const client of this.clients.values()) {
			client.send(message)
		}
	}

	broadcastExcluding(message: any, ...excludedIds: string[]): void {
		const excludedSet = new Set(excludedIds)

		for (const client of this.clients.values()) {
			if (!excludedSet.has(client.id)) {
				client.send(message)
			}
		}
	}

	sendToSpecificClients(message: any, ...ids: string[]): void {
		for (const id of ids) {
			const client = this.clients.get(id)
			client?.send(message)
		}
	}
}
