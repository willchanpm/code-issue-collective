import type {
  AnalyzePhotoResponse,
  AudioResponse,
  AvatarMood,
  GenerateAvatarResponse,
  PipelineStep,
  TamagotchaPipelineResult,
} from '@/lib/types'
import { AVATAR_MOODS } from '@/lib/services/avatarMoods'

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string }
  if (!response.ok) {
    throw new Error(payload.error ?? 'Request failed')
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
  mood: AvatarMood,
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

export async function generateMusic(mood: string): Promise<AudioResponse> {
  const response = await fetch('/api/generate-music', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mood }),
  })

  return parseJson<AudioResponse>(response)
}

export function audioBase64ToUrl(audio: AudioResponse): string {
  return `data:${audio.mimeType};base64,${audio.audioBase64}`
}

// Runs each backend step one at a time so Vercel functions stay within timeout limits.
export async function processPhotoSerial(
  file: File,
  onStep?: (step: PipelineStep, detail?: string) => void,
): Promise<TamagotchaPipelineResult> {
  onStep?.('analyzing')
  const { analysis } = await analyzePhoto(file)

  const avatars = []
  for (const { mood, label } of AVATAR_MOODS) {
    onStep?.('generating-avatar', label)
    const { avatar } = await generateAvatar(analysis.description, mood)
    avatars.push(avatar)
  }

  let narrationAudio: AudioResponse | undefined
  let themeMusic: AudioResponse | undefined

  try {
    onStep?.('generating-voice')
    narrationAudio = await generateVoice(analysis.narration)
    onStep?.('generating-music')
    themeMusic = await generateMusic('happy')
  } catch {
    // Audio is optional if ElevenLabs is not configured yet.
  }

  onStep?.('ready')
  return { analysis, avatars, narrationAudio, themeMusic }
}
