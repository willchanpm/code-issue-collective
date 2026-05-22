import type {
  AnalyzePhotoResponse,
  AudioResponse,
  GenerateAvatarsResponse,
  TamagotchaPipelineResult,
} from '../../shared/types.ts'

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string }
  if (!response.ok) {
    throw new Error(payload.error ?? 'Request failed')
  }
  return payload
}

export async function processPhoto(file: File): Promise<TamagotchaPipelineResult> {
  const formData = new FormData()
  formData.append('photo', file)

  const response = await fetch('/api/process-photo', {
    method: 'POST',
    body: formData,
  })

  return parseJson<TamagotchaPipelineResult>(response)
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

export async function generateAvatars(
  description: string,
): Promise<GenerateAvatarsResponse> {
  const response = await fetch('/api/generate-avatars', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  })

  return parseJson<GenerateAvatarsResponse>(response)
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

export function audioBase64ToUrl(audio: AudioResponse): string {
  return `data:${audio.mimeType};base64,${audio.audioBase64}`
}
