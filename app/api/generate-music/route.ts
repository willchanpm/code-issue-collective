import { getErrorMessage, jsonError } from '@/lib/api-utils'
import { generatePetMusic } from '@/lib/services/elevenlabsService'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { mood?: string }
    const mood = body.mood ?? 'happy'
    const audio = await generatePetMusic(mood)
    return Response.json(audio)
  } catch (error) {
    return jsonError(getErrorMessage(error, 'Failed to generate music'))
  }
}
