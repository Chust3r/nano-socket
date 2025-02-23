import { NamespaceManager } from '~managers/namespaces'
import type { CustomEvents, Namespace, Server, ServerEvents } from '~types'
import { dependencies } from '~utils/dependencies'
import { EventEmitter } from './event-emitter'

export class ServerBase<T extends CustomEvents> implements Server<T> {
	protected context = {
		events: new EventEmitter(),
		dependencies: dependencies,
		namespaces: new NamespaceManager<T>(),
	}

	private namespace: Namespace

	constructor() {
		this.namespace = this.context.namespaces.getOrCreate('/')
	}

	on<K extends keyof ServerEvents<T>>(event: K, listener: ServerEvents<T>[K]) {
		this.context.events.on(event, listener)
		this.namespace.on(event, listener)
	}
}
