import { describe, it, expect } from 'vitest'
import {
	getQueryParams,
	getPath,
	getAuth,
	getCookies,
} from '../../src/lib/request'

describe('Get Query Params', () => {
	it('Should retrieve query parameters from a basic URL', () => {
		const url = 'http://localhost:3000/'
		const query = getQueryParams(url)
		expect(query.size).toBe(0)
	})

	it('Should retrieve query parameters from a complex URL', () => {
		const url = 'http://localhost:3000/?foo=bar&baz=qux&bar=foo'
		const query = getQueryParams(url)
		expect(query.get('foo')).toBe('bar')
		expect(query.get('baz')).toBe('qux')
		expect(query.get('bar')).toBe('foo')
		expect(query.has('foo')).toBe(true)
		expect(query.has('baz')).toBe(true)
		expect(query.has('bar')).toBe(true)
		expect(query.size).toBe(3)
	})
})

describe('Get Path', () => {
	it('Should retrieve path from a basic URL', () => {
		const url = 'http://localhost:3000/'
		const path = getPath(url)
		expect(path).toBe('/')
	})

	it('Should retrieve path from a compound URL', () => {
		const url = 'http://localhost:3000/foo/bar'
		const path = getPath(url)
		expect(path).toBe('/foo/bar')
	})
})

describe('Get Auth', () => {
	it('Should retrieve auth token from a header string', () => {
		const authHeader = 'foo'
		const auth = getAuth(authHeader)
		expect(auth.get('token')).toBe('foo')
	})

	it('Should retrieve JSON auth data from a header string', () => {
		const data = {
			userId: 1,
			token: 'foo',
		}
		const authHeader = JSON.stringify(data)
		const auth = getAuth(authHeader)
		expect(auth.get('userId')).toBe('1')
		expect(auth.get('token')).toBe('foo')
	})
})

describe('Get Cookies', () => {
	it('Should retrieve cookies from a header string', () => {
		const cookieHeader = 'sessionId=abc123; theme=dark; loggedIn=true'
		const cookies = getCookies(cookieHeader)
		expect(cookies.get('sessionId')).toBe('abc123')
		expect(cookies.get('theme')).toBe('dark')
		expect(cookies.get('loggedIn')).toBe('true')
		expect(cookies.size).toBe(3)
	})
})
