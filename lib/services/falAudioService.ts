import { fal } from '@fal-ai/client'
import type { AudioResponse } from '@/lib/types'
import { assertFalConfigured, config } from '@/lib/config'

// These model IDs match the Python scripts:
// - tts.py      → fal-ai/elevenlabs/tts/eleven-v3
// - effects.py  → fal-ai/elevenlabs/sound-effects/v2
const TTS_MODEL = 'fal-ai/elevenlabs/tts/eleven-v3'
const SOUND_EFFECTS_MODEL = 'fal-ai/elevenlabs/sound-effects/v2'

type FalFile = {
  url: string
  content_type?: string
}

type FalAudioResult = {
  audio: FalFile
}

// Tell the FAL client which API key to use (reads FAL_KEY from env by default).
function configureFalClient(): void {
  if (config.falKey) {
    fal.config({ credentials: config.falKey })
  }
}

// FAL returns a hosted URL — we download it and convert to base64 for the app.
async function fetchAudioAsBase64(
  url: string,
  mimeType?: string,
): Promise<AudioResponse> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download audio from FAL: ${response.statusText}`)
  }

  const buffer = await response.arrayBuffer()
  return {
    audioBase64: Buffer.from(buffer).toString('base64'),
    mimeType: mimeType ?? response.headers.get('content-type') ?? 'audio/mpeg',
  }
}

// Shared helper: call a FAL model and return audio in our app's format.
async function generateFalAudio(
  model: string,
  input: Record<string, unknown>,
): Promise<AudioResponse> {
  assertFalConfigured()
  configureFalClient()

  const result = await fal.subscribe(model, { input })
  const data = result.data as FalAudioResult

  if (!data.audio?.url) {
    throw new Error('FAL did not return an audio URL')
  }

  return fetchAudioAsBase64(data.audio.url, data.audio.content_type)
}

export async function generateNarrationVoice(text: string): Promise<AudioResponse> {
  return generateFalAudio(TTS_MODEL, {
    text,
    voice: config.falVoice,
  })
}

export async function generatePetSound(prompt: string): Promise<AudioResponse> {
  return generateFalAudio(SOUND_EFFECTS_MODEL, {
    text: prompt,
    duration_seconds: 2,
    prompt_influence: 0.35,
  })
}

export async function generatePetMusic(mood: string): Promise<AudioResponse> {
  return generateFalAudio(SOUND_EFFECTS_MODEL, {
    text: `8-bit tamagotchi background music, cute and nostalgic, ${mood} mood, simple chiptune loop`,
    duration_seconds: 8,
    prompt_influence: 0.5,
  })
}
