import { put, head } from '@vercel/blob'
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
    await put(blobPath(record.id), JSON.stringify(record), {
      access: 'public',
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
    const blob = await head(blobPath(id))
    const response = await fetch(blob.url)

    if (!response.ok) {
      return null
    }

    const record = (await response.json()) as FriendRecord
    getMemoryStore().set(id, record)
    return record
  } catch {
    return null
  }
}

export function createFriendId(): string {
  return crypto.randomUUID().slice(0, 8)
}
