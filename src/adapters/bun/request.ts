import type { SocketRequest } from '~types'
import type { Server } from 'bun'
import { getAuth, getCookies, getPath, getQueryParams } from '~lib/request'

export const getRequest = (req: Request, server: Server): SocketRequest => {
	const headers = new Map()

	for (const [key, value] of Object.entries(req.headers)) {
		if (value) {
			headers.set(key, String(value))
		}
	}

	const url = req.url || ''
	const query = getQueryParams(url)
	const path = getPath(url)
	const auth = getAuth(headers.get('authorization') || '')
	const cookies = getCookies(headers.get('cookie') || '')

	return {
		headers,
		url,
		query,
		path,
		auth,
		cookies,
		raw: {
			...req,
			address: server.requestIP(req),
		},
	}
}
