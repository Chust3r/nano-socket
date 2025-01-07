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
	const auth = new Map<string, string>()

	if (!authHeader) return Object.freeze(auth)

	try {
		const parsedAuth = JSON.parse(authHeader)

		for (const [key, value] of Object.entries(parsedAuth)) {
			auth.set(key, String(value))
		}
	} catch {
		auth.set('token', authHeader)
	}

	return Object.freeze(auth)
}

export const getCookies = (
	cookieHeader: string,
): ReadonlyMap<string, string> => {
	const cookies = new Map<string, string>()
	if (cookieHeader) {
		const cookieArray = cookieHeader.split(';')
		for (const cookie of cookieArray) {
			const [key, value] = cookie.split('=').map((item) => item.trim())
			if (key && value) {
				cookies.set(key, value)
			}
		}
	}
	return Object.freeze(cookies)
}
