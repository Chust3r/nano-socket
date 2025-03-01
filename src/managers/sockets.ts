import { StorageBase } from '~core/storage-base'
import type { ExtendedEvents, Socket } from '~types'

export class SocketsManager<T extends ExtendedEvents> {
	private storage = new StorageBase<Socket<T>>()

	add(socket: Socket<T>): void {
		this.storage.set(socket.id, socket)
	}

	remove(id: string): void {
		this.storage.delete(id)
	}

	get(id: string): Socket<T> | undefined {
		return this.storage.get(id)
	}

	has(id: string): boolean {
		return this.storage.has(id)
	}

	getAll(): Socket<T>[] {
		return [...this.storage.list()]
	}

	count(): number {
		return this.storage.size()
	}

	exclude(...excludedIds: string[]): Socket<T>[] {
		return this.getAll().filter((client) => !excludedIds.includes(client.id))
	}

	map(callback: (value: Socket<T>, key: string) => void): void {
		this.storage.map(callback)
	}
}
