import type { Storage } from '~types'

export class StorageBase<T> implements Storage<T> {
	protected store: Map<string, T>

	constructor(initial?: [string, T][]) {
		this.store = new Map(initial)
	}

	set = (key: string, value: T): void => {
		this.store.set(key, value)
	}

	get = (key: string): T | undefined => this.store.get(key)

	delete = (key: string): boolean => this.store.delete(key)

	has = (key: string): boolean => this.store.has(key)

	clear = (): void => {
		this.store.clear()
	}

	list = (): T[] => Array.from(this.store.values())

	keys = (): string[] => Array.from(this.store.keys())

	size = (): number => this.store.size

	map = (callback: (value: T, key: string) => void): void => {
		this.store.forEach((value, key) => callback(value, key))
	}

	entries = (): [string, T][] => Array.from(this.store.entries())

	clone = (): StorageBase<T> => new StorageBase(this.entries())
}
