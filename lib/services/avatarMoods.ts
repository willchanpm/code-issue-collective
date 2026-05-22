import type { AvatarMood } from '@/lib/types'

// Three demo sprites — generated one at a time via OpenAI DALL-E.
export const AVATAR_MOODS: Array<{ mood: AvatarMood; label: string }> = [
  { mood: 'idle', label: 'Idle' },
  { mood: 'pint', label: 'Pint' },
  { mood: 'dance', label: 'Dance' },
]

const MOOD_PROMPT_DETAILS: Record<AvatarMood, string> = {
  idle:
    'Standing calmly, friendly neutral pose, hands at sides, soft smile.',
  pint:
    'Holding a pint glass of beer with both hands, cheerful pub vibe, slight lean toward the glass.',
  dance:
    'Mid-dance move, one arm up, happy energetic pose, feet apart like they are dancing at a party.',
}

export function getAvatarMood(mood: AvatarMood) {
  const match = AVATAR_MOODS.find((entry) => entry.mood === mood)
  if (!match) {
    throw new Error(`Unknown avatar mood: ${mood}`)
  }
  return match
}

export function buildAvatarPrompt(
  description: string,
  mood: AvatarMood,
  label: string,
): string {
  return [
    'Create a single character sprite for a retro tamagotchi game.',
    'Style: 8-bit pixel art, limited color palette, plain solid background, centered full-body character, no text, no border, no UI chrome.',
    `Pose: ${MOOD_PROMPT_DETAILS[mood]}`,
    `Mood label: ${label} (${mood}).`,
    `Character description: ${description}`,
  ].join(' ')
}

export const ACTION_SOUND_PROMPTS = {
  idle: 'cute 8-bit tamagotchi chirp when tapped, short happy blip',
  pint: '8-bit beer pour and cheerful clink, retro game sound effect',
  dance: '8-bit dance party chiptune sting, upbeat retro game sfx',
} as const
