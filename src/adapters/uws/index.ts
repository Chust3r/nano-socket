import { App } from 'uWebSockets.js'
import type {
	HttpRequest,
	HttpResponse,
	WebSocket,
	us_socket_context_t,
} from 'uWebSockets.js'
import { SocketClient } from '~core/client'
import { Server as BaseServer } from '~core/server'
import { getuWSRequest } from '~lib/request'
import type {
	CommonRecivedData,
	CommonWebSocket,
	ExtendedError,
	ServerOptions,
	SocketRequest,
} from '~types'
import { UWSClientAdapter } from './socket'

type WebSocketData = {
	adapter: UWSClientAdapter
	req: SocketRequest
}

interface InternalServerOptions {
	port: number
	path: string
}

export class UWSServer extends BaseServer {
	private options: Partial<InternalServerOptions> = {
		path: '/',
	}
	private app = App()

	constructor(port: number, opts?: Partial<ServerOptions>) {
		super()

		this.options = {
			...opts,
			port,
			path: opts?.path || '/',
		}

		this.initializeServer()
	}

	private initializeServer() {
		this.app.ws('/*', {
			open: (ws: WebSocket<WebSocketData>) => {
				this.open(ws, ws.getUserData().req)
			},
			message: (ws: WebSocket<WebSocketData>, message: ArrayBuffer) =>
				this.message(ws, Buffer.from(message).toString()),
			close: (
				ws: WebSocket<WebSocketData>,
				code: number,
				message: ArrayBuffer,
			) => this.close(ws, code, Buffer.from(message).toString()),
			upgrade: this.handleUpgrade,
		})

		this.app.listen(this.options.port ?? 3000, (t) => {
			if (!t) throw new Error('Failed to start server')
		})
	}

	private open(ws: WebSocket<WebSocketData>, req: SocketRequest) {
		const uwsAdapter = new UWSClientAdapter(ws)
		ws.getUserData = () => ({ adapter: uwsAdapter, req })
		this.handleConnection(uwsAdapter, req)
	}

	private message(
		ws: WebSocket<WebSocketData>,
		message: CommonRecivedData,
	): void {
		const uwsAdapter = ws.getUserData().adapter
		if (uwsAdapter) {
			uwsAdapter.emit('message', message)
		}
	}

	private close(
		ws: WebSocket<WebSocketData>,
		code: number,
		reason: string,
	): void {
		const uwsAdapter = ws.getUserData().adapter
		if (uwsAdapter) {
			uwsAdapter.emit('close', code, reason)
		}
	}

	private handleConnection(ws: CommonWebSocket, req: SocketRequest): void {
		const basePath = this.options.path || '/'

		if (req.path && !req.path.startsWith(basePath)) {
			ws.terminate()
			return
		}

		const relativePath = req.path?.substring(basePath.length) || '/'
		const path = relativePath.startsWith('/')
			? relativePath
			: `/${relativePath}`

		if (!path.startsWith('/')) {
			ws.terminate()
			return
		}

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

	private handleUpgrade = (
		res: HttpResponse,
		req: HttpRequest,
		context: us_socket_context_t,
	) => {
		const secWebSocketKey = req.getHeader('sec-websocket-key')
		const secWebSocketProtocol = req.getHeader('sec-websocket-protocol') || ''
		const secWebSocketExtensions =
			req.getHeader('sec-websocket-extensions') || ''

		const request = getuWSRequest(req)
		const basePath = this.options.path || '/'

		if (req.getUrl() && !req.getUrl().startsWith(basePath)) {
			res.end()
			return
		}

		res.upgrade(
			{ req: request } as WebSocketData,
			secWebSocketKey,
			secWebSocketProtocol,
			secWebSocketExtensions,
			context,
		)
	}
}

export { UWSServer as Server }
