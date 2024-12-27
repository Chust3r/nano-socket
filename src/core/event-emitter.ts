type Listener<T = any> = (...args: T[]) => void | Promise<void>

interface EmitResult {
	success: boolean
	errors?: Error[]
}

type ErrorListener = (event: string, err: Error) => void

export class EventEmitter<Events extends Record<string, any>> {
	private events: Map<string, Listener[]>
	private weakListeners: WeakMap<object, Set<Listener<any>>>
	private errorListeners: Array<ErrorListener> = []

	constructor() {
		this.events = new Map()
		this.weakListeners = new WeakMap()
	}

	on<Event extends keyof Events>(
		event: Event,
		listener: Listener<Events[Event]>,
	): void {
		const pattern =
			this.getWildcardPattern(event as string) || (event as string)

		if (!this.events.has(pattern)) {
			this.events.set(pattern, [])
		}

		this.events.get(pattern)?.push(listener)

		if (typeof listener === 'object') {
			const listenersSet = this.weakListeners.get(listener) || new Set()
			listenersSet.add(listener)
			this.weakListeners.set(listener, listenersSet)
		}
	}

	once<Event extends keyof Events>(
		event: Event,
		listener: Listener<Events[Event]>,
		maxEmits = 1,
	): void {
		let emitCount = 0

		const onceWrapper: Listener<Events[Event]> = (...args) => {
			if (emitCount < maxEmits) {
				listener(...args)
				emitCount++
			}
			if (emitCount >= maxEmits) {
				this.off(event, onceWrapper)
			}
		}

		this.on(event, onceWrapper)
	}

	off<Event extends keyof Events>(
		event: Event,
		listener?: Listener<Events[Event]>,
	): void {
		const pattern =
			this.getWildcardPattern(event as string) || (event as string)
		const listeners = this.events.get(pattern)

		if (listeners) {
			if (!listener) {
				this.events.delete(pattern)
			} else {
				const filtered = listeners.filter((l) => l !== listener)
				this.events.set(pattern, filtered)
			}
		}
	}

	emit<Event extends keyof Events>(
		event: Event,
		...args: Parameters<Events[Event]>
	): EmitResult | Promise<EmitResult> {
		const errors: Error[] = []
		const promises: Promise<void>[] = []

		const processedArgs = args.map((arg) =>
			typeof arg === 'function' ? arg() : arg,
		)

		for (const [key, listeners] of this.events.entries()) {
			if (typeof key === 'string' && this.eventMatches(key, event as string)) {
				for (const listener of listeners) {
					try {
						if (key.includes('*')) {
							const result = listener(event as string, ...processedArgs)
							if (result instanceof Promise) promises.push(result)
						} else {
							const result = listener(...processedArgs)
							if (result instanceof Promise) promises.push(result)
						}
					} catch (err) {
						this.emitError(event as string, err as Error)
						errors.push(err as Error)
					}
				}
			}
		}

		if (promises.length > 0) {
			return Promise.all(promises)
				.then(() =>
					errors.length > 0 ? { success: false, errors } : { success: true },
				)
				.catch((err) => {
					this.emitError(event as string, err as Error)
					errors.push(err as Error)
					return { success: false, errors }
				})
		}

		return errors.length > 0 ? { success: false, errors } : { success: true }
	}

	onError(handler: ErrorListener): void {
		this.errorListeners.push(handler)
	}

	clear<Event extends keyof Events>(event?: Event): void {
		if (event) {
			const pattern =
				this.getWildcardPattern(event as string) || (event as string)
			if (this.events.has(pattern)) {
				this.events.delete(pattern)
			}
		} else {
			this.events.clear()
		}
	}

	private emitError(event: string, err: Error): void {
		for (const listener of this.errorListeners) {
			listener(event, err)
		}
	}

	private getWildcardPattern(event: string): string | undefined {
		return event.includes('*') ? event.replace(/\*/g, '.*') : undefined
	}

	private eventMatches(pattern: string, event: string): boolean {
		if (pattern.includes('.*')) {
			const regex = new RegExp(`^${pattern}$`)
			return regex.test(event)
		}
		return pattern === event
	}
}
