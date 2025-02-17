export type OutgoingData = any

export type IncomingData =
	| Buffer<ArrayBufferLike>
	| ArrayBuffer
	| Buffer<ArrayBufferLike>[]

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

export interface ServerEvents {
	connection: () => void | Promise<void>
	disconnect: () => void | Promise<void>
	error: (err: Error) => void | Promise<void>
}

export interface Server {
	on: (
		event: keyof ServerEvents,
		listener: ServerEvents[keyof ServerEvents],
	) => void
}
