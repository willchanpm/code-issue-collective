export type AiProvider = 'openai' | 'gemini'

export type AvatarMood =
  | 'idle'
  | 'happy'
  | 'hungry'
  | 'sleepy'
  | 'eating'
  | 'playing'
  | 'sad'
  | 'surprised'

export interface PhotoAnalysis {
  description: string
  personality: string
  nameSuggestion: string
  narration: string
  provider: AiProvider
}

export interface GeneratedAvatar {
  mood: AvatarMood
  label: string
  imageBase64: string
  mimeType: string
}

export interface AnalyzePhotoResponse {
  analysis: PhotoAnalysis
}

export interface GenerateAvatarResponse {
  avatar: GeneratedAvatar
  provider: AiProvider
}

export interface AudioResponse {
  audioBase64: string
  mimeType: string
}

export interface TamagotchaPipelineResult {
  analysis: PhotoAnalysis
  avatars: GeneratedAvatar[]
  narrationAudio?: AudioResponse
  themeMusic?: AudioResponse
}

export type PipelineStep =
  | 'analyzing'
  | 'generating-avatar'
  | 'generating-voice'
  | 'generating-music'
  | 'ready'
