import type { IncomingMessage } from 'node:http'
import { adaptToHttpServer } from 'adapters/node/adapter'
import { WebSocketServer } from 'ws'
import { SocketClient } from '~core/client'
import { ServerBase } from '~core/server'
import type {
	NodeServerCompatible,
	ServerOptions as SO,
	SocketAdapter,
} from '~types'
import { getRequest } from './request'
import { NodeClientAdapter } from './socket'

export type ServerOptions = SO & {
	server?: NodeServerCompatible
}

export class Server extends ServerBase {
	private server?: WebSocketServer
	private options: ServerOptions

	constructor(options: ServerOptions) {
		super(options.middlewareTimeout)
		this.options = this.validateAndNormalizeOptions(options)
		this.server = this.initializeServer()
		this.attachConnectionHandler()
	}

	private validateAndNormalizeOptions = (
		options: ServerOptions,
	): ServerOptions => {
		const { port, server, noServer, path } = options
		const definedOptions = [
			port !== undefined,
			server !== undefined,
			noServer === true,
		]

		if (definedOptions.filter(Boolean).length !== 1) {
			throw new Error(
				'Invalid configuration: Provide exactly one of `port`, `server`, or `noServer`.',
			)
		}

		if (path && !path.startsWith('/')) {
			throw new Error('Invalid path: Path must start with `/`.')
		}

		return {
			path: path || '/',
			port,
			server,
			noServer,
		}
	}

	private initializeServer = (): WebSocketServer => {
		if (this.options.noServer) {
			return new WebSocketServer({ noServer: true })
		}

		if (this.options.port) {
			return new WebSocketServer({ port: this.options.port })
		}

		if (this.options.server) {
			const adaptedServer = adaptToHttpServer(this.options.server)
			return new WebSocketServer({ server: adaptedServer })
		}

		throw new Error('Invalid server configuration.')
	}

	private attachConnectionHandler = (): void => {
		this.server?.on('connection', (socket, req) => {
			const ws = new NodeClientAdapter(socket)
			this.handleConnection(ws, req)
		})
	}

	private handleConnection = (
		ws: SocketAdapter,
		req: IncomingMessage,
	): void => {
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
			request: getRequest(req),
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

	handleUpgrade = (req: IncomingMessage, socket: any, head: Buffer): void => {
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
				`WebSocket upgrade failed: To use the 'handleUpgrade' method, you must initialize the server with the 'noServer' option.`,
			)
		}
	}
}

export default Server
