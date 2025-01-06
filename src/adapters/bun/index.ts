import type { Server as BunServer, ServerWebSocket } from 'bun'
import { SocketClient } from '~core/client'
import { Server } from '~core/server'
import { getBunRequest } from '~lib/request'
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

interface InternalServerOptions {
	port: number
	path: string
}

export class BunServerServer extends Server {
	private options: Partial<InternalServerOptions> = {}

	constructor(srv: number, opts?: Partial<ServerOptions>)
	constructor(srv?: Partial<ServerOptions>, opts?: never)
	constructor(
		srv?: number | Partial<ServerOptions>,
		opts?: Partial<ServerOptions>,
	) {
		super()

		if (typeof srv === 'number') {
			this.options = { ...opts, path: opts?.path }
			this.options.port = srv

			Bun.serve<WebSocketData>({
				fetch: (request: Request, server: BunServer) => {
					if (request.headers.get('upgrade') === 'websocket') {
						return this.handleUpgrade(request, server)
					}
					return undefined
				},
				websocket: this.websocket,
				port: this.options.port ?? 3000,
			})
		} else if (srv instanceof Object && !Array.isArray(srv) && !opts) {
			this.options = srv as ServerOptions
		} else if (srv instanceof Object && opts) {
			throw new Error('Invalid Server Options')
		} else {
			Bun.serve<WebSocketData>({
				fetch: (request: Request, server: BunServer) => {
					if (request.headers.get('upgrade') === 'websocket') {
						return this.handleUpgrade(request, server)
					}
					return undefined
				},
				websocket: this.websocket,
				port: this.options.port,
			})
		}
	}

	private open(ws: ServerWebSocket<WebSocketData>) {
		const bunWS = new BunClientAdapter(ws)
		ws.data.adapter = bunWS
		const req = getBunRequest(ws.data.req, ws.data.server)
		this.handleConnection(bunWS, req)
	}

	private message(
		ws: ServerWebSocket<WebSocketData>,
		message: IncomingData,
	): void {
		const bunWS = ws.data.adapter
		if (bunWS) {
			bunWS.emit('message', message)
		}
	}

	private close(
		ws: ServerWebSocket<WebSocketData>,
		code: number,
		reason: string,
	): void {
		const bunWS = ws.data.adapter
		if (bunWS) {
			bunWS.emit('close', code, reason)
		}
	}

	private handleConnection(ws: SocketAdapter, req: SocketRequest): void {
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
				reason: string,
			) => this.close(ws, code, reason),
		}
	}

	handleUpgrade(request: Request, server: BunServer): void {
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

export { BunServerServer as Server }
