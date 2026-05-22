import { config } from '@/lib/config'

export const runtime = 'nodejs'

export async function GET() {
  return Response.json({
    ok: true,
    aiProvider: config.aiProvider,
    hasOpenAI: Boolean(config.openaiApiKey),
    hasGemini: Boolean(config.geminiApiKey),
    hasFal: Boolean(config.falKey),
    hasElevenLabs: Boolean(config.elevenLabsApiKey),
    audioProvider: config.falKey ? 'fal' : config.elevenLabsApiKey ? 'elevenlabs' : null,
    hasBlobStorage: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  })
}
