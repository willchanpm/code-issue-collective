import { getErrorMessage, jsonError } from '@/lib/api-utils'
import {
  createFriendId,
  listFriendSummaries,
  saveFriendRecord,
} from '@/lib/friendStore'
import type { FriendRecord } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Omit<FriendRecord, 'id' | 'createdAt'>

    if (!body.analysis || !body.avatars?.length) {
      return jsonError('Missing friend data', 400)
    }

    const record: FriendRecord = {
      id: createFriendId(),
      createdAt: new Date().toISOString(),
      ...body,
    }

    await saveFriendRecord(record)

    return Response.json({
      id: record.id,
      sharePath: `/p/${record.id}`,
    })
  } catch (error) {
    return jsonError(getErrorMessage(error, 'Failed to save friend'))
  }
}

export async function GET() {
  try {
    const friends = await listFriendSummaries()
    return Response.json({ friends })
  } catch (error) {
    return jsonError(getErrorMessage(error, 'Failed to load friends'))
  }
}
