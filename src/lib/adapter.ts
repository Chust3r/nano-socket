import { NodeServerCompatible, HTTPSServer, HTTPServer } from '~types'

export const adaptToHttpServer = (
	server: NodeServerCompatible
): HTTPSServer | HTTPServer => {
	if ('setTimeout' in server) {
		return server as HTTPServer | HTTPSServer
	}

	if ('stream' in server) {
		return server as unknown as HTTPServer
	}

	return server
}
