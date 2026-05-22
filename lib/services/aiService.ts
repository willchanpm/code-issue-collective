import type {
  GeneratedAvatar,
  PhotoAnalysis,
} from '@/lib/types'
import { config, getActiveProvider } from '@/lib/config'
import {
  analyzePhotoWithGemini,
} from '@/lib/services/geminiService'
import {
  analyzePhotoWithOpenAI,
  generateAvatarWithOpenAI,
} from '@/lib/services/openaiService'
import type { AvatarMood } from '@/lib/types'

export async function analyzePhoto(
  imageBase64: string,
  mimeType: string,
): Promise<PhotoAnalysis> {
  const provider = getActiveProvider()

  if (provider === 'gemini') {
    return analyzePhotoWithGemini(imageBase64, mimeType)
  }

  return analyzePhotoWithOpenAI(imageBase64, mimeType)
}

// Avatar sprites always use OpenAI DALL-E for consistent 8-bit output.
export async function generateAvatar(description: string, mood: AvatarMood) {
  if (!config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY is required for 8-bit avatar generation')
  }

  const avatar = await generateAvatarWithOpenAI(description, mood)
  return { avatar, provider: 'openai' as const }
}
