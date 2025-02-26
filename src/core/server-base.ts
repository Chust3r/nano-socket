import { MiddlewaresManager } from '~managers/middlewares'
import { NamespaceManager } from '~managers/namespaces'
import type { CustomEvents, Namespace, Server, ServerEvents } from '~types'
import { dependencies } from '~utils/dependencies'
import { EventEmitter } from './event-emitter'

export class ServerBase<T extends CustomEvents> implements Server<T> {
	protected context = {
		events: new EventEmitter(),
		dependencies: dependencies,
		namespaces: new NamespaceManager<T>(),
		middlewares: new MiddlewaresManager(),
	}

	private namespace: Namespace

	constructor() {
		this.namespace = this.context.namespaces.getOrCreate('/')
	}

	protected run = (path: string, ctx: any, cb: () => void) => {
		this.context.middlewares.run(path, ctx, cb)
	}

	on<K extends keyof ServerEvents<T>>(event: K, listener: ServerEvents<T>[K]) {
		this.context.events.on(event, listener)
		this.namespace.on(event, listener)
	}
}
