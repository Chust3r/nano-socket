import type { Server as BunServer, ServerWebSocket } from 'bun'
import { SocketClient } from '~core/client'
import { ServerBase } from '~core/server'
import { getRequest } from './request'
import type {
	ExtendedError,
	IncomingData,
	ServerOptions,
	SocketAdapter,
	SocketRequest,
} from '~types'
import { BunClientAdapter } from './socket'

type WebSocketData = {
	adapter: BunClientAdapter
	req: Request
	server: BunServer
}

type BunServerOptions = ServerOptions

export class Server extends ServerBase {
	private options: BunServerOptions
	private isServerCreated = false

	constructor(options: BunServerOptions) {
		super()

		this.options = this.validateAndNormalizeOptions(options)

		if (!this.options.noServer) {
			Bun.serve<WebSocketData>({
				fetch: (request: Request, server: BunServer) =>
					request.headers.get('upgrade') === 'websocket'
						? this.handleUpgrade(request, server)
						: undefined,
				websocket: this.websocket,
				port: this.options.port,
			})
			this.isServerCreated = true
		}
	}

	private validateAndNormalizeOptions = (
		options: BunServerOptions
	): BunServerOptions => {
		const { port, noServer } = options
		const definedOptions = [port !== undefined, noServer === true]

		if (definedOptions.filter(Boolean).length !== 1) {
			throw new Error(
				'Invalid configuration: Provide exactly one of `port` or `noServer`.'
			)
		}

		if (port && port <= 0) {
			throw new Error('Invalid port: Port must be a positive number.')
		}

		return options
	}

	private open = (ws: ServerWebSocket<WebSocketData>) => {
		const bunWS = new BunClientAdapter(ws)
		ws.data.adapter = bunWS
		const req = getRequest(ws.data.req, ws.data.server)
		this.handleConnection(bunWS, req)
	}

	private message = (
		ws: ServerWebSocket<WebSocketData>,
		message: IncomingData
	): void => {
		const bunWS = ws.data.adapter
		if (bunWS) {
			bunWS.emit('message', message)
		}
	}

	private close = (
		ws: ServerWebSocket<WebSocketData>,
		code: number,
		reason: string
	): void => {
		const bunWS = ws.data.adapter
		if (bunWS) {
			bunWS.emit('close', code, reason)
		}
	}

	private handleConnection = (ws: SocketAdapter, req: SocketRequest): void => {
		const basePath = this.options.path || '/'

		if (req.path && !req.path.startsWith(basePath)) {
			ws.terminate()
			return
		}

		const relativePath = req.path.substring(basePath.length) || '/'
		const path = relativePath.startsWith('/')
			? relativePath
			: `/${relativePath}`

		const namespace = this.namespaceManager.getOrCreate(path)

		const socket = new SocketClient({
			ws,
			parser: this.parser,
			clients: namespace.clientManager,
			roomManager: namespace.roomManager,
			request: req,
		})

		namespace.middlewareManager.run(socket, (err?: ExtendedError) => {
			if (err) {
				socket.terminate()
				return
			}
			namespace.clientManager.add(socket)
			namespace.eventManager.emit('connection', socket)
		})
	}

	get websocket() {
		return {
			open: (ws: ServerWebSocket<WebSocketData>) => this.open(ws),
			message: (ws: ServerWebSocket<WebSocketData>, message: IncomingData) =>
				this.message(ws, message),
			close: (
				ws: ServerWebSocket<WebSocketData>,
				code: number,
				reason: string
			) => this.close(ws, code, reason),
		}
	}

	handleUpgrade = (request: Request, server: BunServer): void => {
		if (!this.isServerCreated) {
			const basePath = this.options.path || '/'
			const url = new URL(request.url)
			const path = url.pathname
			if (!path.startsWith(basePath)) return

			server.upgrade(request, {
				data: {
					req: request,
					server,
				} as WebSocketData,
			})
		}
	}
}

export default Server

export type { BunServerOptions as ServerOptions }
