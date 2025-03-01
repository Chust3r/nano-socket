import { MiddlewaresManager } from '~managers/middlewares'
import { NamespaceManager } from '~managers/namespaces'
import type {
	Context,
	ExtendedEvents,
	Namespace,
	Server,
	ServerEvents,
	SocketAdapter,
} from '~types'
import { dependencies } from '~utils/dependencies'
import { SocketClient } from './socket-client'

export class ServerBase<T extends ExtendedEvents, U extends ExtendedEvents>
	implements Server<T, U>
{
	protected context = {
		dependencies: dependencies,
		namespaces: new NamespaceManager<T, U>(),
		middlewares: new MiddlewaresManager(),
	}

	private main: Namespace<T, U>

	constructor() {
		this.main = this.context.namespaces.getOrCreate('/')
	}

	protected run = (path: string, ctx: Context, cb: () => void) => {
		this.context.middlewares.run(path, ctx, cb)
	}

	protected getRequestPath = (url?: string, basePath = '/') => {
		if (!url) return basePath

		const relativePath = url.startsWith(basePath)
			? url.substring(basePath.length)
			: url

		return relativePath.startsWith('/') ? relativePath : `/${relativePath}`
	}

	protected createClient = <Client extends ExtendedEvents>(
		adapter: SocketAdapter,
	) => {
		return new SocketClient<Client>(adapter)
	}

	protected getNamespace = (path: string) => {
		return this.context.namespaces.getOrCreate(path)
	}

	protected createContext = (client: SocketClient<T>): Context => {
		return {
			socket: client,
		}
	}

	on<K extends keyof ServerEvents<T>>(event: K, listener: ServerEvents<T>[K]) {
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
