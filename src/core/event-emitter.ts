type Listener<T = any> = (...args: T[]) => void | Promise<void>

type Events<CustomEvents> = CustomEvents & { error: Error }

export class EventEmitter<CustomEvents extends Record<string, any>> {
	private events = new Map<string, Set<Listener<any>>>()

	on<Event extends keyof Events<CustomEvents>>(
		event: Event,
		listener: Listener<Events<CustomEvents>[Event]>
	): void {
		const pattern =
			this.getWildcardPattern(event as string) || (event as string)

		if (!this.events.has(pattern)) {
			this.events.set(pattern, new Set())
		}
		this.events.get(pattern)?.add(listener)
	}

	once<Event extends keyof Events<CustomEvents>>(
		event: Event,
		listener: Listener<Events<CustomEvents>[Event]>
	): void {
		const onceWrapper: Listener<Events<CustomEvents>[Event]> = async (
			value
		) => {
			this.off(event, onceWrapper)
			try {
				await listener(value)
			} catch (err) {
				this.emitError(err as Error)
			}
		}
		this.on(event, onceWrapper)
	}

	off<Event extends keyof Events<CustomEvents>>(
		event: Event,
		listener?: Listener<Events<CustomEvents>[Event]>
	): void {
		const pattern =
			this.getWildcardPattern(event as string) || (event as string)
		const listeners = this.events.get(pattern)

		if (!listeners) return

		if (!listener) {
			this.events.delete(pattern)
		} else {
			listeners.delete(listener)
			if (listeners.size === 0) {
				this.events.delete(pattern)
			}
		}
	}

	async emit<Event extends Exclude<keyof CustomEvents, 'error'>>(
		event: Event,
		...args: Parameters<CustomEvents[Event]>
	): Promise<void> {
		const listeners = [...(this.events.get(event as string) || [])]

		if (listeners.length === 0) return

		const results = listeners.map(async (listener) => {
			try {
				const result = listener(args)
				if (result instanceof Promise) {
					await result.catch((err) => this.emitError(err))
				}
			} catch (err) {
				this.emitError(err as Error)
			}
		})

		await Promise.all(results)
	}

	clear<Event extends keyof Events<CustomEvents>>(event?: Event): void {
		if (event) {
			const pattern =
				this.getWildcardPattern(event as string) || (event as string)
			this.events.delete(pattern)
		} else {
			this.events.clear()
		}
	}

	private async emitError(err: Error): Promise<void> {
		const listeners = [...(this.events.get('error') || [])]

		if (listeners.length === 0) return

		const results = listeners.map(async (listener) => {
			try {
				const result = listener(err)
				if (result instanceof Promise) {
					await result
				}
			} catch (_) {}
		})

		await Promise.all(results)
	}

	private getWildcardPattern(event: string): string | undefined {
		return event.includes('*') ? event.replace(/\*/g, '.*') : undefined
	}
}
