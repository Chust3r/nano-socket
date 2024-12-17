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
export type CommonRecivedData = string | Buffer | RawData

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
}

export interface ServerEventMap {
	connection(socket: CommonWebSocket): void | Promise<void>
	disconnect(): void | Promise<void>
	error(err: ExtendedError): void | Promise<void>
}

export interface NanoSocketServer {
	on<K extends keyof ServerEventMap>(event: K, cb: ServerEventMap[K]): void
}

export interface NanoSocketEventMap {
	disconnect: (code: number, reason: string) => void
	error: (err: ExtendedError) => void
}
