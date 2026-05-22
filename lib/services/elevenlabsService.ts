import type { AudioResponse } from '@/lib/types'
import {
  assertAudioConfigured,
  assertElevenLabsConfigured,
  config,
  usesFalForAudio,
} from '@/lib/config'
import * as falAudioService from '@/lib/services/falAudioService'
import {
  getElevenLabsVoiceId,
  type NarrationVoiceOptions,
} from '@/lib/services/voiceProfiles'

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

async function generateNarrationVoiceDirect(
  text: string,
  options?: Partial<NarrationVoiceOptions>,
): Promise<AudioResponse> {
  const buffer = await elevenLabsRequest(
    `/text-to-speech/${getElevenLabsVoiceId(options?.voice, config.elevenLabsVoiceId)}`,
    {
      text,
      model_id: 'eleven_multilingual_v2',
    },
  )

  return toAudioResponse(buffer, 'audio/mpeg')
}

async function generatePetSoundDirect(prompt: string): Promise<AudioResponse> {
  const buffer = await elevenLabsRequest('/sound-generation', {
    text: prompt,
    duration_seconds: 2,
    prompt_influence: 0.35,
  })

  return toAudioResponse(buffer, 'audio/mpeg')
}

async function generatePetMusicDirect(mood: string): Promise<AudioResponse> {
  const buffer = await elevenLabsRequest('/sound-generation', {
    text: `8-bit tamagotchi background music, cute and nostalgic, ${mood} mood, simple chiptune loop`,
    duration_seconds: 8,
    prompt_influence: 0.5,
  })

  return toAudioResponse(buffer, 'audio/mpeg')
}

export async function generateNarrationVoice(
  text: string,
  options?: Partial<NarrationVoiceOptions>,
): Promise<AudioResponse> {
  assertAudioConfigured()
  if (usesFalForAudio()) {
    return falAudioService.generateNarrationVoice(text, options)
  }
  return generateNarrationVoiceDirect(text, options)
}

export async function generatePetSound(prompt: string): Promise<AudioResponse> {
  assertAudioConfigured()
  if (usesFalForAudio()) {
    return falAudioService.generatePetSound(prompt)
  }
  return generatePetSoundDirect(prompt)
}

export async function generatePetMusic(mood: string): Promise<AudioResponse> {
  assertAudioConfigured()
  if (usesFalForAudio()) {
    return falAudioService.generatePetMusic(mood)
  }
  return generatePetMusicDirect(mood)
}
