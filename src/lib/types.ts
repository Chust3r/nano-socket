import type { RawData } from 'ws'

interface ExtendedError extends Error {
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
	readonly url: string
	readonly protocol: string
	readonly bufferedAmount: number
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
}

export interface SocketEventMap {
	disconnect: (code: number, reason: string) => void
	error: (err: ExtendedError) => void
}

export interface Socket {
	readonly id: string
	send(data: any): void
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
}
