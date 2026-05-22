# Tamagotcha

Turn a polaroid photo of your friend into an interactive tamagotchi.

Built as a progressive web app with Vite, React, TypeScript, and a small Express API for AI + audio generation.

## Getting started

```bash
git clone https://github.com/willchanpm/code-issue-collective.git
cd code-issue-collective
npm install
cp .env.example .env
```

Add your API keys to `.env`, then start both the frontend and API server:

```bash
npm run dev
```

Open the local URL Vite prints in your terminal (usually `http://localhost:5173`).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `AI_PROVIDER` | `openai` or `gemini` |
| `OPENAI_API_KEY` | Vision + avatar generation when using OpenAI |
| `GEMINI_API_KEY` | Vision + avatar generation when using Gemini |
| `ELEVENLABS_API_KEY` | Spoken descriptions, pet sounds, and theme music |
| `ELEVENLABS_VOICE_ID` | Voice used to describe the photo to the person |
| `PORT` | API server port (default `3001`) |

## API endpoints

| Endpoint | Purpose |
| --- | --- |
| `POST /api/analyze-photo` | Describe the person in the uploaded polaroid |
| `POST /api/generate-avatars` | Generate 8 mood sprites from the description |
| `POST /api/process-photo` | Run analysis, avatars, narration, and theme music together |
| `POST /api/generate-voice` | ElevenLabs text-to-speech |
| `POST /api/generate-sound` | ElevenLabs short pet reaction sound |
| `POST /api/generate-music` | ElevenLabs chiptune-style background music |

## Scripts

- `npm run dev` — start frontend + API together
- `npm run dev:client` — frontend only
- `npm run dev:server` — API only
- `npm run build` — create a production build
- `npm run preview` — preview the production build locally

## License

TBD
