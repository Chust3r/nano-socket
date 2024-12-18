export class RoomManager {
	private rooms: Map<string, Set<string>> = new Map()
	private members: Map<string, Set<string>> = new Map()

	add(room: string, id: string): void {
		if (!this.rooms.has(room)) {
			this.rooms.set(room, new Set())
		}
		this.rooms.get(room)?.add(id)

		if (!this.members.has(id)) {
			this.members.set(id, new Set())
		}
		this.members.get(id)?.add(room)
	}

	private _remove(room: string, id: string): void {
		const roomClients = this.rooms.get(room)
		if (roomClients) {
			roomClients.delete(id)
			if (roomClients.size === 0) {
				this.rooms.delete(room)
			}
		}

		const memberRooms = this.members.get(id)
		if (memberRooms) {
			memberRooms.delete(room)
			if (memberRooms.size === 0) {
				this.members.delete(id)
			}
		}
	}

	getRooms(): string[] {
		return Array.from(this.rooms.keys())
	}

	getRoomMembers(room: string): string[] {
		return Array.from(this.rooms.get(room) || [])
	}

	in(id: string, ...rooms: string[]): boolean {
		return rooms.some((room) => this.rooms.get(room)?.has(id))
	}

	getRoomMembersCount(room: string): number {
		return this.rooms.get(room)?.size ?? 0
	}

	getRoomsClients(...rooms: string[]): string[] {
		const clientIdsSet = new Set<string>()

		rooms.forEach((room) => {
			const clientsInRoom = this.rooms.get(room)
			if (clientsInRoom) {
				clientsInRoom.forEach((clientId) => clientIdsSet.add(clientId))
			}
		})

		return Array.from(clientIdsSet)
	}

	deleteRoom(room: string) {
		const members = this.rooms.get(room)
		if (members) {
			members.forEach((memberId) => {
				this.members.get(memberId)?.delete(room)
				if (this.members.get(memberId)?.size === 0) {
					this.members.delete(memberId)
				}
			})
			this.rooms.delete(room)
		}
	}

	moveClientToRoom(id: string, from: string, to: string) {
		this._remove(from, id)
		this.add(to, id)
	}

	merge(target: string, ...rooms: string[]) {
		if (!this.rooms.has(target)) {
			this.rooms.set(target, new Set())
		}

		rooms.forEach((room) => {
			const members = this.rooms.get(room)

			if (members) {
				members.forEach((member) => this.add(target, member))
				this.deleteRoom(room)
			}
		})
	}

	getMemberRooms(id: string): string[] {
		return Array.from(this.members.get(id) ?? [])
	}

	remove(id: string, ...targetRooms: string[]): void {
		if (targetRooms.length === 0) {
			const memberRooms = this.members.get(id)
			if (memberRooms) {
				memberRooms.forEach((room) => this._remove(room, id))
				this.members.delete(id)
			}
		} else {
			targetRooms.forEach((room) => {
				this._remove(room, id)
			})

			const memberRooms = this.members.get(id)
			if (memberRooms && memberRooms.size === 0) {
				this.members.delete(id)
			}
		}
	}
}
