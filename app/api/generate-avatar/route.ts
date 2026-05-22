import { getErrorMessage, jsonError } from '@/lib/api-utils'
import { generateAvatar } from '@/lib/services/aiService'
import type { AvatarMood } from '@/lib/types'
import { getAvatarMood } from '@/lib/services/avatarMoods'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      description?: string
      mood?: AvatarMood
    }

    if (!body.description) {
      return jsonError('Missing description', 400)
    }

    if (!body.mood) {
      return jsonError('Missing mood', 400)
    }

    getAvatarMood(body.mood)
    const result = await generateAvatar(body.description, body.mood)
    return Response.json(result)
  } catch (error) {
    return jsonError(getErrorMessage(error, 'Failed to generate avatar'))
  }
}
