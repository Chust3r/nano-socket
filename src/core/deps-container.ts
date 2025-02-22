export class DependenciesContainer<T extends Record<string, any>> {
	private services: Map<string, any> = new Map()

	register<K extends keyof T>(name: K, instance: T[K]): void {
		this.services.set(name as string, instance)
	}

	resolve<K extends keyof T>(name: K): T[K] {
		const service = this.services.get(name as string)
		if (!service) {
			throw new Error(`Service ${String(name)} not found`)
		}
		return service
	}

	update<K extends keyof T>(name: K, instance: T[K]): void {
		this.services.set(name as string, instance)
	}

	has<K extends keyof T>(name: K): boolean {
		return this.services.has(name as string)
	}

	remove<K extends keyof T>(name: K): void {
		this.services.delete(name as string)
	}
}
