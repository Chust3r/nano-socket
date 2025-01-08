import type { ExtendedError, Middleware, Socket, SocketContext } from 'types'
import { createSocketContextProxy } from '~lib/proxys'

export class MiddlewareManager {
	private middlewares: Middleware[] = []

	constructor(private defaultTimeout = 5000) {}

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
					done(
						new Error(`Middleware timeout: ${this.defaultTimeout}ms exceeded`),
					)
				}
			}, this.defaultTimeout)

			const middleware = this.middlewares[index]

			const socketContext: SocketContext = createSocketContextProxy(socket)

			middleware(socketContext, async (err?: ExtendedError) => {
				if (isNextCalled) return
				isNextCalled = true
				clearTimeout(timer)

				if (err) {
					socket.emit('error', err.message)
					socket.close()
					return done(err)
				}

				await runMiddleware(index + 1)
			})
		}

		runMiddleware(0)
	}
}
