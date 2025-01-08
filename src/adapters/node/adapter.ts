import { Server } from 'node:http'
import type { HTTPSServer, HTTPServer, NodeServerCompatible } from '~types'

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
