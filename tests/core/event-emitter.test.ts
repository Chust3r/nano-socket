import { describe, it, expect, vi } from 'vitest'
import { EventEmitter } from '../../src/core/event-emitter'

describe('Event Emitter', () => {
	it('Should be able to emit an event', () => {
		const emitter = new EventEmitter()
		const callback = vi.fn()
		emitter.on('test', callback)
		emitter.emit('test', 'test')
		expect(callback).toHaveBeenCalledWith('test')
		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('Should register & emit once event', () => {
		const emitter = new EventEmitter()
		const callback = vi.fn()
		emitter.once('test', callback)
		emitter.emit('test', 'test')
		emitter.emit('test', 'test')

		expect(callback).toHaveBeenCalledWith('test')
		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('Should unregister events with off', () => {
		const emitter = new EventEmitter()
		const callback = vi.fn()
		emitter.on('test', callback)
		emitter.off('test', callback)
		emitter.emit('test', 'data')
		expect(callback).not.toHaveBeenCalled()
	})

	it('Should handle wildcard events', () => {
		const emitter = new EventEmitter()
		const callback = vi.fn()
		emitter.on('user.*', callback)
		emitter.emit('user.create', 'new user')
		emitter.emit('user.update', 'updated user')
		expect(callback).toHaveBeenCalledTimes(2)
		expect(callback).toHaveBeenCalledWith('user.create', 'new user')
		expect(callback).toHaveBeenCalledWith('user.update', 'updated user')
	})

	it('Should handle errors with onError', () => {
		const emitter = new EventEmitter()
		const errorHandler = vi.fn()
		const failingListener = () => {
			throw new Error('Test error')
		}
		emitter.onError(errorHandler)
		emitter.on('test', failingListener)
		emitter.emit('test', 'data')
		expect(errorHandler).toHaveBeenCalledOnce()
		expect(errorHandler).toHaveBeenCalledWith('test', expect.any(Error))
	})

	it('Should clear all events with clear', () => {
		const emitter = new EventEmitter()
		const callback = vi.fn()
		emitter.on('test', callback)
		emitter.clear()
		emitter.emit('test', 'data')
		expect(callback).not.toHaveBeenCalled()
	})

	it('Should clear a specific event with clear', () => {
		const emitter = new EventEmitter()
		const callback = vi.fn()
		emitter.on('test', callback)
		emitter.on('other', callback)
		emitter.clear('test')
		emitter.emit('test', 'data')
		emitter.emit('other', 'data')
		expect(callback).toHaveBeenCalledTimes(1)
		expect(callback).toHaveBeenCalledWith('data')
	})

	it('Should support listeners with maxEmits in once', () => {
		const emitter = new EventEmitter()
		const callback = vi.fn()
		emitter.once('test', callback, 2)
		emitter.emit('test', 'data1')
		emitter.emit('test', 'data2')
		emitter.emit('test', 'data3')
		expect(callback).toHaveBeenCalledTimes(2)
		expect(callback).toHaveBeenCalledWith('data1')
		expect(callback).toHaveBeenCalledWith('data2')
	})

	it('Should emit multiple listeners for the same event', () => {
		const emitter = new EventEmitter()
		const callback1 = vi.fn()
		const callback2 = vi.fn()
		emitter.on('test', callback1)
		emitter.on('test', callback2)
		emitter.emit('test', 'data')
		expect(callback1).toHaveBeenCalledOnce()
		expect(callback1).toHaveBeenCalledWith('data')
		expect(callback2).toHaveBeenCalledOnce()
		expect(callback2).toHaveBeenCalledWith('data')
	})

	it('Should handle asynchronous events', async () => {
		const emitter = new EventEmitter()
		const asyncCallback = vi.fn().mockImplementation(async (data) => {
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve(data)
				}, 100)
			})
		})
		emitter.on('test', asyncCallback)
		const result = await emitter.emit('test', 'asyncData')
		expect(result.success).toBe(true)
		expect(asyncCallback).toHaveBeenCalledOnce()
		expect(asyncCallback).toHaveBeenCalledWith('asyncData')
	})
})
