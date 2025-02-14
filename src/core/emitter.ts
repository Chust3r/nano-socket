type Listener<T> = (value: T) => void | Promise<void>

type Events<CustomEvents> = CustomEvents & { error: Error }

export class EventEmitter<CustomEvents extends Record<string, unknown>> {
	private events = new Map<string, Set<Listener<any>>>()

	on<Event extends keyof Events<CustomEvents>>(
		event: Event,
		listener: Listener<Events<CustomEvents>[Event]>,
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
		listener: Listener<Events<CustomEvents>[Event]>,
	): void {
		const onceWrapper: Listener<Events<CustomEvents>[Event]> = (value) => {
			this.off(event, onceWrapper)
			void listener(value)
		}
		this.on(event, onceWrapper)
	}

	off<Event extends keyof Events<CustomEvents>>(
		event: Event,
		listener?: Listener<Events<CustomEvents>[Event]>,
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
		value: CustomEvents[Event],
	): Promise<void> {
		if (typeof value === 'function' || value === null || value === undefined) {
			throw new TypeError(
				`emit(${String(
					event,
				)}, value) cannot be called with a function, null or undefined`,
			)
		}

		const listeners = [...(this.events.get(event as string) || [])]

		if (listeners.length === 0) return

		for (const listener of listeners) {
			try {
				const result = listener(value)
				if (result instanceof Promise) {
					await result.catch((err) => this.emitError(err))
				}
			} catch (err) {
				this.emitError(err as Error)
			}
		}
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

		for (const listener of listeners) {
			try {
				const result = listener(err)
				if (result instanceof Promise) {
					await result
				}
			} catch (_) {}
		}
	}

	private getWildcardPattern(event: string): string | undefined {
		return event.includes('*') ? event.replace(/\*/g, '.*') : undefined
	}
}
