import type { RawData } from 'ws'

interface ExtendedError extends Error {
	code: number
	timestamp: string
	context: string
}

type CommonSendData = string | Blob | ArrayBufferLike
type CommonRecivedData = string | Buffer | RawData

interface CommonEventMap {
	connection(): void
	close(code?: number, reason?: string): void
	error(err: ExtendedError): void
	message(data: CommonRecivedData, isBinary?: boolean): void
}

export interface CommonWebSocket {
	readonly readyState: number
	readonly url: string
	readonly protocol: string
	readonly bufferedAmount: number
	send(data: CommonSendData): void
	close(code?: number, reason?: string): void
	terminate(): void
	on<K extends keyof CommonEventMap>(event: K, cb: CommonEventMap[K]): void
}
