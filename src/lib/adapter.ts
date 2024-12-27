import type { NodeServerCompatible, HTTPSServer, HTTPServer } from '~types'
import { Server } from 'node:http'

export const adaptToHttpServer = (
	server: NodeServerCompatible,
): HTTPSServer | HTTPServer => {
	if ('setTimeout' in server) {
		return server as HTTPServer | HTTPSServer
	}

	if ('stream' in server) {
		return Object.assign(Object.create(Server.prototype), server) as HTTPServer
	}

	return server
}
