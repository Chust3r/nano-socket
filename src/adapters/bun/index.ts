import {
	CommonRecivedData,
	CommonWebSocket,
	ExtendedError,
	ServerOptions,
	SocketRequest,
} from '~types'
import { BunClientAdapter } from './socket'
import { Server } from '~core/server'
import { SocketClient } from '~core/client'
import { getBunRequest } from '~lib/request'
import { Server as BunServer, ServerWebSocket } from 'bun'

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
		opts?: Partial<ServerOptions>
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
		} else if (srv instanceof Object && !(srv instanceof Array) && !opts) {
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
		const req = getBunRequest(ws.data.req, ws.data.server)
		this.handleConnection(bunWS, req)
	}

	private message(
		ws: ServerWebSocket<WebSocketData>,
		message: CommonRecivedData
	): void {
		const bunWS = ws.data.adapter
		if (bunWS) {
			bunWS.emit('message', message)
		}
	}

	private close(
		ws: ServerWebSocket<WebSocketData>,
		code: number,
		reason: string
	): void {
		const bunWS = ws.data.adapter
		if (bunWS) {
			bunWS.emit('close', code, reason)
		}
	}

	private handleConnection(ws: CommonWebSocket, req: SocketRequest): void {
		const path = req.url?.replace(this.options.path || '', '') || '/'
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
			message: (
				ws: ServerWebSocket<WebSocketData>,
				message: CommonRecivedData
			) => this.message(ws, message),
			close: (
				ws: ServerWebSocket<WebSocketData>,
				code: number,
				reason: string
			) => this.close(ws, code, reason),
		}
	}

	handleUpgrade(request: Request, server: BunServer): void {
		server.upgrade(request, {
			data: {
				req: request,
				server,
			} as WebSocketData,
		})
	}
}

export { BunServerServer as Server }
