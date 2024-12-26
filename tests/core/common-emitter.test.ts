import { describe, it, expect, vi } from 'vitest'
import { CommonClientEmitter } from '../../src/core/common-emitter'
import { ExtendedError, CommonRecivedData } from '../../src/lib/types'

describe('CommonClientEmitter', () => {
	it('Should register and trigger the "close" event', () => {
		const emitter = new CommonClientEmitter()
		const callback = vi.fn()

		emitter.on('close', callback)
		emitter.emit('close', 1000, 'Normal closure')

		expect(callback).toHaveBeenCalledWith(1000, 'Normal closure')
		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('Should register and trigger the "error" event', () => {
		const emitter = new CommonClientEmitter()
		const callback = vi.fn()
		const error: ExtendedError = new Error('Test error')

		emitter.on('error', callback)
		emitter.emit('error', error)

		expect(callback).toHaveBeenCalledWith(error)
		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('Should register and trigger the "message" event', () => {
		const emitter = new CommonClientEmitter()
		const callback = vi.fn()
		const message: CommonRecivedData = 'Test message'

		emitter.on('message', callback)
		emitter.emit('message', message, true)

		expect(callback).toHaveBeenCalledWith('Test message', true)
		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('Should handle multiple listeners for the same event', () => {
		const emitter = new CommonClientEmitter()
		const callback1 = vi.fn()
		const callback2 = vi.fn()

		emitter.on('message', callback1)
		emitter.on('message', callback2)
		emitter.emit('message', 'Hello, listeners!', false)

		expect(callback1).toHaveBeenCalledWith('Hello, listeners!', false)
		expect(callback2).toHaveBeenCalledWith('Hello, listeners!', false)
		expect(callback1).toHaveBeenCalledTimes(1)
		expect(callback2).toHaveBeenCalledTimes(1)
	})

	it('Should not trigger listeners for unrelated events', () => {
		const emitter = new CommonClientEmitter()
		const callback = vi.fn()

		emitter.on('close', callback)
		emitter.emit('message', 'This Should not trigger')

		expect(callback).not.toHaveBeenCalled()
	})
})
