import { IncomingMessage, Server as HTTPServer } from 'node:http'
import { Server as HTTPSServer } from 'https'
import { Http2SecureServer, Http2Server } from 'http2'
import { WebSocketServer } from 'ws'
import { CommonWebSocket } from '~types'
import { NodeClientAdapter } from './socket'
import { CommonServer } from '~core/server'
import { SocketClient } from '~core/client'
import { getNodeRequest } from '~lib/request'

export interface ServerOptions {
	path?: string
}

type TServerInstance =
	| HTTPServer
	| HTTPSServer
	| Http2SecureServer
	| Http2Server

function adaptToHttpServer(server: TServerInstance): HTTPServer | HTTPSServer {
	if ('setTimeout' in server) {
		return server as HTTPServer | HTTPSServer
	}

	if ('stream' in server) {
		return server as unknown as HTTPServer
	}

	return server
}

export class Server extends CommonServer {
	private server?: WebSocketServer
	private options: {
		port?: number
		path?: string
		server?: TServerInstance
		noServer?: boolean
	} = {}

	constructor(
		srv?: TServerInstance | number | Partial<ServerOptions>,
		opts?: Partial<ServerOptions>
	) {
		super()

		if (typeof srv === 'number') {
			this.options.port = srv
		} else if (srv instanceof Object && !(srv instanceof Array) && !opts) {
			this.options = srv as Partial<ServerOptions>
			this.options.noServer = true
		} else if (srv instanceof Object && opts) {
			this.options.server = srv as TServerInstance
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
		const socket = new SocketClient({
			ws,
			parser: this.parser,
			clients: this.clientManager,
			roomManager: this.roomManager,
			request: getNodeRequest(req),
		})

		this.middlewareManager.run(socket, (err) => {
			if (err) {
				socket.terminate()
				return
			}
			this.clientManager.add(socket)
			this.eventManager.emit('connection', socket)
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
