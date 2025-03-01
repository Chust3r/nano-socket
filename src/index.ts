import { Nano } from 'adapters/node'

const server = new Nano()

server.on('connection', (socket) => {
	socket.on('hola', () => {})
})
