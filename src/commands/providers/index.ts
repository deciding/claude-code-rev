import type { Command } from '../../types/command.js'

export default () =>
  ({
    type: 'local-jsx',
    name: 'auth',
    aliases: ['connect', 'providers'],
    description: 'Configure AI provider authentication',
    isEnabled: () => true,
    load: () => import('./auth.js'),
  }) satisfies Command