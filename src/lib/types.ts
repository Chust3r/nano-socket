import type { RawData } from 'ws'

export interface ExtendedError extends Error {
	code?: number
	timestamp?: string
	context?: string
}

export enum WebSocketReadyState {
	CONNECTING = 0,
	OPEN = 1,
	CLOSING = 2,
	CLOSED = 3,
}

export type CommonSendData = any
export type CommonRecivedData = string | Buffer<ArrayBufferLike> | RawData

export interface CommonEventMap {
	close(code?: number, reason?: any): void
	error(err: ExtendedError): void
	message(data: CommonRecivedData, isBinary?: boolean): void
}

export interface CommonWebSocket {
	readonly readyState: WebSocketReadyState
	send(data: CommonSendData): void
	close(code?: number, reason?: any): void
	terminate(): void
	on<K extends keyof CommonEventMap>(event: K, cb: CommonEventMap[K]): void
}

export interface ServerEventMap {
	connection(socket: Socket): void | Promise<void>
	disconnect(): void | Promise<void>
	error(err: ExtendedError): void | Promise<void>
}

export interface IServer {
	on<K extends keyof ServerEventMap>(event: K, cb: ServerEventMap[K]): void
	emit(event: string, ...args: any[]): void
	use(middleware: Middleware): void
	to(...rooms: string[]): ServerFluent
	exclude(...ids: string[]): ServerFluent
}

export interface SocketEventMap {
	disconnect: (code: number, reason: string) => void
	error: (err: ExtendedError) => void
}

export interface Socket {
	readonly id: string
	readonly rooms: string[]
	send(data: CommonSendData): void
	on<K extends keyof SocketEventMap>(
		event: K,
		callback: SocketEventMap[K]
	): void
	on(event: string, callback: (...args: any[]) => void): void
	once<K extends keyof SocketEventMap>(
		event: K,
		callback: SocketEventMap[K]
	): void
	once(event: string, callback: (...args: any[]) => void): void
	emit(event: string, ...args: any[]): void
	onAny(cb: (event: string, ...args: any[]) => void): void
	join(...rooms: string[]): void
	leave(...rooms: string[]): void
	close(): void
	terminate(): void
	in(...rooms: string[]): boolean
	broadcast: SocketFluent
	to(...rooms: string[]): SocketFluent
	data: Map<string, any>
	request: SocketRequest
}

export interface SocketFluent {
	to(...rooms: string[]): this
	emit(event: string, ...args: any[]): void
}

export type Middleware = (
	socket: Socket,
	next: (err?: ExtendedError) => void
) => void | Promise<void>

export interface ServerFluent {
	exclude(...ids: string[]): this
	to(...rooms: string[]): this
	emit(event: string, ...args: any[]): void
}

export interface AddressInfo {
	address: string
	family: string
	port: number
}

export interface SocketRequest {
	headers: Headers
	url: string
	query: Map<string, string>
	path: string
	auth?: Record<string, string>
	cookies: Map<string, string>
	address: AddressInfo | null
}
