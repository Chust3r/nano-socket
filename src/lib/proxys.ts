import type { Socket, SocketContext } from '~types'

export const createSocketContextProxy = (socket: Socket): SocketContext => {
	return new Proxy(
		{
			id: socket.id,
			data: socket.data,
			request: socket.request,
		} as SocketContext,
		{
			get(target, prop) {
				if (prop === 'id' || prop === 'data' || prop === 'request') {
					return target[prop as keyof SocketContext]
				}
				throw new Error(
					`Property ${String(prop)} not available in SocketContext`,
				)
			},
		},
	)
}
