import type { AiProvider } from '@/lib/types'

export const config = {
  aiProvider: (process.env.AI_PROVIDER ?? 'openai') as AiProvider,
  openaiApiKey: process.env.OPENAI_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
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

export function assertElevenLabsConfigured(): void {
  if (!config.elevenLabsApiKey) {
    throw new Error('ELEVENLABS_API_KEY is required for audio generation')
  }
}

export function getActiveProvider(): AiProvider {
  assertProviderConfigured(config.aiProvider)
  return config.aiProvider
}
