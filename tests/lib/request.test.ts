import { describe, it, expect, vi } from 'vitest'
import { IncomingMessage } from 'http'
import { Server } from 'bun'
import {
	getQueryParams,
	getPath,
	getAuth,
	getCookies,
	getFullUrl,
	getNodeRequest,
	getBunRequest,
} from '../../src/lib/request'

describe('Get Query Params', () => {
	it('Get Query Params From Path / URL', () => {
		const url = 'http://localhost:3000/'
		const query = getQueryParams(url)
		expect(query.size).toBe(0)
	})
})

describe('Get Query Params From Complex URL', () => {
	it('Get Query Params From Path / URL', () => {
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
	it('Get Path From URL', () => {
		const url = 'http://localhost:3000/'
		const path = getPath(url)
		expect(path).toBe('/')
	})
})

describe('Get Path', () => {
	it('Get Path From Compound URL', () => {
		const url = 'http://localhost:3000/foo/bar'
		const path = getPath(url)
		expect(path).toBe('/foo/bar')
	})
})

describe('Get Auth', () => {
	it('Get Auth From Header', () => {
		const authHeader = 'foo'
		const auth = getAuth(authHeader)
		expect(auth.get('token')).toBe('foo')
	})
})

describe('Get JSON Auth', () => {
	it('Get Auth From Header', () => {
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
	it('Get Cookies From Header', () => {
		const cookieHeader = 'sessionId=abc123; theme=dark; loggedIn=true'
		const cookies = getCookies(cookieHeader)
		expect(cookies.get('sessionId')).toBe('abc123')
		expect(cookies.get('theme')).toBe('dark')
		expect(cookies.get('loggedIn')).toBe('true')
		expect(cookies.size).toBe(3)
	})
})
