export type AiProvider = 'openai' | 'gemini'

// Demo uses three sprites: default, pint, and dance.
export type AvatarMood = 'idle' | 'pint' | 'dance'

export type FriendAction = AvatarMood

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
  description: string
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

export interface ActionSounds {
  idle?: AudioResponse
  pint?: AudioResponse
  dance?: AudioResponse
}

export interface TamagotchaPipelineResult {
  analysis: PhotoAnalysis
  avatars: GeneratedAvatar[]
  narrationAudio?: AudioResponse
  themeMusic?: AudioResponse
  actionSounds?: ActionSounds
}

export interface FriendRecord extends TamagotchaPipelineResult {
  id: string
  createdAt: string
}

export interface SaveFriendResponse {
  id: string
  sharePath: string
}

export type FriendViewState = 'idle' | 'pint' | 'dance'
