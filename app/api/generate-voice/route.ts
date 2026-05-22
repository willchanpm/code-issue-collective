import { getErrorMessage, jsonError } from '@/lib/api-utils'
import { generateNarrationVoice } from '@/lib/services/elevenlabsService'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text?: string
      voice?: string
      stability?: number
    }
    if (!body.text) {
      return jsonError('Missing text', 400)
    }

    const audio = await generateNarrationVoice(body.text, {
      voice: body.voice,
      stability: body.stability,
    })
    return Response.json(audio)
  } catch (error) {
    return jsonError(getErrorMessage(error, 'Failed to generate voice'))
  }
}
