import { NamespaceBase } from '~core/namespace-base'
import { StorageBase } from '~core/storage-base'
import type { ExtendedEvents } from '~types'

export class NamespaceManager<
	T extends ExtendedEvents,
	U extends ExtendedEvents,
> {
	private context = {
		storage: new StorageBase<NamespaceBase<T, U>>(),
	}

	getOrCreate<
		ClientEvents extends ExtendedEvents = {},
		NamespaceEvents extends ExtendedEvents = {},
	>(path: string): NamespaceBase<T & ClientEvents, U & NamespaceEvents> {
		let namespace = this.context.storage.get(path) as NamespaceBase<
			T & ClientEvents,
			U & NamespaceEvents
		>

		if (!namespace) {
			namespace = new NamespaceBase<T & ClientEvents, U & NamespaceEvents>()
			this.context.storage.set(path, namespace)
		}

		return namespace
	}

	remove = (path: string): void => {
		this.context.storage.delete(path)
	}

	getAll = (): NamespaceBase<T, U>[] => {
		return this.context.storage.list()
	}
}
