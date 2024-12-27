import { Namespace } from '~core/namespace'

export class NamespaceManager {
	private namespaces: Map<string, Namespace> = new Map<string, Namespace>()

	getOrCreate(path: string): Namespace {
		let namespace = this.namespaces.get(path)
		if (!namespace) {
			namespace = new Namespace()
			this.namespaces.set(path, namespace)
		}
		return namespace
	}

	remove(name: string): void {
		if (this.namespaces.has(name)) {
			this.namespaces.delete(name)
		}
	}
}
