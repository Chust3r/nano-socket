import { describe, expect, it } from 'vitest'
import { Parser } from '../../src/core/parser'

describe('Parser', () => {
	it('Should serialize an event and arguments into a JSON string', () => {
		const parser = new Parser()
		const event = 'testEvent'
		const args = [1, 2, 3]
		const result = parser.serialize(event, ...args)
		expect(result).toBe(JSON.stringify([event, ...args]))
	})

	it('Should throw an error if serialize is called with invalid arguments', () => {
		const parser = new Parser()
		expect(() => parser.serialize(123 as any, [1, 2, 3])).toThrowError(
			'Invalid message format: Event should be a string and args should be an array',
		)
	})

	it('Should deserialize valid JSON data into an event and arguments', () => {
		const parser = new Parser()
		const data = JSON.stringify(['testEvent', 1, 2, 3])
		const result = parser.deserialize(data)
		expect(result).toEqual({ event: 'testEvent', args: [1, 2, 3] })
	})

	it('Should throw an error if deserialized data is not an array', () => {
		const parser = new Parser()
		const invalidData = JSON.stringify({ event: 'testEvent', args: [] })
		expect(() => parser.deserialize(invalidData)).toThrowError(
			'Invalid message format: Expected an array with event and arguments',
		)
	})

	it('Should throw an error if the event is not a string', () => {
		const parser = new Parser()
		const invalidData = JSON.stringify([123, 1, 2, 3])
		expect(() => parser.deserialize(invalidData)).toThrowError(
			'Event should be a string',
		)
	})

	it('Should throw an error if the data is not valid JSON', () => {
		const parser = new Parser()
		const invalidJSON = 'invalid-json'
		expect(() => parser.deserialize(invalidJSON)).toThrowError(
			'Invalid JSON format in the data',
		)
	})

	it('Should convert Buffer data to a string', () => {
		const parser = new Parser()
		const buffer = Buffer.from(JSON.stringify(['testEvent', 1, 2, 3]), 'utf-8')
		const result = parser.deserialize(buffer)
		expect(result).toEqual({ event: 'testEvent', args: [1, 2, 3] })
	})

	it('Should throw an error if the received data format is invalid', () => {
		const parser = new Parser()
		const invalidData = 12345 as any
		expect(() => parser.deserialize(invalidData)).toThrowError(
			'Invalid data format received',
		)
	})
})
