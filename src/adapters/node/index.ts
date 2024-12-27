import type { IncomingMessage } from 'node:http'
import { WebSocketServer } from 'ws'
import type {
	CommonWebSocket,
	ServerOptions,
	NodeServerCompatible,
} from '~types'
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

class NodeServerServer extends Server {
	private server?: WebSocketServer
	private options: Partial<InternalServerOptions> = {}

	constructor(opts?: Partial<ServerOptions>)
	constructor(srv: number, opts?: Partial<ServerOptions>)
	constructor(srv: NodeServerCompatible, opts?: Partial<ServerOptions>)
	constructor(
		srv?: NodeServerCompatible | number | Partial<ServerOptions>,
		opts?: Partial<ServerOptions>,
	) {
		super()

		if (!srv) {
			this.options.noServer = true
			this.options = { ...this.options, ...opts }
		} else if (typeof srv === 'number') {
			this.options.port = srv
			this.options = { ...this.options, ...opts }
		} else if (srv && typeof srv === 'object' && 'listen' in srv) {
			this.options.server = srv as NodeServerCompatible
			this.options = { ...this.options, ...opts }
		} else if (srv && typeof srv === 'object') {
			this.options.noServer = true
			this.options = { ...this.options, ...srv }
		}

		if (this.options.port && this.options.server) {
			throw new Error('Cannot specify both a port and a server.')
		}
		if (!this.options.port && !this.options.server && !this.options.noServer) {
			throw new Error(
				'Invalid configuration: Provide a port, server, or noServer option.',
			)
		}

		const { noServer, port, server, path = '/', ...options } = this.options
		if (this.options.noServer) {
			this.server = new WebSocketServer({
				noServer: true,
				...options,
			})
		} else if (this.options.port) {
			this.server = new WebSocketServer({
				port: this.options.port,
				...options,
			})
		} else if (this.options.server) {
			const adaptedServer = adaptToHttpServer(this.options.server)
			this.server = new WebSocketServer({
				server: adaptedServer,
				...options,
			})
		} else {
			throw new Error('Invalid server configuration.')
		}

		this.server.on('connection', (socket, req) => {
			const ws = new NodeClientAdapter(socket)
			this.handleConnection(ws, req)
		})
	}

	private handleConnection(ws: CommonWebSocket, req: IncomingMessage): void {
		const basePath = this.options.path || '/'
		if (req.url && !req.url.startsWith(basePath)) {
			ws.terminate()
			return
		}

		const relativePath = req.url?.substring(basePath.length) || '/'
		const path = relativePath.startsWith('/')
			? relativePath
			: `/${relativePath}`

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
		const basePath = this.options.path || '/'
		if (req.url && !req.url.startsWith(basePath)) {
			socket.destroy()
			return
		}

		if (this.options.noServer) {
			this.server?.handleUpgrade(req, socket, head, (ws) => {
				const wsClient = new NodeClientAdapter(ws)
				this.handleConnection(wsClient, req)
			})
		} else {
			throw new Error(
				`WebSocket upgrade failed: To use the 'handleUpgrade' method, you must initialize the server without specifying a port or HTTP server directly. Pass only the configuration object (e.g. { path: 'yourPath' }) to activate the "noServer" option.`,
			)
		}
	}
}

export { NodeServerServer as Server }
