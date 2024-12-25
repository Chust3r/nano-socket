import { IncomingMessage } from 'node:http'
import { WebSocketServer } from 'ws'
import { CommonWebSocket, ServerOptions, NodeServerCompatible } from '~types'
import { NodeClientAdapter } from './socket'
import { Server } from '~core/server'
import { SocketClient } from '~core/client'
import { getNodeRequest } from '~lib/request'
import { adaptToHttpServer } from '~lib/adapter'

interface InternalServerOptions {
	port: number
	path: string
	server: NodeServerCompatible
	noServer: boolean
}

class NodeServer extends Server {
	private server?: WebSocketServer
	private options: Partial<InternalServerOptions> = {}

	constructor(
		srv?: NodeServerCompatible | number | Partial<ServerOptions>,
		opts?: Partial<ServerOptions>
	) {
		super()

		if (typeof srv === 'number') {
			this.options.port = srv
		} else if (srv instanceof Object && !(srv instanceof Array) && !opts) {
			this.options = srv as Partial<ServerOptions>
			this.options.noServer = true
		} else if (srv instanceof Object && opts) {
			this.options.server = srv as NodeServerCompatible
			this.options.path = opts.path
			this.options.noServer = false
		} else if (!srv && !opts) {
			this.options.noServer = true
		}

		if (this.options.noServer) {
			this.server = new WebSocketServer({
				noServer: true,
				path: this.options.path,
			})
		} else {
			const adaptedServer = this.options.server
				? adaptToHttpServer(this.options.server)
				: undefined

			this.server = new WebSocketServer({
				port: this.options.port,
				path: this.options.path,
				server: adaptedServer || undefined,
			})
		}

		this.server.on('connection', (socket, req) => {
			const ws = new NodeClientAdapter(socket)
			this.handleConnection(ws, req)
		})
	}

	private handleConnection(ws: CommonWebSocket, req: IncomingMessage): void {
		const path = req.url?.replace(this.options.path || '', '') || '/'
		const namespace = this.namespaceManager.getOrCreate(path)

		const socket = new SocketClient({
			ws,
			parser: this.parser,
			clients: namespace.clientManager,
			roomManager: namespace.roomManager,
			request: getNodeRequest(req),
		})

		namespace.middlewareManager.run(socket, (err) => {
			if (err) {
				socket.terminate()
				return
			}
			namespace.clientManager.add(socket)
			namespace.eventManager.emit('connection', socket)
		})
	}

	handleUpgrade(req: IncomingMessage, socket: any, head: Buffer): void {
		if (this.options.noServer) {
			this.server?.handleUpgrade(req, socket, head, (ws) => {
				const wsClient = new NodeClientAdapter(ws)
				this.handleConnection(wsClient, req)
			})
		} else {
			throw new Error(
				`WebSocket upgrade failed: To use the 'handleUpgrade' method, you must initialize the server without specifying a port or HTTP server directly. Pass only the configuration object (e.g. { path: 'yourPath' }) to activate the "noServer" option.`
			)
		}
	}
}

export { NodeServer as Server }
