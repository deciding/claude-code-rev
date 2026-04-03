import type { Command } from '../../commands.js'

const buddy = {
  type: 'local',
  name: 'buddy',
  description: 'Hatch and interact with your coding companion',
  immediate: true,
  argumentHint: '[hatch|view|pet|mute|unmute]',
  load: () => import('./buddy.tsx'),
} satisfies Command

export default buddy
