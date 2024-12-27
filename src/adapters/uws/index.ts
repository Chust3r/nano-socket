import type {
	CommonRecivedData,
	CommonWebSocket,
	ExtendedError,
	ServerOptions,
	SocketRequest,
} from '~types'
import { UWSClientAdapter } from './socket'
import { Server as BaseServer } from '~core/server'
import { SocketClient } from '~core/client'
import { App } from 'uWebSockets.js'
import type {
	HttpRequest,
	HttpResponse,
	us_socket_context_t,
	WebSocket,
} from 'uWebSockets.js'
import { getuWSRequest } from '~lib/request'

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
		const path = req.path
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

		if (this.options.path && !request.path?.startsWith(this.options.path)) {
			res.writeStatus('404 Not Found').end()
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

	private get websockets() {
		return {
			open: (ws: WebSocket<WebSocketData>) =>
				this.open(ws, ws.getUserData().req),
			message: (ws: WebSocket<WebSocketData>, message: CommonRecivedData) =>
				this.message(ws, message),
			close: (ws: WebSocket<WebSocketData>, code: number, reason: string) =>
				this.close(ws, code, reason),
			upgrade: (
				res: HttpResponse,
				req: HttpRequest,
				context: us_socket_context_t,
			) => this.handleUpgrade(res, req, context),
		}
	}
}

export { UWSServer as Server }
