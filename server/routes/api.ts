import { Router } from 'express'
import multer from 'multer'
import { analyzePhoto, generateAvatars } from '../services/aiService.ts'
import {
  generateNarrationVoice,
  generatePetMusic,
  generatePetSound,
} from '../services/elevenlabsService.ts'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
})

export const apiRouter = Router()

function fileToBase64(file: Express.Multer.File): string {
  return file.buffer.toString('base64')
}

// Step 1 after a photo is taken: describe the person in the image.
apiRouter.post('/analyze-photo', upload.single('photo'), async (req, res) => {
  try {
    const file = req.file
    if (!file) {
      return res.status(400).json({ error: 'Missing photo upload' })
    }

    const analysis = await analyzePhoto(
      fileToBase64(file),
      file.mimetype || 'image/jpeg',
    )

    return res.json({ analysis })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to analyze photo'
    return res.status(500).json({ error: message })
  }
})

// Step 2: turn the described person into a set of 8-bit avatar moods.
apiRouter.post('/generate-avatars', async (req, res) => {
  try {
    const description = req.body?.description as string | undefined
    if (!description) {
      return res.status(400).json({ error: 'Missing description' })
    }

    const result = await generateAvatars(description)
    return res.json(result)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate avatars'
    return res.status(500).json({ error: message })
  }
})

// Convenience route: analyze photo, generate avatars, and create intro audio.
apiRouter.post('/process-photo', upload.single('photo'), async (req, res) => {
  try {
    const file = req.file
    if (!file) {
      return res.status(400).json({ error: 'Missing photo upload' })
    }

    const analysis = await analyzePhoto(
      fileToBase64(file),
      file.mimetype || 'image/jpeg',
    )
    const { avatars } = await generateAvatars(analysis.description)

    let narrationAudio
    let themeMusic

    try {
      narrationAudio = await generateNarrationVoice(analysis.narration)
      themeMusic = await generatePetMusic('happy')
    } catch {
      // Audio is optional during early development if ElevenLabs is not configured.
      narrationAudio = undefined
      themeMusic = undefined
    }

    return res.json({
      analysis,
      avatars,
      narrationAudio,
      themeMusic,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to process photo'
    return res.status(500).json({ error: message })
  }
})

// ElevenLabs voice output for describing the photo to the person.
apiRouter.post('/generate-voice', async (req, res) => {
  try {
    const text = req.body?.text as string | undefined
    if (!text) {
      return res.status(400).json({ error: 'Missing text' })
    }

    const audio = await generateNarrationVoice(text)
    return res.json(audio)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate voice'
    return res.status(500).json({ error: message })
  }
})

// Short reaction sounds for feed/play/sleep actions.
apiRouter.post('/generate-sound', async (req, res) => {
  try {
    const prompt = req.body?.prompt as string | undefined
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' })
    }

    const audio = await generatePetSound(prompt)
    return res.json(audio)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate sound'
    return res.status(500).json({ error: message })
  }
})

// Background chiptune-style music for the pet screen.
apiRouter.post('/generate-music', async (req, res) => {
  try {
    const mood = (req.body?.mood as string | undefined) ?? 'happy'
    const audio = await generatePetMusic(mood)
    return res.json(audio)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate music'
    return res.status(500).json({ error: message })
  }
})
