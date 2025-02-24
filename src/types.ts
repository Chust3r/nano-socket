export type OutgoingData = any

export type IncomingData =
	| Buffer<ArrayBufferLike>
	| ArrayBuffer
	| Buffer<ArrayBufferLike>[]
	| string

export type CustomEvents = Record<string, (...params: any[]) => void>

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

export interface ServerEvents<T extends CustomEvents = {}> {
	connection: (socket: Socket<T>) => void | Promise<void>
	disconnection: () => void | Promise<void>
	error: (err: Error) => void | Promise<void>
}

export interface Server<T extends CustomEvents = {}> {
	on: (
		event: keyof ServerEvents<T>,
		listener: ServerEvents<T>[keyof ServerEvents<T>],
	) => void | Promise<void>
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

export interface SocketEvents {
	disconnect: (code: number, reason: string) => void
}

export interface Socket<T extends CustomEvents = {}> {
	id: string
	on<K extends keyof T>(event: K, listener: T[K]): void
	emit<K extends keyof T>(event: K, ...params: Parameters<T[K]>): void
	on<K extends keyof SocketEvents>(event: K, listener: SocketEvents[K]): void
}

export interface Namespace<T extends CustomEvents = {}> {
	on: (
		event: keyof ServerEvents<T>,
		listener: ServerEvents<T>[keyof ServerEvents<T>],
	) => void | Promise<void>
}

export interface Context {
	socket: Socket<any>
	url: string
}
