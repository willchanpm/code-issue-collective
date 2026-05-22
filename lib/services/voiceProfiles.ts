// ElevenLabs voices exposed through FAL's eleven-v3 model.
// We ask the vision AI to pick one that fits the avatar's vibe.
export const FAL_TTS_VOICES = [
  'Rachel',
  'Aria',
  'Roger',
  'Sarah',
  'Laura',
  'Charlie',
  'George',
  'Callum',
  'River',
  'Liam',
  'Charlotte',
  'Alice',
  'Matilda',
  'Will',
  'Jessica',
  'Eric',
  'Chris',
  'Brian',
  'Daniel',
  'Lily',
  'Bill',
] as const

export type FalTtsVoice = (typeof FAL_TTS_VOICES)[number]

export interface NarrationVoiceOptions {
  voice: string
  // Lower = more expressive, higher = steadier delivery.
  stability: number
}

// If someone passes an unknown voice name, fall back to Rachel.
export function normalizeFalVoice(voice?: string): FalTtsVoice {
  if (voice && FAL_TTS_VOICES.includes(voice as FalTtsVoice)) {
    return voice as FalTtsVoice
  }

  return 'Rachel'
}

// Direct ElevenLabs API uses voice IDs, not names — map the chosen name when we can.
const ELEVENLABS_VOICE_IDS: Partial<Record<FalTtsVoice, string>> = {
  Rachel: '21m00Tcm4TlvDq8ikWAM',
  Aria: '9BWtsMINqrJLrRacNV9K',
  Roger: 'CwhRBWXzGAHq8TQ4Fs17',
  Sarah: 'EXAVITQu4vr4xnSDxMaL',
  Laura: 'FGY2WhTYpPnrIDTdsKH5',
  Charlie: 'IKne3meq5aSn9XLyUdCD',
  George: 'JBFqnCBsdqRMF9wK9vDL',
  Callum: 'N2lVS1w4EtoT3dr4eOWO',
  River: 'SAz9YHcvj6GT2YYXdXww',
  Liam: 'TX3LPaxmHKxFdv7VOQHJ',
  Charlotte: 'XB0fDUnXU5powFXDhCwa',
  Alice: 'Xb7hH8MSUJpSbSDYk0k2',
  Matilda: 'XrExE9yKIg1WjnnlVkGX',
  Will: 'bIHbv24MWmeRgasZH58o',
  Jessica: 'cgSgspJ2msm6clMCkdW9',
  Eric: 'cjVigY5qzO86Huf0OWal',
  Chris: 'iP95p4xoKVk53GoZ742B',
  Brian: 'nPczCjzI2devNBz1zQrb',
  Daniel: 'onwK4e9ZLuTAKqWW03F9',
  Lily: 'pFZP5JQG7iQjIQuC4Bku',
  Bill: 'pqHfZKP75CvOlQylNhV4',
}

export function getElevenLabsVoiceId(voice?: string, fallbackId?: string): string {
  const normalized = normalizeFalVoice(voice)
  return ELEVENLABS_VOICE_IDS[normalized] ?? fallbackId ?? ELEVENLABS_VOICE_IDS.Rachel!
}

export function clampVoiceStability(stability?: number): number {
  if (typeof stability !== 'number' || Number.isNaN(stability)) {
    return 0.45
  }

  return Math.min(1, Math.max(0, stability))
}

// Shared prompt snippet so OpenAI + Gemini pick voices the same way.
export const VOICE_SELECTION_PROMPT = `Also pick a voice that matches this tamagotchi's visible energy, expression, and personality.
- voice: choose exactly one name from this list: ${FAL_TTS_VOICES.join(', ')}
- voiceStability: number from 0.3 to 0.7 (lower = more playful/expressive, higher = calmer/steadier)
- narration: 1-2 spoken sentences to the person, prefixed with one ElevenLabs v3 audio tag in square brackets that fits their vibe (examples: [cheerful], [warm], [excited], [playful], [soft], [confident]). Example: "[cheerful] Hey there, good to see you again!"

Do not choose voice based on ethnicity, nationality, or gender stereotypes. Use visible energy, expression, pose, clothing vibe, and the tamagotchi personality instead.`
