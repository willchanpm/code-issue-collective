# Tamagotcha

Turn a polaroid photo of your friend into an interactive tamagotchi.

Built with **Next.js** (App Router) so the UI and API run on one server and deploy cleanly to Vercel.

## Getting started

```bash
git clone https://github.com/willchanpm/code-issue-collective.git
cd code-issue-collective
npm install
cp .env.example .env.local
```

Add your API keys to `.env.local`, then start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `AI_PROVIDER` | `openai` or `gemini` |
| `OPENAI_API_KEY` | Vision + avatar generation when using OpenAI |
| `GEMINI_API_KEY` | Vision + avatar generation when using Gemini |
| `ELEVENLABS_API_KEY` | Spoken descriptions, pet sounds, and theme music |
| `ELEVENLABS_VOICE_ID` | Voice used to describe the photo to the person |

## How the pipeline works

When a photo is taken, the frontend runs **one request at a time**:

1. `POST /api/analyze-photo` — describe the person in the polaroid
2. `POST /api/generate-avatar` — one 8-bit mood sprite per request (8 total)
3. `POST /api/generate-voice` — ElevenLabs narration
4. `POST /api/generate-music` — theme music

This keeps each Vercel function short enough to finish within timeout limits.

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in [vercel.com/new](https://vercel.com/new)
3. Add the environment variables from `.env.example`
4. Deploy

No separate backend service is required.

## Scripts

- `npm run dev` — start Next.js locally
- `npm run build` — production build
- `npm run start` — run the production build

## License

TBD
