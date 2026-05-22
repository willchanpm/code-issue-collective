import type { AudioResponse, FriendRecord, TamagotchaPipelineResult } from '@/lib/types'

export function avatarToDataUrl(avatar: {
  imageBase64: string
  mimeType: string
}): string {
  return `data:${avatar.mimeType};base64,${avatar.imageBase64}`
}

export function audioToDataUrl(audio: AudioResponse): string {
  return `data:${audio.mimeType};base64,${audio.audioBase64}`
}

export function getAvatarForMood(
  friend: FriendRecord,
  mood: FriendRecord['avatars'][number]['mood'],
) {
  return friend.avatars.find((avatar) => avatar.mood === mood)
}

export function buildSharePath(id: string): string {
  return `/p/${id}`
}

export function buildShareUrl(id: string, origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}${buildSharePath(id)}`
}

export function pipelineToFriendRecord(
  id: string,
  pipeline: TamagotchaPipelineResult,
): FriendRecord {
  return {
    id,
    createdAt: new Date().toISOString(),
    ...pipeline,
  }
}
