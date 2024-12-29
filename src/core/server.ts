import { NamespaceManager } from '~core/managers/namespaces'
import { Parser } from '~core/parser'
import type {
	Server as CommonServer,
	Fluent,
	Middleware,
	Namespace,
	ServerEventMap,
} from '~types'

export class Server implements CommonServer {
	protected parser: Parser
	protected namespaceManager: NamespaceManager
	protected currentNamespace: Namespace

	constructor() {
		this.parser = new Parser()
		this.namespaceManager = new NamespaceManager()
		this.currentNamespace = this.namespaceManager.getOrCreate('/')
	}

	get rooms() {
		return this.currentNamespace.rooms
	}

	get clients() {
		return this.currentNamespace.clients
	}

	on<K extends keyof ServerEventMap>(event: K, cb: ServerEventMap[K]): void {
		this.currentNamespace.on(event, cb)
	}

	use(middleware: Middleware): void {
		this.currentNamespace.use(middleware)
	}

	emit(event: string, ...args: any[]): void {
		this.currentNamespace.emit(event, ...args)
	}

	to(...rooms: string[]): Fluent {
		return this.currentNamespace.to(...rooms)
	}

	exclude(...ids: string[]): Fluent {
		return this.currentNamespace.exclude(...ids)
	}

	namespace(path: string): Namespace {
		this.currentNamespace = this.namespaceManager.getOrCreate(path)
		return this.currentNamespace
	}
}
