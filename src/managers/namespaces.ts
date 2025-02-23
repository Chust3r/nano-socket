import { NamespaceBase } from '~core/namespace-base'
import { StorageBase } from '~core/storage-base'
import type { CustomEvents } from '~types'

export class NamespaceManager<T extends CustomEvents> {
	private context = {
		storage: new StorageBase<NamespaceBase<T>>(),
	}

	getOrCreate = (path: string): NamespaceBase<T> => {
		let namespace = this.context.storage.get(path)

		if (!namespace) {
			namespace = new NamespaceBase<T>()
			this.context.storage.set(path, namespace)
		}

		return namespace
	}

	remove = (path: string): void => {
		this.context.storage.delete(path)
	}

	getAll = (): NamespaceBase<T>[] => {
		return this.context.storage.list()
	}
}
