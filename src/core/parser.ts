import { CommonRecivedData } from '~types'

export class Parser {
	deserialize(data: CommonRecivedData) {
		const stringData = this.convertToString(data)
		const parsed = this.toJSON(stringData)

		if (!Array.isArray(parsed) || parsed.length === 0) {
			throw new Error(
				'Invalid message format: Expected an array with event and arguments'
			)
		}

		const [event, ...args] = parsed

		if (typeof event !== 'string') {
			throw new Error('Event should be a string')
		}

		return { event, args }
	}

	serialize(data: { event: string; args: any[] }) {
		if (typeof data.event !== 'string' || !Array.isArray(data.args)) {
			throw new Error(
				'Invalid message format: Event should be a string and args should be an array'
			)
		}

		return JSON.stringify([data.event, ...data.args])
	}

	private toJSON(data: string): any {
		try {
			return JSON.parse(data)
		} catch {
			throw new Error('Invalid JSON format in the data')
		}
	}

	private convertToString(data: CommonRecivedData): string {
		if (typeof data === 'string') {
			return data
		}
		if (Buffer.isBuffer(data)) {
			return data.toString('utf-8')
		}
		if (Array.isArray(data)) {
			return data
				.map((item) =>
					Buffer.isBuffer(item) ? item.toString('utf-8') : ''
				)
				.join('')
		}
		if (data instanceof ArrayBuffer) {
			return Buffer.from(data).toString('utf-8')
		}
		throw new Error('Invalid data format received')
	}
}
