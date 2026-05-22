import { get, put } from '@vercel/blob'
import type { FriendRecord } from '@/lib/types'

const globalForFriends = globalThis as typeof globalThis & {
  friendStore?: Map<string, FriendRecord>
}

function getMemoryStore(): Map<string, FriendRecord> {
  if (!globalForFriends.friendStore) {
    globalForFriends.friendStore = new Map()
  }
  return globalForFriends.friendStore
}

function blobPath(id: string): string {
  return `friends/${id}.json`
}

function canUseBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

export async function saveFriendRecord(
  record: FriendRecord,
): Promise<FriendRecord> {
  getMemoryStore().set(record.id, record)

  if (canUseBlobStorage()) {
    // Private Blob stores must use access: 'private' (public stores use 'public').
    await put(blobPath(record.id), JSON.stringify(record), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    })
  }

  return record
}

export async function getFriendRecord(id: string): Promise<FriendRecord | null> {
  const cached = getMemoryStore().get(id)
  if (cached) {
    return cached
  }

  if (!canUseBlobStorage()) {
    return null
  }

  try {
    // Private blobs can't be fetched via a public URL — use the SDK instead.
    const result = await get(blobPath(id), { access: 'private' })

    if (!result || result.statusCode !== 200 || !result.stream) {
      return null
    }

    const text = await new Response(result.stream).text()
    const record = JSON.parse(text) as FriendRecord
    getMemoryStore().set(id, record)
    return record
  } catch {
    return null
  }
}

export function createFriendId(): string {
  return crypto.randomUUID().slice(0, 8)
}
