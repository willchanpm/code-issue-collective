import type { AudioResponse } from '@/lib/types'
import { assertElevenLabsConfigured, config } from '@/lib/config'

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1'

async function elevenLabsRequest(
  path: string,
  body: Record<string, unknown>,
): Promise<ArrayBuffer> {
  assertElevenLabsConfigured()

  const response = await fetch(`${ELEVENLABS_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': config.elevenLabsApiKey ?? '',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`ElevenLabs request failed: ${errorText}`)
  }

  return response.arrayBuffer()
}

function toAudioResponse(buffer: ArrayBuffer, mimeType: string): AudioResponse {
  return {
    audioBase64: Buffer.from(buffer).toString('base64'),
    mimeType,
  }
}

export async function generateNarrationVoice(text: string): Promise<AudioResponse> {
  const buffer = await elevenLabsRequest(
    `/text-to-speech/${config.elevenLabsVoiceId}`,
    {
      text,
      model_id: 'eleven_multilingual_v2',
    },
  )

  return toAudioResponse(buffer, 'audio/mpeg')
}

export async function generatePetSound(prompt: string): Promise<AudioResponse> {
  const buffer = await elevenLabsRequest('/sound-generation', {
    text: prompt,
    duration_seconds: 2,
    prompt_influence: 0.35,
  })

  return toAudioResponse(buffer, 'audio/mpeg')
}

export async function generatePetMusic(mood: string): Promise<AudioResponse> {
  const buffer = await elevenLabsRequest('/sound-generation', {
    text: `8-bit tamagotchi background music, cute and nostalgic, ${mood} mood, simple chiptune loop`,
    duration_seconds: 8,
    prompt_influence: 0.5,
  })

  return toAudioResponse(buffer, 'audio/mpeg')
}
