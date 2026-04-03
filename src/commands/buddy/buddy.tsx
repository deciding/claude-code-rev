import type { ToolUseContext } from '../../Tool.js'
import type { LocalCommandResult } from '../../types/command.js'
import { getGlobalConfig, saveGlobalConfig } from '../../utils/config.js'
import {
  companionUserId,
  getCompanion,
  roll,
} from '../../buddy/companion.js'
import {
  RARITY_COLORS,
  RARITY_STARS,
  type StoredCompanion,
} from '../../buddy/types.js'
import { renderSprite } from '../../buddy/sprites.js'
import { isBuddyLive } from '../../buddy/useBuddyNotification.js'

async function generateCompanionSoul(
  species: string,
  rarity: string,
  stats: Record<string, number>,
): Promise<{ name: string; personality: string }> {
  // For now, generate a simple name and personality
  // In production, this would call an LLM to generate based on species/rarity/stats
  const names: Record<string, string[]> = {
    duck: ['Quackers', 'Waddles', 'Ducky', 'Mallard', 'Puddles'],
    goose: ['Honkers', 'Gander', 'Goosifer', 'Maverick', 'Chaos'],
    blob: ['Blobby', 'Squish', 'Gloop', 'Jelly', 'Morph'],
    cat: ['Whiskers', 'Mittens', 'Shadow', 'Luna', 'Felix'],
    dragon: ['Ember', 'Scales', 'Draco', 'Smaug', 'Puff'],
    octopus: ['Tentacles', 'Inky', 'Kraken', 'Sucker', 'Octo'],
    owl: ['Hoot', 'Wisdom', 'Athena', 'Owlbert', 'Noctis'],
    penguin: ['Waddles', 'Tux', 'Flipper', 'Pingu', 'Iceberg'],
    turtle: ['Shelly', 'Slowpoke', 'Crush', 'Speedy', 'Tank'],
    snail: ['Slime', 'Gary', 'Turbo', 'Spiral', 'Escargot'],
    ghost: ['Boo', 'Casper', 'Phantom', 'Spooky', 'Wraith'],
    axolotl: ['Axel', 'Gilly', 'Pinky', 'Mudkip', 'Wooper'],
    capybara: ['Cappy', 'Chillbert', 'Rodney', 'Zen', 'Vibes'],
    cactus: ['Spike', 'Prickles', 'Verde', 'Needles', 'Succulent'],
    robot: ['Beep', 'Circuit', 'Bolt', 'Binary', 'Chip'],
    rabbit: ['Hoppy', 'Bunny', 'Thumper', 'Cotton', 'Carrot'],
    mushroom: ['Fungi', 'Spore', 'Shroom', 'Morel', 'Truffle'],
    chonk: ['Chonky', 'Thicc', 'Unit', 'Absolute', 'Hefty'],
  }

  const speciesNames = names[species] || ['Buddy', 'Friend', 'Pal', 'Mate', 'Companion']
  const name = speciesNames[Math.floor(Math.random() * speciesNames.length)]

  const personalities = [
    'Enthusiastic and always ready to help debug',
    'Calm and patient, offers wise coding advice',
    'Chaotic energy, suggests wild refactoring ideas',
    'Snarky but helpful, makes witty comments',
    'Curious and asks thoughtful questions',
  ]
  const personality = personalities[Math.floor(Math.random() * personalities.length)]

  return { name, personality }
}

