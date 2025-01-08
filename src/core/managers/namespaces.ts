import { Namespace } from '~core/namespace'
import type { Parser } from '~core/parser'

export class NamespaceManager {
	private namespaces: Map<string, Namespace> = new Map<string, Namespace>()

	constructor(
		private parser: Parser,
		private middlewareTimeout?: number,
	) {}

	getOrCreate(path: string): Namespace {
		let namespace = this.namespaces.get(path)
		if (!namespace) {
			namespace = new Namespace(this.parser, this.middlewareTimeout)
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
