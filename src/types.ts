export type OutgoingData = any

export type IncomingData =
	| Buffer<ArrayBufferLike>
	| ArrayBuffer
	| Buffer<ArrayBufferLike>[]
	| string

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
		listener: SocketAdapterEvents[keyof SocketAdapterEvents]
	) => void
}

export interface ServerEvents {
	connection: () => void | Promise<void>
	disconnect: () => void | Promise<void>
	error: (err: Error) => void | Promise<void>
}

export interface Server {
	on: (
		event: keyof ServerEvents,
		listener: ServerEvents[keyof ServerEvents]
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
	clone: () => Storage<T>
}

export interface Parser {
	deserialize: (data: IncomingData) => { event: string; params: any[] }
	serialize: (event: string, ...params: any[]) => string
}
