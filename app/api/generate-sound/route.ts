import { getErrorMessage, jsonError } from '@/lib/api-utils'
import { generatePetSound } from '@/lib/services/elevenlabsService'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { prompt?: string }
    if (!body.prompt) {
      return jsonError('Missing prompt', 400)
    }

    const audio = await generatePetSound(body.prompt)
    return Response.json(audio)
  } catch (error) {
    return jsonError(getErrorMessage(error, 'Failed to generate sound'))
  }
}
