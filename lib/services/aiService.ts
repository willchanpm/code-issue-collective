import type { AvatarMood, PhotoAnalysis } from '@/lib/types'
import { config, getActiveProvider } from '@/lib/config'
import {
  analyzePhotoWithGemini,
  generateAvatarWithGemini,
} from '@/lib/services/geminiService'
import {
  analyzePhotoWithOpenAI,
  generateAvatarWithOpenAI,
} from '@/lib/services/openaiService'

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

export async function generateAvatar(
  description: string,
  mood: AvatarMood,
) {
  const provider = getActiveProvider()
  const avatar =
    provider === 'gemini'
      ? await generateAvatarWithGemini(description, mood)
      : await generateAvatarWithOpenAI(description, mood)

  return { avatar, provider }
}
