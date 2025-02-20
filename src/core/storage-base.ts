import type { Storage } from '~types'

export class StorageBase<T> implements Storage<T> {
	protected store: Map<string, T>

	constructor(initial?: [string, T][]) {
		this.store = new Map(initial)
	}

	set = (key: string, value: T): void => {
		this.store.set(key, value)
	}

	get = (key: string): T | undefined => {
		return this.store.get(key)
	}

	delete = (key: string): boolean => {
		return this.store.delete(key)
	}

	has = (key: string): boolean => {
		return this.store.has(key)
	}

	clear = (): void => {
		this.store.clear()
	}

	list = (): T[] => {
		return Array.from(this.store.values())
	}

	keys = (): string[] => {
		return Array.from(this.store.keys())
	}

	size = (): number => {
		return this.store.size
	}

	map = (callback: (value: T, key: string) => void): void => {
		this.store.forEach(callback)
	}

	entries = (): [string, T][] => {
		return Array.from(this.store.entries())
	}
}
