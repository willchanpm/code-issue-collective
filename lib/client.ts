import type {
  AnalyzePhotoResponse,
  AudioResponse,
  FriendRecord,
  GenerateAvatarResponse,
  SaveFriendResponse,
  TamagotchaPipelineResult,
} from '@/lib/types'
import { ACTION_SOUND_PROMPTS, AVATAR_MOODS } from '@/lib/services/avatarMoods'
import type {
  PipelineProgressUpdate,
  PipelineStageId,
} from '@/lib/pipelineProgress'
import { getErrorMessage } from '@/lib/errorUtils'

async function parseJson<T>(response: Response): Promise<T> {
  let payload: T & { error?: unknown; message?: unknown }

  try {
    payload = (await response.json()) as T & { error?: unknown; message?: unknown }
  } catch {
    throw new Error(`Request failed (${response.status} ${response.statusText})`)
  }

  if (!response.ok) {
    // Vercel and some APIs return { error: { message: "..." } } — not a plain string.
    throw new Error(
      getErrorMessage(
        payload.error ?? payload.message ?? payload,
        `Request failed (${response.status})`,
      ),
    )
  }

  return payload
}

export async function analyzePhoto(file: File): Promise<AnalyzePhotoResponse> {
  const formData = new FormData()
  formData.append('photo', file)

  const response = await fetch('/api/analyze-photo', {
    method: 'POST',
    body: formData,
  })

  return parseJson<AnalyzePhotoResponse>(response)
}

export async function generateAvatar(
  description: string,
  mood: (typeof AVATAR_MOODS)[number]['mood'],
): Promise<GenerateAvatarResponse> {
  const response = await fetch('/api/generate-avatar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, mood }),
  })

  return parseJson<GenerateAvatarResponse>(response)
}

export async function generateVoice(text: string): Promise<AudioResponse> {
  const response = await fetch('/api/generate-voice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  return parseJson<AudioResponse>(response)
}

export async function generateSound(prompt: string): Promise<AudioResponse> {
  const response = await fetch('/api/generate-sound', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  return parseJson<AudioResponse>(response)
}

export async function generateMusic(mood: string): Promise<AudioResponse> {
  const response = await fetch('/api/generate-music', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mood }),
  })

  return parseJson<AudioResponse>(response)
}

export async function saveFriend(
  pipeline: TamagotchaPipelineResult,
): Promise<SaveFriendResponse> {
  const response = await fetch('/api/friends', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pipeline),
  })

  return parseJson<SaveFriendResponse>(response)
}

export async function loadFriend(id: string): Promise<FriendRecord> {
  const response = await fetch(`/api/friends/${id}`)
  const payload = await parseJson<{ friend: FriendRecord }>(response)
  return payload.friend
}

export function audioBase64ToUrl(audio: AudioResponse): string {
  return `data:${audio.mimeType};base64,${audio.audioBase64}`
}

// Runs each backend step one at a time so Vercel functions stay within timeout limits.
export async function processPhotoSerial(
  file: File,
  onProgress?: (update: PipelineProgressUpdate) => void,
): Promise<{ pipeline: TamagotchaPipelineResult; friend: SaveFriendResponse }> {
  function setStage(stageId: PipelineStageId, status: PipelineProgressUpdate['status']) {
    onProgress?.({ stageId, status })
  }

  setStage('analyze', 'active')
  const { analysis } = await analyzePhoto(file)
  setStage('analyze', 'done')

  const avatars = []
  for (const { mood, label } of AVATAR_MOODS) {
    const stageId = `avatar-${mood}` as PipelineStageId
    setStage(stageId, 'active')
    const { avatar } = await generateAvatar(analysis.description, mood)
    avatars.push(avatar)
    setStage(stageId, 'done')
  }

  let narrationAudio: AudioResponse | undefined
  let themeMusic: AudioResponse | undefined
  const actionSounds: TamagotchaPipelineResult['actionSounds'] = {}

  try {
    setStage('voice', 'active')
    narrationAudio = await generateVoice(analysis.narration)
    setStage('voice', 'done')

    setStage('music', 'active')
    themeMusic = await generateMusic('happy')
    setStage('music', 'done')

    setStage('sound-idle', 'active')
    actionSounds.idle = await generateSound(ACTION_SOUND_PROMPTS.idle)
    setStage('sound-idle', 'done')

    setStage('sound-pint', 'active')
    actionSounds.pint = await generateSound(ACTION_SOUND_PROMPTS.pint)
    setStage('sound-pint', 'done')

    setStage('sound-dance', 'active')
    actionSounds.dance = await generateSound(ACTION_SOUND_PROMPTS.dance)
    setStage('sound-dance', 'done')
  } catch {
    // Audio is optional if FAL_KEY / ELEVENLABS_API_KEY are not configured yet.
    setStage('voice', narrationAudio ? 'done' : 'skipped')
    setStage('music', themeMusic ? 'done' : 'skipped')
    setStage('sound-idle', actionSounds.idle ? 'done' : 'skipped')
    setStage('sound-pint', actionSounds.pint ? 'done' : 'skipped')
    setStage('sound-dance', actionSounds.dance ? 'done' : 'skipped')
  }

  const pipeline: TamagotchaPipelineResult = {
    analysis,
    avatars,
    narrationAudio,
    themeMusic,
    actionSounds,
  }

  setStage('save', 'active')
  const friend = await saveFriend(pipeline)
  setStage('save', 'done')

  return { pipeline, friend }
}
