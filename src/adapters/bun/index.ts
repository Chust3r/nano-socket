import type { Server as BunServer, ServerWebSocket } from 'bun'
import { SocketClient } from '~core/client'
import { ServerBase } from '~core/server'
import type {
	ExtendedError,
	IncomingData,
	ServerOptions as SO,
	SocketAdapter,
	SocketRequest,
} from '~types'
import { getRequest } from './request'
import { BunClientAdapter } from './socket'

type WebSocketData = {
	adapter: BunClientAdapter
	req: Request
	server: BunServer
}

export type ServerOptions = SO & {
	fetch?: (req: Request) => void
}

export class Server extends ServerBase {
	constructor(private options: ServerOptions) {
		super(options.middlewareTimeout)

		this.options = this.validateAndNormalizeOptions(options)

		if (!this.options.noServer) {
			Bun.serve<WebSocketData>({
				fetch: (request: Request, server: BunServer) => {
					if (request.headers.get('upgrade') === 'websocket') {
						return this.handleUpgrade(request, server)
					}

					if (this.options.fetch) {
						return this.options.fetch(request)
					}
				},
				websocket: this.websocket,
				port: this.options.port,
			})
		}
	}

	private validateAndNormalizeOptions = (
		options: ServerOptions,
	): ServerOptions => {
		const { port, noServer, fetch } = options

		if (fetch && noServer) {
			throw new Error(
				'Invalid configuration: Cannot provide both `fetch` and `noServer`.',
			)
		}

		if (noServer && (port || fetch)) {
			throw new Error(
				'Invalid configuration: Cannot provide `port` or `fetch` when `noServer` is true.',
			)
		}

		if (fetch && !port) {
			options.port = 3000
		}

		if (!noServer && !port && !fetch) {
			throw new Error(
				'Invalid configuration: A `port` must be provided if `noServer` is false and `fetch` is not provided.',
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
		message: IncomingData,
	): void => {
		const bunWS = ws.data.adapter
		if (bunWS) {
			bunWS.emit('message', message)
		}
	}

	private close = (
		ws: ServerWebSocket<WebSocketData>,
		code: number,
		reason: string,
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
				socket.close()
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
				reason: string,
			) => this.close(ws, code, reason),
		}
	}

	handleUpgrade = (request: Request, server: BunServer): void => {
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

export default Server
