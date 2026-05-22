import type { AvatarMood } from '../../shared/types.ts'

// Each mood becomes one 8-bit sprite we can swap in the tamagotchi UI.
export const AVATAR_MOODS: Array<{ mood: AvatarMood; label: string }> = [
  { mood: 'idle', label: 'Idle' },
  { mood: 'happy', label: 'Happy' },
  { mood: 'hungry', label: 'Hungry' },
  { mood: 'sleepy', label: 'Sleepy' },
  { mood: 'eating', label: 'Eating' },
  { mood: 'playing', label: 'Playing' },
  { mood: 'sad', label: 'Sad' },
  { mood: 'surprised', label: 'Surprised' },
]

export function buildAvatarPrompt(
  description: string,
  mood: AvatarMood,
  label: string,
): string {
  return [
    'Create a single character sprite for a retro tamagotchi game.',
    'Style: 8-bit pixel art, limited color palette, transparent-friendly background, centered character, no text, no border, no UI chrome.',
    `Mood: ${label.toLowerCase()} (${mood}).`,
    `Character description: ${description}`,
  ].join(' ')
}
