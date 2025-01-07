import { Server as HTTPServer } from 'node:http'
import type { Http2SecureServer, Http2Server } from 'node:http2'
import { Server as HTTPSServer } from 'node:https'
import type { RawData } from 'ws'

export interface ExtendedError extends Error {}

export enum WebSocketReadyState {
	CONNECTING = 0,
	OPEN = 1,
	CLOSING = 2,
	CLOSED = 3,
}

export type OutgoingData = any
export type IncomingData = string | Buffer<ArrayBufferLike> | RawData

export interface SocketAdapterEventMap {
	close(code?: number, reason?: any): void
	error(err: ExtendedError): void
	message(data: IncomingData): void
}

export interface SocketAdapter {
	readonly readyState: WebSocketReadyState
	send(data: OutgoingData): void
	close(code?: number, reason?: any): void
	terminate(): void
	on<K extends keyof SocketAdapterEventMap>(
		event: K,
		cb: SocketAdapterEventMap[K],
	): void
}

export interface ServerEventMap {
	connection(socket: Socket): void | Promise<void>
	disconnect(): void | Promise<void>
	error(err: ExtendedError): void | Promise<void>
}

export interface Server {
	on<K extends keyof ServerEventMap>(event: K, cb: ServerEventMap[K]): void
	emit(event: string, ...args: any[]): void
	use(middleware: Middleware): void
	to(...rooms: string[]): Fluent
	exclude(...ids: string[]): Fluent
}

export interface SocketEventMap {
	disconnect: (code: number, reason: string) => void
	error: (err: ExtendedError) => void
}

export interface Socket {
	readonly id: string
	readonly rooms: string[]
	send(data: OutgoingData): void
	on<K extends keyof SocketEventMap>(
		event: K,
		callback: SocketEventMap[K],
	): void
	on(event: string, callback: (...args: any[]) => void): void
	once<K extends keyof SocketEventMap>(
		event: K,
		callback: SocketEventMap[K],
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
	next: (err?: ExtendedError) => void,
) => void | Promise<void>

export interface Fluent {
	exclude(...ids: string[]): this
	to(...rooms: string[]): this
	emit(event: string, ...args: any[]): void
}

export interface SocketRequest {
	headers: ReadonlyMap<string, string>
	url: string
	query: ReadonlyMap<string, string>
	path: string
	auth: ReadonlyMap<string, string>
	cookies: ReadonlyMap<string, string>
	raw: any
}

export interface Namespace {
	on<K extends keyof ServerEventMap>(event: K, cb: ServerEventMap[K]): void
	use(middleware: Middleware): void
	emit(event: string, ...args: any[]): void
	get rooms(): {
		rooms: string[]
		merge: (target: string, ...rooms: string[]) => void
		getMembers: (room: string) => Socket[]
		move: (member: string, from: string, to: string) => void
		delete: (room: string) => void
		in: (member: string, ...rooms: string[]) => void
		remove: (member: string, ...rooms: string[]) => void
		getCount: (room: string) => number
	}
	get clients(): {
		clients: Socket[]
		count: number
		get: (id: string) => Socket | undefined
		has: (id: string) => boolean
		getExcluding: (...excludedIds: string[]) => Socket[]
	}
	to(...rooms: string[]): Fluent
	exclude(...ids: string[]): Fluent
}

export type NodeServerCompatible =
	| HTTPServer
	| HTTPSServer
	| Http2SecureServer
	| Http2Server

export { HTTPServer, HTTPSServer }

export interface ServerOptions {
	path?: string
	port?: number
	noServer?: boolean
}
