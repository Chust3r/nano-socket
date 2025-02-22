import { nanoid } from 'nanoid'
import { DependenciesContainer } from '~core/deps-container'
import { ParserBase } from '~core/parser-base'
import type { Parser } from '~types'

export interface Deps {
	parser: Parser
	generateId: () => string
}

export const dependencies = new DependenciesContainer<Deps>()

dependencies.register('parser', new ParserBase())
dependencies.register('generateId', () => nanoid())
