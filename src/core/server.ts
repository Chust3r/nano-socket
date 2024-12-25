import { Parser } from '~core/parser'
import {
	Server as CommonServer,
	Middleware,
	ServerEventMap,
	ServerFluent,
} from '~lib/types'
import { NamespaceManager } from './managers/namespaces'
import { Namespace } from './namespace'

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

	to(...rooms: string[]): ServerFluent {
		return this.currentNamespace.to(...rooms)
	}

	exclude(...ids: string[]): ServerFluent {
		return this.currentNamespace.exclude(...ids)
	}

	namespace(path: string): Namespace {
		this.currentNamespace = this.namespaceManager.getOrCreate(path)
		return this.currentNamespace
	}
}
