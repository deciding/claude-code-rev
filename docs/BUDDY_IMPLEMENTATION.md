# Buddy Command Implementation

## Overview

The `/buddy` command has been successfully implemented to enable the companion feature in Claude Code. This allows users to hatch and interact with a coding companion that appears in the terminal UI.

## Files Created

1. **`src/commands/buddy/index.ts`** - Command registration
2. **`src/commands/buddy/buddy.ts`** - Command implementation

## Features Implemented

### Commands

- **`/buddy hatch`** - Hatch your first companion
  - Generates a deterministic companion based on your user ID
  - Creates a unique name and personality
  - Shows species, rarity (common/uncommon/rare/epic/legendary), stats, and appearance
  
- **`/buddy view`** (or `stats`, `info`) - View your companion's details
  - Displays ASCII art sprite
  - Shows all stats: DEBUGGING, PATIENCE, CHAOS, WISDOM, SNARK
  - Shows rarity, species, eye style, hat, and personality
  
- **`/buddy pet`** - Pet your companion
  - Triggers heart animation in the UI
  - Shows a random affectionate response
  
- **`/buddy mute`** - Hide companion from view
  - Companion won't appear beside the input box
  
- **`/buddy unmute`** - Show companion again
  - Re-enables companion visibility

## How It Works

### Companion Generation

Companions are **deterministically generated** from your user ID using a seeded random number generator:

- **Species**: 18 types (duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk)
- **Rarity**: Weighted random (60% common, 25% uncommon, 10% rare, 4% epic, 1% legendary)
- **Stats**: 5 stats (0-100) with one peak stat and one dump stat
- **Appearance**: Eye style, hat (based on rarity), 1% chance of shiny
- **Soul**: Name and personality (currently simple random, can be enhanced with LLM generation)

### Storage

Only the "soul" (name, personality, hatchedAt) is stored in `~/.claude/config.json`:

```json
{
  "companion": {
    "name": "Quackers",
    "personality": "Enthusiastic and always ready to help debug",
    "hatchedAt": 1234567890
  },
  "companionMuted": false
}
```

The "bones" (species, rarity, stats, appearance) are regenerated from your user ID each time, ensuring consistency.

## Integration Points

- **AppState**: Uses `companionPetAt` timestamp to trigger heart animations
- **CompanionSprite**: Renders the ASCII art companion beside the input box
- **Config**: Stores companion data persistently
- **Feature Flag**: Gated behind `BUDDY` feature flag (build-time)

## Testing

The command compiles successfully and is registered in the command list. To test:

```bash
bun run dev
# Then type:
/buddy hatch
/buddy view
/buddy pet
```

## Future Enhancements

1. **LLM-generated names/personalities** - Use AI to generate unique companion souls based on species/rarity/stats
2. **More interactions** - Feed, train, level up
3. **Companion reactions** - Context-aware comments on code changes
4. **Achievements** - Unlock special hats or appearances
5. **Trading/sharing** - Share companion stats with friends

## Notes

- The BUDDY feature is currently behind a feature flag and has a teaser window (April 1-7, 2026)
- The companion appears in the terminal UI beside the input box when not muted
- All visual rendering is handled by existing `CompanionSprite.tsx` component
