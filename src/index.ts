import { Nano } from 'adapters/node'

const nano = new Nano()

nano.use(async (ctx, next) => {
	console.log(1)
	await next()
	console.log(2)
})

nano.on('connection', (socket) => {
	console.log('NEW CONNECTION')
})
