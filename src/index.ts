import { Nano } from 'adapters/node'

const nano = new Nano()

nano.on('connection', (socket) => {
	console.log(socket.id)
})