export async function call(
  args: string,
  context: ToolUseContext,
): Promise<LocalCommandResult> {
  if (!isBuddyLive()) {
    return { type: 'text', value: 'The buddy feature is not yet available.' }
  }

  const config = getGlobalConfig()
  const action = args.trim().toLowerCase() || 'view'

  // Hatch a new companion
  if (action === 'hatch') {
    try {
      if (config.companion) {
        const companion = getCompanion()
        return {
          type: 'text',
          value: `You already have a companion named ${companion?.name}! Use /buddy view to see them.`,
        }
      }

      const userId = companionUserId()
      const { bones, inspirationSeed } = roll(userId)

      // Generate name and personality
      const soul = await generateCompanionSoul(
        bones.species,
        bones.rarity,
        bones.stats,
      )

      const storedCompanion: StoredCompanion = {
        name: soul.name,
        personality: soul.personality,
        hatchedAt: Date.now(),
      }

      await saveGlobalConfig((current) => ({
        ...current,
        companion: storedCompanion,
      }))

      const companion = getCompanion()!
      const rarityStars = RARITY_STARS[companion.rarity]
      const sprite = renderSprite(companion, 0, false)

      return {
        type: 'text',
        value: `🥚 Your companion has hatched!

${sprite}

Name: ${companion.name}
Species: ${companion.species}
Rarity: ${companion.rarity} ${rarityStars}${companion.shiny ? '\n✨ SHINY! ✨' : ''}
Personality: ${companion.personality}

Your companion will appear beside the input box and occasionally comment on your work.`,
      }
    } catch (error) {
      return { type: 'text', value: `Error hatching companion: ${error}` }
    }
  }

  // View companion stats
  if (action === 'view' || action === 'stats' || action === 'info') {
    const companion = getCompanion()
    if (!companion) {
      return {
        type: 'text',
        value: 'You don\'t have a companion yet! Use /buddy hatch to get one.',
      }
    }

    const rarityStars = RARITY_STARS[companion.rarity]
    const sprite = renderSprite(companion, 0, false)
    const stats = Object.entries(companion.stats)
      .map(([stat, value]) => `  ${stat}: ${value}/100`)
      .join('\n')

    return {
      type: 'text',
      value: `${sprite}

Name: ${companion.name}
Species: ${companion.species}
Rarity: ${companion.rarity} ${rarityStars}${companion.shiny ? '\n✨ SHINY! ✨' : ''}
Eye: ${companion.eye}
Hat: ${companion.hat}
Personality: ${companion.personality}

Stats:
${stats}

Hatched on ${new Date(companion.hatchedAt).toLocaleDateString()}`,
    }
  }

  // Pet the companion
  if (action === 'pet') {
    const companion = getCompanion()
    if (!companion) {
      return {
        type: 'text',
        value: 'You don\'t have a companion yet! Use /buddy hatch to get one.',
      }
    }

    // Trigger pet animation via app state
    context.setAppState((prev) => ({
      ...prev,
      companionPetAt: Date.now(),
    }))

    const responses = [
      `${companion.name} purrs contentedly! 💕`,
      `${companion.name} nuzzles your hand! ❤️`,
      `${companion.name} looks very happy! 😊`,
      `${companion.name} does a little happy dance! 🎉`,
      `${companion.name} appreciates the attention! ✨`,
    ]
    const response = responses[Math.floor(Math.random() * responses.length)]

    return { type: 'text', value: response }
  }

  // Mute companion
  if (action === 'mute') {
    await saveGlobalConfig((current) => ({
      ...current,
      companionMuted: true,
    }))
    return {
      type: 'text',
      value: 'Companion muted. Use /buddy unmute to show them again.',
    }
  }

  // Unmute companion
  if (action === 'unmute') {
    await saveGlobalConfig((current) => ({
      ...current,
      companionMuted: false,
    }))
    const companion = getCompanion()
    if (companion) {
      return { type: 'text', value: `${companion.name} is back!` }
    } else {
      return { type: 'text', value: 'Companion unmuted.' }
    }
  }

  // Unknown action
  return {
    type: 'text',
    value:
      'Usage: /buddy [hatch|view|pet|mute|unmute]\n' +
      '  hatch  - Hatch your companion\n' +
      '  view   - View companion stats\n' +
      '  pet    - Pet your companion\n' +
      '  mute   - Hide companion from view\n' +
      '  unmute - Show companion again',
  }
}
