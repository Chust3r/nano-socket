import type { ExtendedError, Middleware, Socket, SocketContext } from 'types'
import { createSocketContextProxy } from '~lib/proxys'

export class MiddlewareManager {
	private middlewares: Middleware[] = []

	constructor(private defaultTimeout = 5000) {}

	use = (middleware: Middleware): void => {
		this.middlewares.push(middleware)
	}

	run = (socket: Socket, done: (err?: ExtendedError) => void): void => {
		const runMiddleware = (index: number) => {
			if (index >= this.middlewares.length) return done()

			let isNextCalled = false
			let isTimeoutExceeded = false

			const timer = setTimeout(() => {
				if (!isNextCalled) {
					isTimeoutExceeded = true
					const timeoutError = new Error(
						`Middleware timeout: ${this.defaultTimeout}ms exceeded`,
					)
					done(timeoutError)
				}
			}, this.defaultTimeout)

			const middleware = this.middlewares[index]
			const socketContext: SocketContext = createSocketContextProxy(socket)

			const next = (err?: ExtendedError) => {
				if (isNextCalled || isTimeoutExceeded) return

				isNextCalled = true
				clearTimeout(timer)

				if (err) {
					socket.emit('error', err.message)
					return done(err)
				}

				runMiddleware(index + 1)
			}

			try {
				const result = middleware(socketContext, next)

				if (result instanceof Promise) {
					result.then(() => next()).catch(next)
				} else {
					if (!isNextCalled) {
						const error = new Error('Middleware did not call next()')
						return done(error)
					}
					next()
				}
			} catch (err) {
				next(err as ExtendedError)
			}
		}

		runMiddleware(0)
	}
}
