import OpenAI from 'openai'
import type { AvatarMood, GeneratedAvatar, PhotoAnalysis } from '@/lib/types'
import { buildAvatarPrompt, getAvatarMood } from '@/lib/services/avatarMoods'
import { config } from '@/lib/config'

function getOpenAIClient(): OpenAI {
  if (!config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY is required when AI_PROVIDER=openai')
  }

  return new OpenAI({ apiKey: config.openaiApiKey })
}

const ANALYSIS_PROMPT = `You are helping turn a polaroid photo of a real person into a playful tamagotchi pet.

Look at the photo and describe the person in a warm, concise way for a friend who cannot see the image.
Return JSON with:
- description: 2-3 sentences about appearance and vibe
- personality: 1 sentence about the tamagotchi personality they should have
- nameSuggestion: a cute pet name inspired by the photo
- narration: a spoken intro (2 sentences) that describes the person directly to them, like "Hey! I can see your bright smile..."`

export async function analyzePhotoWithOpenAI(
  imageBase64: string,
  mimeType: string,
): Promise<PhotoAnalysis> {
  const openai = getOpenAIClient()
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: ANALYSIS_PROMPT },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
  })

  const raw = response.choices[0]?.message?.content
  if (!raw) {
    throw new Error('OpenAI did not return a photo analysis')
  }

  const parsed = JSON.parse(raw) as Omit<PhotoAnalysis, 'provider'>

  return {
    ...parsed,
    provider: 'openai',
  }
}

export async function generateAvatarWithOpenAI(
  description: string,
  mood: AvatarMood,
): Promise<GeneratedAvatar> {
  const { label } = getAvatarMood(mood)
  const openai = getOpenAIClient()
  const image = await openai.images.generate({
    model: 'dall-e-3',
    size: '1024x1024',
    response_format: 'b64_json',
    prompt: buildAvatarPrompt(description, mood, label),
  })

  const imageBase64 = image.data?.[0]?.b64_json
  if (!imageBase64) {
    throw new Error(`OpenAI did not return an avatar for mood: ${mood}`)
  }

  return {
    mood,
    label,
    imageBase64,
    mimeType: 'image/png',
  }
}
