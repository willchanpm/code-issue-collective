import type { AiProvider } from '@/lib/types'

export const config = {
  aiProvider: (process.env.AI_PROVIDER ?? 'openai') as AiProvider,
  openaiApiKey: process.env.OPENAI_API_KEY,
  // GPT Image models replaced DALL-E (see OpenAI image generation guide).
  openaiImageModel: process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-2',
  geminiApiKey: process.env.GEMINI_API_KEY,
  // FAL proxies ElevenLabs TTS + sound effects (see tts.py / effects.py).
  falKey: process.env.FAL_KEY,
  falVoice: process.env.FAL_VOICE ?? 'Rachel',
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
  elevenLabsVoiceId:
    process.env.ELEVENLABS_VOICE_ID ?? '21m00Tcm4TlvDq8ikWAM',
}

export function assertProviderConfigured(provider: AiProvider): void {
  if (provider === 'openai' && !config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY is required when AI_PROVIDER=openai')
  }

  if (provider === 'gemini' && !config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is required when AI_PROVIDER=gemini')
  }
}

export function assertFalConfigured(): void {
  if (!config.falKey) {
    throw new Error('FAL_KEY is required for audio generation')
  }
}

export function assertElevenLabsConfigured(): void {
  if (!config.elevenLabsApiKey) {
    throw new Error('ELEVENLABS_API_KEY is required for audio generation')
  }
}

// Prefer FAL (matches the Python scripts); fall back to direct ElevenLabs.
export function assertAudioConfigured(): void {
  if (config.falKey) {
    return
  }

  assertElevenLabsConfigured()
}

export function usesFalForAudio(): boolean {
  return Boolean(config.falKey)
}

export function getActiveProvider(): AiProvider {
  assertProviderConfigured(config.aiProvider)
  return config.aiProvider
}
