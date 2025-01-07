import type { ExtendedError, Middleware, Socket } from '~types'

interface MiddlewareManagerOptions {
	timeout?: number
}

export class MiddlewareManager {
	private middlewares: Middleware[] = []
	private defaultTimeout: number

	constructor({ timeout = 5000 }: MiddlewareManagerOptions = {}) {
		this.defaultTimeout = timeout
	}

	use(middleware: Middleware): void {
		this.middlewares.push(middleware)
	}

	run(socket: Socket, done: (err?: ExtendedError) => void): void {
		const runMiddleware = (index: number) => {
			if (index >= this.middlewares.length) {
				return done()
			}

			let isNextCalled = false
			const timer = setTimeout(() => {
				if (!isNextCalled) {
					socket.close()
					const msg = `Middleware timeout: ${this.defaultTimeout}ms exceeded`
					done(new Error(msg))
				}
			}, this.defaultTimeout)

			const middleware = this.middlewares[index]

			middleware(socket, (err?: ExtendedError) => {
				if (isNextCalled) return
				isNextCalled = true
				clearTimeout(timer)

				if (err) {
					return done(err)
				}

				runMiddleware(index + 1)
			})
		}

		runMiddleware(0)
	}
}
