import { AddressInfo, SocketRequest } from '~types'
import { Server } from 'bun'
import { IncomingMessage } from 'http'

export const getQueryParams = (path: string): ReadonlyMap<string, string> => {
	const urlObj = new URL(path, 'https://example.com')
	const params = new URLSearchParams(urlObj.search)
	const result = new Map<string, string>()

	for (const [key, value] of params.entries()) {
		result.set(key, value)
	}

	return Object.freeze(result)
}

export const getPath = (url: string): string => {
	const urlObj = new URL(url, 'https://example.com')
	return urlObj.pathname
}

export const getAuth = (authHeader: string): ReadonlyMap<string, string> => {
	let auth = new Map<string, string>()

	if (!authHeader) return Object.freeze(auth)

	try {
		const parsedAuth = JSON.parse(authHeader)

		Object.entries(parsedAuth).forEach(([key, value]) => {
			auth.set(key, String(value))
		})
	} catch {
		auth.set('token', authHeader)
	}

	return Object.freeze(auth)
}

export const getCookies = (cookieHeader: string): ReadonlyMap<string, string> => {
	const cookies = new Map<string, string>()
	if (cookieHeader) {
		cookieHeader.split(';').forEach((cookie) => {
			const [key, value] = cookie.split('=').map((item) => item.trim())
			if (key && value) {
				cookies.set(key, value)
			}
		})
	}
	return Object.freeze(cookies)
}

export const getFullUrl = (req: IncomingMessage): string => {
	const protocol = req.socket.address() ? 'https' : 'http'
	const host = req.headers.host || 'localhost'
	return `${protocol}://${host}${req.url}`
}

export const getNodeRequest = (req: IncomingMessage): SocketRequest => {
	const headers = new Headers()
	for (const [key, value] of Object.entries(req.headers)) {
		if (value) {
			headers.append(key, String(value))
		}
	}

	const url = getFullUrl(req)
	const query = getQueryParams(url)
	const path = getPath(url)
	const auth = getAuth(headers.get('authorization') || '')
	const cookies = getCookies(headers.get('cookie') || '')

	const address = req.socket.address() as AddressInfo

	return {
		headers,
		url,
		query,
		path,
		auth,
		cookies,
		address,
	}
}

export const getBunRequest = (req: Request, server: Server): SocketRequest => {
	const headers = req.headers
	const url = req.url || ''
	const query = getQueryParams(url)
	const path = getPath(url)
	const auth = getAuth(headers.get('authorization') || '')
	const cookies = getCookies(headers.get('cookie') || '')
	const address = server.requestIP(req)

	return {
		headers,
		url,
		query,
		path,
		auth,
		cookies,
		address,
	}
}
