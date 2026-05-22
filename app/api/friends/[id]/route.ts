import { getErrorMessage, jsonError } from '@/lib/api-utils'
import { getFriendRecord } from '@/lib/friendStore'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params
    const record = await getFriendRecord(id)

    if (!record) {
      return jsonError('Friend not found', 404)
    }

    return Response.json({ friend: record })
  } catch (error) {
    return jsonError(getErrorMessage(error, 'Failed to load friend'))
  }
}
