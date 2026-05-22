import cors from 'cors'
import express from 'express'
import { config } from './config.ts'
import { apiRouter } from './routes/api.ts'

const app = express()

app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    aiProvider: config.aiProvider,
    hasOpenAI: Boolean(config.openaiApiKey),
    hasGemini: Boolean(config.geminiApiKey),
    hasElevenLabs: Boolean(config.elevenLabsApiKey),
  })
})

app.use('/api', apiRouter)

app.listen(config.port, () => {
  console.log(`Tamagotcha API listening on http://localhost:${config.port}`)
})
