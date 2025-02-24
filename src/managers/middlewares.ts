import { StorageBase } from '~core/storage-base'
import type { Middleware, NextFunction } from '~types'

export class MiddlewaresManager {
	private context = {
		middlewares: new StorageBase<Middleware[]>(),
	}

	constructor() {
		this.context.middlewares.set('global', [])
	}

	add(path: string, middleware: Middleware): void {
		const middlewares = this.context.middlewares.get(path) || []
		middlewares.push(middleware)
		this.context.middlewares.set(path, middlewares)
	}

	async run(path: string, ctx: any, finalCallback: () => void): Promise<void> {
		const middlewares = [
			...(this.context.middlewares.get('global') || []),
			...(this.context.middlewares.get(path) || []),
		]

		let index = 0
		const next: NextFunction = async () => {
			if (index < middlewares.length) {
				const middleware = middlewares[index++]
				try {
					await middleware(ctx, next)
				} catch (error) {
					console.error('[Middleware Error]:', error)
				}
			} else {
				finalCallback()
			}
		}

		await next()
	}
}
