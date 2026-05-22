import { get, list, put } from '@vercel/blob'
import type { FriendRecord, FriendSummary } from '@/lib/types'

const globalForFriends = globalThis as typeof globalThis & {
  friendStore?: Map<string, FriendRecord>
  friendIndex?: FriendSummary[]
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

const INDEX_PATH = 'friends/index.json'

function canUseBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

export function friendRecordToSummary(record: FriendRecord): FriendSummary {
  const idleAvatar =
    record.avatars.find((avatar) => avatar.mood === 'idle') ?? record.avatars[0]

  return {
    id: record.id,
    name: record.analysis.nameSuggestion,
    createdAt: record.createdAt,
    idleAvatar: {
      imageBase64: idleAvatar.imageBase64,
      mimeType: idleAvatar.mimeType,
    },
  }
}

function sortSummariesNewestFirst(summaries: FriendSummary[]): FriendSummary[] {
  return [...summaries].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  )
}

function mergeSummaries(...groups: FriendSummary[][]): FriendSummary[] {
  const byId = new Map<string, FriendSummary>()

  for (const group of groups) {
    for (const summary of group) {
      byId.set(summary.id, summary)
    }
  }

  return sortSummariesNewestFirst(Array.from(byId.values()))
}

async function readJsonFromBlob<T>(pathname: string): Promise<T | null> {
  const result = await get(pathname, { access: 'private' })

  if (!result || result.statusCode !== 200 || !result.stream) {
    return null
  }

  const text = await new Response(result.stream).text()
  return JSON.parse(text) as T
}

async function loadFriendIndexFromBlob(): Promise<FriendSummary[]> {
  if (!canUseBlobStorage()) {
    return []
  }

  try {
    const index = await readJsonFromBlob<FriendSummary[]>(INDEX_PATH)
    return index ?? []
  } catch {
    return []
  }
}

async function saveFriendIndexToBlob(index: FriendSummary[]): Promise<void> {
  if (!canUseBlobStorage()) {
    return
  }

  await put(INDEX_PATH, JSON.stringify(index), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}

async function getFriendIndex(): Promise<FriendSummary[]> {
  if (globalForFriends.friendIndex) {
    return globalForFriends.friendIndex
  }

  const index = await loadFriendIndexFromBlob()
  globalForFriends.friendIndex = index
  return index
}

async function upsertFriendIndex(record: FriendRecord): Promise<void> {
  const summary = friendRecordToSummary(record)
  const current = await getFriendIndex()
  const next = mergeSummaries([summary], current.filter((entry) => entry.id !== summary.id))

  globalForFriends.friendIndex = next
  await saveFriendIndexToBlob(next)
}

function friendIdFromPathname(pathname: string): string | null {
  const match = pathname.match(/^friends\/(.+)\.json$/)
  if (!match || match[1] === 'index') {
    return null
  }

  return match[1]
}

async function loadSummariesFromBlobListing(
  knownIds: Set<string>,
): Promise<FriendSummary[]> {
  if (!canUseBlobStorage()) {
    return []
  }

  const discovered: FriendSummary[] = []
  let cursor: string | undefined

  do {
    const page = await list({
      prefix: 'friends/',
      cursor,
      limit: 100,
    })

    for (const blob of page.blobs) {
      const id = friendIdFromPathname(blob.pathname)
      if (!id || knownIds.has(id)) {
        continue
      }

      const record = await getFriendRecord(id)
      if (record) {
        discovered.push(friendRecordToSummary(record))
      }
    }

    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)

  return discovered
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

  await upsertFriendIndex(record)
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
    const record = await readJsonFromBlob<FriendRecord>(blobPath(id))

    if (!record) {
      return null
    }

    getMemoryStore().set(id, record)
    return record
  } catch {
    return null
  }
}

export async function listFriendSummaries(): Promise<FriendSummary[]> {
  const memorySummaries = Array.from(getMemoryStore().values()).map(
    friendRecordToSummary,
  )
  const indexSummaries = await getFriendIndex()
  const merged = mergeSummaries(memorySummaries, indexSummaries)
  const knownIds = new Set(merged.map((summary) => summary.id))
  const discovered = await loadSummariesFromBlobListing(knownIds)
  const allSummaries = mergeSummaries(merged, discovered)

  // Keep the index in sync when older friends exist without an index entry yet.
  if (discovered.length > 0) {
    globalForFriends.friendIndex = allSummaries
    await saveFriendIndexToBlob(allSummaries)
  }

  return allSummaries
}

export function createFriendId(): string {
  return crypto.randomUUID().slice(0, 8)
}
