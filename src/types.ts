export type OutgoingData = any

export type IncomingData =
	| Buffer<ArrayBufferLike>
	| ArrayBuffer
	| Buffer<ArrayBufferLike>[]
	| string

export type ExtendedEvents = Record<string, (...params: any[]) => void>

export type NextFunction = () => void | Promise<void>

export type Middleware = (
	ctx: Context,
	next: NextFunction,
) => void | Promise<void>

export interface SocketAdapterEvents {
	close: (code: number, reason: string) => void
	error: (err: Error) => void
	message: (message: IncomingData) => void
}

export interface SocketAdapter {
	send: (message: string) => void
	close: () => void
	terminate: () => void
	on: (
		event: keyof SocketAdapterEvents,
		listener: SocketAdapterEvents[keyof SocketAdapterEvents],
	) => void
}

export interface ServerEvents<ClientEvents extends ExtendedEvents = {}> {
	connection: (socket: Socket<ClientEvents>) => void | Promise<void>
	disconnection: () => void | Promise<void>
	error: (err: Error) => void | Promise<void>
}

export interface Server<
	ClientEvents extends ExtendedEvents = {},
	SEvents extends ExtendedEvents = {},
> {
	on<K extends keyof ServerEvents<ClientEvents>>(
		event: K,
		listener: ServerEvents[K],
	): void | Promise<void>
	emit<K extends keyof SEvents>(
		event: K,
		...params: Parameters<SEvents[K]>
	): void
}

export interface Storage<T> {
	set: (key: string, value: T) => void
	get: (key: string) => T | undefined
	delete: (key: string) => boolean
	has: (key: string) => boolean
	clear: () => void
	list: () => T[]
	keys: () => string[]
	size: () => number
	map: (callback: (value: T, key: string) => void) => void
	entries: () => [string, T][]
}

export interface Parser {
	deserialize: (data: IncomingData) => { event: string; params: any[] }
	serialize: (event: string, ...params: any[]) => string
}

export interface SocketEvents {
	disconnect: (code: number, reason: string) => void
}

export interface Socket<ClientEvents extends ExtendedEvents = {}> {
	id: string
	on<K extends keyof ClientEvents>(event: K, listener: ClientEvents[K]): void
	emit<K extends keyof ClientEvents>(
		event: K,
		...params: Parameters<ClientEvents[K]>
	): void
	on<K extends keyof SocketEvents>(event: K, listener: SocketEvents[K]): void
}

export interface Namespace<
	ClientsEvents extends ExtendedEvents = {},
	NamespaceEvents extends ExtendedEvents = {},
> {
	on<K extends keyof ServerEvents<ClientsEvents>>(
		event: K,
		listener: ServerEvents<ClientsEvents>[K],
	): void | Promise<void>

	emit<K extends keyof NamespaceEvents>(
		event: K,
		...params: Parameters<NamespaceEvents[K]>
	): void
}

export interface Context {
	socket: Socket
}
