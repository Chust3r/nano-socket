import { StorageBase } from '~core/storage-base'

export class ChannelsManager {
	private context = {
		channels: new StorageBase<Set<string>>(),
		members: new StorageBase<Set<string>>(),
	}

	private addChannel = (channel: string, id: string) => {
		if (!channel || !id) return

		let group = this.context.channels.get(channel)
		if (!group) {
			group = new Set()
			this.context.channels.set(channel, group)
		}
		group.add(id)

		let members = this.context.members.get(id)
		if (!members) {
			members = new Set()
			this.context.members.set(id, members)
		}
		members.add(channel)
	}

	private deleteChannel = (channel: string) => {
		const group = this.context.channels.get(channel)
		if (group) {
			for (const id of group) {
				this._removeMemberFromChannel(channel, id)
			}
			this.context.channels.delete(channel)
		}
	}

	private mergeChannels = (target: string, ...channels: string[]) => {
		if (!target || channels.length === 0) return

		const targetSet = this.context.channels.get(target) || new Set()
		for (const channel of channels) {
			const group = this.context.channels.get(channel)
			if (group) {
				for (const id of group) {
					targetSet.add(id)
					let members = this.context.members.get(id)
					if (!members) {
						members = new Set()
						this.context.members.set(id, members)
					}
					members.add(target)
				}
			}
			this.context.channels.delete(channel)
		}
		this.context.channels.set(target, targetSet)
	}

	private hasChannel = (channel: string): boolean =>
		this.context.channels.has(channel)

	private removeMember = (id: string, ...targetChannels: string[]) => {
		const memberChannels =
			targetChannels.length === 0
				? this.context.members.get(id)
				: targetChannels

		if (Array.isArray(memberChannels)) {
			for (const c of memberChannels) {
				this._remove(c, id)
			}
		} else {
			if (memberChannels) {
				for (const c of memberChannels) {
					this._remove(c, id)
				}
			}
		}
		this.context.members.delete(id)
	}

	private moveMember = (id: string, from: string, to: string) => {
		if (from === to || !id || !from || !to) return
		this._remove(from, id)
		this.addChannel(to, id)
	}

	private hasMember = (id: string): boolean => this.context.members.has(id)

	private getChannelsList = (): string[] => [...this.context.channels.keys()]

	private getChannelMembers = (channel: string): string[] => {
		const group = this.context.channels.get(channel)
		return group ? [...group] : []
	}

	private getChannelMembersCount = (channel: string): number =>
		this.context.channels.get(channel)?.size ?? 0

	private getMultipleChannelsMembers = (...channels: string[]): string[] => {
		const ids = new Set<string>()
		for (const c of channels) {
			const group = this.context.channels.get(c)
			if (group) {
				for (const id of group) {
					ids.add(id)
				}
			}
		}
		return [...ids]
	}

	private getMemberChannels = (id: string): string[] => {
		const memberChannels = this.context.members.get(id)
		return memberChannels ? [...memberChannels] : []
	}

	private isMemberInChannels = (id: string, ...channels: string[]): boolean =>
		channels.some((c) => this.context.channels.get(c)?.has(id))

	private _remove = (channel: string, id: string) => {
		const group = this.context.channels.get(channel)
		group?.delete(id)
		if (group?.size === 0) this.context.channels.delete(channel)

		const members = this.context.members.get(id)
		members?.delete(channel)
		if (members?.size === 0) this.context.members.delete(id)
	}

	private _removeMemberFromChannel = (channel: string, id: string) => {
		const members = this.context.members.get(id)
		if (members) {
			members.delete(channel)
			if (members.size === 0) {
				this.context.members.delete(id)
			}
		}
	}

	get channels() {
		return {
			add: this.addChannel,
			delete: this.deleteChannel,
			merge: this.mergeChannels,
			has: this.hasChannel,
			getList: this.getChannelsList,
			getMembers: this.getChannelMembers,
			getMembersCount: this.getChannelMembersCount,
			getMultipleMembers: this.getMultipleChannelsMembers,
		}
	}

	get members() {
		return {
			remove: this.removeMember,
			move: this.moveMember,
			has: this.hasMember,
			getChannels: this.getMemberChannels,
			isInChannels: this.isMemberInChannels,
		}
	}
}
