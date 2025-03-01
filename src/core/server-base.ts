import { MiddlewaresManager } from '~managers/middlewares'
import { NamespaceManager } from '~managers/namespaces'
import type { ExtendedEvents, Namespace, Server, ServerEvents } from '~types'
import { dependencies } from '~utils/dependencies'
import { EventEmitter } from './event-emitter'

export class ServerBase<T extends ExtendedEvents, U extends ExtendedEvents>
	implements Server<T, U>
{
	protected context = {
		events: new EventEmitter(),
		dependencies: dependencies,
		namespaces: new NamespaceManager<T, U>(),
		middlewares: new MiddlewaresManager(),
	}

	private main: Namespace<T, U>

	constructor() {
		this.main = this.context.namespaces.getOrCreate('/')
	}

	protected run = (path: string, ctx: any, cb: () => void) => {
		this.context.middlewares.run(path, ctx, cb)
	}

	protected getRequestPath = (url?: string, basePath = '/') => {
		if (!url) return basePath

		const relativePath = url.startsWith(basePath)
			? url.substring(basePath.length)
			: url

		return relativePath.startsWith('/') ? relativePath : `/${relativePath}`
	}

	on<K extends keyof ServerEvents<T>>(event: K, listener: ServerEvents<T>[K]) {
		this.context.events.on(event, listener)
		this.main.on(event, listener)
	}

	emit<K extends keyof U>(event: K, ...params: Parameters<U[K]>): void {
		// TODO: emit event
	}

	namespace<
		ClientEvents extends ExtendedEvents,
		NamespaceEvents extends ExtendedEvents,
	>(path: string): Namespace<T & ClientEvents, U & NamespaceEvents> {
		return this.context.namespaces.getOrCreate<
			T & ClientEvents,
			U & NamespaceEvents
		>(path)
	}
}
