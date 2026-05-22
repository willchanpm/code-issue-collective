import { config } from '@/lib/config'

export const runtime = 'nodejs'

export async function GET() {
  return Response.json({
    ok: true,
    aiProvider: config.aiProvider,
    hasOpenAI: Boolean(config.openaiApiKey),
    hasGemini: Boolean(config.geminiApiKey),
    hasElevenLabs: Boolean(config.elevenLabsApiKey),
  })
}
