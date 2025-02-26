import type { SocketClient } from '~core/socket-client'
import { StorageBase } from '~core/storage-base'
import type { CustomEvents } from '~types'

export class SocketsManager<T extends CustomEvents> {
	private storage = new StorageBase<SocketClient<T>>()

	add(socket: SocketClient<T>): void {
		this.storage.set(socket.id, socket)
	}

	remove(id: string): void {
		this.storage.delete(id)
	}

	get(id: string): SocketClient<T> | undefined {
		return this.storage.get(id)
	}

	has(id: string): boolean {
		return this.storage.has(id)
	}

	getAll(): SocketClient<T>[] {
		return [...this.storage.list()]
	}

	count(): number {
		return this.storage.size()
	}

	exclude(...excludedIds: string[]): SocketClient<T>[] {
		return this.getAll().filter((client) => !excludedIds.includes(client.id))
	}

	map(callback: (value: SocketClient<T>, key: string) => void): void {
		this.storage.map(callback)
	}
}
