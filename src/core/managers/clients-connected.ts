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

	getClientsExcluding(...ids: string[]): Socket[] {
		const excludedSet = new Set(ids)
		return Array.from(this.clients.values()).filter(
			(client) => !excludedSet.has(client.id)
		)
	}

	getTotalClients(): number {
		return this.clients.size
	}
}
