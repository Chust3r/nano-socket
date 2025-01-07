import type { IncomingMessage } from 'node:http'
import { getAuth, getCookies, getPath, getQueryParams } from '~lib/request'
import type { SocketRequest } from '~types'

const getFullUrl = (req: IncomingMessage): string => {
	const protocol = req.socket.address() ? 'https' : 'http'
	const host = req.headers.host || 'localhost'
	return `${protocol}://${host}${req.url}`
}

export const getRequest = (req: IncomingMessage): SocketRequest => {
	const headers = new Map()
	for (const [key, value] of Object.entries(req.headers)) {
		if (value) {
			headers.set(key, String(value))
		}
	}

	const url = getFullUrl(req)
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
		raw: req,
	}
}
