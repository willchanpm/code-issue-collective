import type {
  GeneratedAvatar,
  PhotoAnalysis,
} from '../../shared/types.ts'
import { config, getActiveProvider } from '../config.ts'
import {
  analyzePhotoWithGemini,
  generateAvatarsWithGemini,
} from './geminiService.ts'
import {
  analyzePhotoWithOpenAI,
  generateAvatarsWithOpenAI,
} from './openaiService.ts'

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

export async function generateAvatars(
  description: string,
): Promise<{ avatars: GeneratedAvatar[]; provider: typeof config.aiProvider }> {
  const provider = getActiveProvider()
  const avatars =
    provider === 'gemini'
      ? await generateAvatarsWithGemini(description)
      : await generateAvatarsWithOpenAI(description)

  return { avatars, provider }
}
