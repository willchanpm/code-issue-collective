import { GoogleGenerativeAI } from '@google/generative-ai'
import type {
  GeneratedAvatar,
  PhotoAnalysis,
} from '../../shared/types.ts'
import {
  AVATAR_MOODS,
  buildAvatarPrompt,
} from './avatarMoods.ts'
import { config } from '../config.ts'

function getGeminiClient(): GoogleGenerativeAI {
  if (!config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is required when AI_PROVIDER=gemini')
  }

  return new GoogleGenerativeAI(config.geminiApiKey)
}

const ANALYSIS_PROMPT = `You are helping turn a polaroid photo of a real person into a playful tamagotchi pet.

Describe the person in the photo for a friend who cannot see the image.
Return valid JSON only with keys:
description, personality, nameSuggestion, narration.

- description: 2-3 sentences about appearance and vibe
- personality: 1 sentence about the tamagotchi personality they should have
- nameSuggestion: a cute pet name inspired by the photo
- narration: 2 spoken sentences describing the person directly to them`

export async function analyzePhotoWithGemini(
  imageBase64: string,
  mimeType: string,
): Promise<PhotoAnalysis> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  })

  const result = await model.generateContent([
    ANALYSIS_PROMPT,
    {
      inlineData: {
        data: imageBase64,
        mimeType,
      },
    },
  ])

  const raw = result.response.text()
  if (!raw) {
    throw new Error('Gemini did not return a photo analysis')
  }

  const parsed = JSON.parse(raw) as Omit<PhotoAnalysis, 'provider'>

  return {
    ...parsed,
    provider: 'gemini',
  }
}

export async function generateAvatarsWithGemini(
  description: string,
): Promise<GeneratedAvatar[]> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-preview-image-generation',
    generationConfig: {
      responseModalities: ['Text', 'Image'],
    },
  })

  const avatars: GeneratedAvatar[] = []

  for (const { mood, label } of AVATAR_MOODS) {
    const result = await model.generateContent([
      buildAvatarPrompt(description, mood, label),
    ])

    const parts = result.response.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((part) => part.inlineData?.data)

    if (!imagePart?.inlineData?.data) {
      throw new Error(`Gemini did not return an avatar for mood: ${mood}`)
    }

    avatars.push({
      mood,
      label,
      imageBase64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType ?? 'image/png',
    })
  }

  return avatars
}
