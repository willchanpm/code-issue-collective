import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AvatarMood, GeneratedAvatar, PhotoAnalysis } from '@/lib/types'
import { buildAvatarPrompt, getAvatarMood } from '@/lib/services/avatarMoods'
import { clampVoiceStability, normalizeFalVoice, VOICE_SELECTION_PROMPT } from '@/lib/services/voiceProfiles'
import { config } from '@/lib/config'

function getGeminiClient(): GoogleGenerativeAI {
  if (!config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is required when AI_PROVIDER=gemini')
  }

  return new GoogleGenerativeAI(config.geminiApiKey)
}

const ANALYSIS_PROMPT = `You are describing a scanned or uploaded Polaroid photo of a person.

Return valid JSON only with keys:
description, personality, nameSuggestion, narration, voice, voiceStability.

The description is the important field for this endpoint. Write 2-4 concise sentences that describe only visible details from the image:
- visible skin colour or complexion
- hair colour and visible hairstyle
- clothing, including colours and notable items
- a general description of the person, such as pose, expression, accessories, and overall appearance

If a required detail is unclear or not visible, say that it is not clearly visible. Do not identify the person, guess ethnicity, or infer sensitive traits beyond visible appearance.

For the other fields, keep them short and derived from the same visible appearance:
- personality: 1 playful sentence about the tamagotchi personality they should have
- nameSuggestion: a cute pet name inspired by the photo
${VOICE_SELECTION_PROMPT}`

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
    voice: normalizeFalVoice(parsed.voice),
    voiceStability: clampVoiceStability(parsed.voiceStability),
    provider: 'gemini',
  }
}

export async function generateAvatarWithGemini(
  description: string,
  mood: AvatarMood,
): Promise<GeneratedAvatar> {
  const { label } = getAvatarMood(mood)
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-preview-image-generation',
    generationConfig: {
      // Gemini image generation returns both text and image parts.
      responseModalities: ['Text', 'Image'],
    } as Record<string, unknown>,
  })

  const result = await model.generateContent([
    buildAvatarPrompt(description, mood, label),
  ])

  const parts = result.response.candidates?.[0]?.content?.parts ?? []
  const imagePart = parts.find((part) => part.inlineData?.data)

  if (!imagePart?.inlineData?.data) {
    throw new Error(`Gemini did not return an avatar for mood: ${mood}`)
  }

  return {
    mood,
    label,
    imageBase64: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType ?? 'image/png',
  }
}
