import { Namespace } from '~core/namespace'

export class NamespaceManager {
	private namespaces: Map<string, Namespace> = new Map<string, Namespace>()

	getOrCreate(path: string): Namespace {
		if (!this.namespaces.has(path)) {
			this.namespaces.set(path, new Namespace())
		}

		return this.namespaces.get(path)!
	}

	remove(name: string): void {
		if (this.namespaces.has(name)) {
			this.namespaces.delete(name)
		} else {
		}
	}
}
