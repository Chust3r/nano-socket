import type { Parser, IncomingData } from '~types'

export class ParserBase implements Parser {
	deserialize = (data: IncomingData): { event: string; params: any[] } => {
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

		return { event, params: args }
	}

	serialize = (event: string, ...args: any[]): string => {
		if (typeof event !== 'string') {
			throw new Error('Invalid message format: Event should be a string')
		}

		return JSON.stringify([event, ...args])
	}

	private toJSON = (data: string): any => {
		try {
			return JSON.parse(data)
		} catch (err) {
			if (err instanceof Error) {
				throw new Error(`Invalid message format: ${err.message}`)
			}
			throw new Error('Invalid message format')
		}
	}

	private convertToString = (data: IncomingData): string => {
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

		throw new Error(
			'Invalid data format received. Expected string, Buffer, Array, or ArrayBuffer.'
		)
	}
}
