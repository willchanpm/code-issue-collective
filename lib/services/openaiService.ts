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

const ANALYSIS_PROMPT = `You are describing a scanned or uploaded Polaroid photo of a person.

Return JSON with these keys only:
- description
- personality
- nameSuggestion
- narration

The description is the important field for this endpoint. Write 2-4 concise sentences that describe only visible details from the image:
- visible skin colour or complexion
- hair colour and visible hairstyle
- clothing, including colours and notable items
- a general description of the person, such as pose, expression, accessories, and overall appearance

If a required detail is unclear or not visible, say that it is not clearly visible. Do not identify the person, guess ethnicity, or infer sensitive traits beyond visible appearance.

For the other fields, keep them short and derived from the same visible appearance:
- personality: 1 playful sentence about the tamagotchi personality they should have
- nameSuggestion: a cute pet name inspired by the photo
- narration: 1-2 spoken sentences describing the person directly to them`

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

  // Image API (not the old DALL-E API):
  // https://developers.openai.com/api/docs/guides/image-generation
  //
  // GPT Image models always return base64 PNG data in `b64_json`.
  // Do NOT pass `response_format` — that param only worked on dall-e-2/3
  // and causes a 400 "Unknown parameter: response_format" error now.
  const image = await openai.images.generate({
    model: config.openaiImageModel,
    prompt: buildAvatarPrompt(description, mood, label),
    size: '1024x1024',
    quality: 'low',
    output_format: 'png',
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
