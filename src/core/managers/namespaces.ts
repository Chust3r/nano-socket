import { Namespace } from '~core/namespace'
import type { Parser } from '~core/parser'

export class NamespaceManager {
	private namespaces = new Map<string, Namespace>()

	constructor(
		private readonly parser: Parser,
		private readonly middlewareTimeout?: number,
	) {}

	getOrCreate = (path: string): Namespace => {
		let namespace = this.namespaces.get(path)
		if (!namespace) {
			namespace = new Namespace(this.parser, this.middlewareTimeout)
			this.namespaces.set(path, namespace)
		}
		return namespace
	}

	remove = (name: string): void => {
		this.namespaces.delete(name)
	}
}
