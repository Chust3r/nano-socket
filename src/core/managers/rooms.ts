export class RoomManager {
	private rooms = new Map<string, Set<string>>()
	private members = new Map<string, Set<string>>()

	add = (room: string, id: string): void => {
		if (!room || !id) return

		let roomSet = this.rooms.get(room)
		if (!roomSet) {
			roomSet = new Set()
			this.rooms.set(room, roomSet)
		}
		roomSet.add(id)

		let memberSet = this.members.get(id)
		if (!memberSet) {
			memberSet = new Set()
			this.members.set(id, memberSet)
		}
		memberSet.add(room)
	}

	private _remove = (room: string, id: string): void => {
		const roomSet = this.rooms.get(room)
		if (roomSet) {
			roomSet.delete(id)
			if (roomSet.size === 0) {
				this.rooms.delete(room)
			}
		}

		const memberSet = this.members.get(id)
		if (memberSet) {
			memberSet.delete(room)
			if (memberSet.size === 0) {
				this.members.delete(id)
			}
		}
	}

	private _removeMemberFromRoom = (room: string, id: string): void => {
		const memberSet = this.members.get(id)
		if (memberSet) {
			memberSet.delete(room)
			if (memberSet.size === 0) {
				this.members.delete(id)
			}
		}
	}

	getRooms = (): string[] => [...this.rooms.keys()]

	getRoomMembers = (room: string): string[] => {
		const roomMembers = this.rooms.get(room)
		return roomMembers ? [...roomMembers] : []
	};

	in = (id: string, ...rooms: string[]): boolean =>
		rooms.some((room) => this.rooms.get(room)?.has(id))

	getRoomMembersCount = (room: string): number =>
		this.rooms.get(room)?.size ?? 0

	getRoomsMembers = (...rooms: string[]): string[] => {
		const clientIdsSet = new Set<string>()
		for (const room of rooms) {
			const roomSet = this.rooms.get(room)
			if (roomSet) {
				for (const clientId of roomSet) {
					clientIdsSet.add(clientId)
				}
			}
		}
		return [...clientIdsSet]
	}

	deleteRoom = (room: string): void => {
		const roomSet = this.rooms.get(room)
		if (roomSet) {
			for (const id of roomSet) {
				this._removeMemberFromRoom(room, id)
			}
			this.rooms.delete(room)
		}
	}

	moveClientToRoom = (id: string, from: string, to: string): void => {
		if (from === to || !id || !from || !to) return
		this._remove(from, id)
		this.add(to, id)
	}

	merge = (target: string, ...rooms: string[]): void => {
		if (!target || rooms.length === 0) return

		let targetSet = this.rooms.get(target)
		if (!targetSet) {
			targetSet = new Set()
			this.rooms.set(target, targetSet)
		}

		for (const room of rooms) {
			const roomSet = this.rooms.get(room)
			if (roomSet) {
				for (const id of roomSet) {
					targetSet.add(id)
					this.members.get(id)?.add(target)
				}
				this.rooms.delete(room)
			}
		}
	}

	getMemberRooms = (id: string): string[] => {
		const memberRooms = this.members.get(id)
		return memberRooms ? [...memberRooms] : []
	}

	remove = (id: string, ...targetRooms: string[]): void => {
		if (targetRooms.length === 0) {
			const memberRooms = this.members.get(id)
			if (memberRooms) {
				for (const room of memberRooms) {
					this._remove(room, id)
				}
			}
		} else {
			for (const room of targetRooms) {
				this._remove(room, id)
			}
		}
		this.members.delete(id)
	}

	hasRoom = (room: string): boolean => this.rooms.has(room)

	hasMember = (id: string): boolean => this.members.has(id)
}
