# Tamagotcha

**Live app:** [https://code-issue-collective.vercel.app/](https://code-issue-collective.vercel.app/)

Turn a Polaroid photo of your friend into a tiny 8-bit companion they can keep on their phone — like a Tamagotchi, but it’s *them*.

> *“I can’t be with you all the time, so here’s a little version of me to carry around.”*

Built for a hackathon demo: scan a QR code on the back of a Polaroid, land on a pixel friend, tap to interact, hear voice lines and chiptune sounds.

---

## What it does today

| Feature | Status |
| --- | --- |
| Mobile-first homepage | ✅ Live on Vercel |
| Take / upload a Polaroid photo | ✅ |
| AI describes the person in the photo | ✅ |
| Generate 8-bit avatar sprites (8 moods) | ✅ |
| ElevenLabs narration + theme music | ✅ (needs API keys) |
| Interactive friend screen (Tap / Pint / Dance) | 🔜 See [TODO.md](./TODO.md) |
| QR code → shareable friend link | 🔜 See [TODO.md](./TODO.md) |

Track full deliverable status in **[Deliverables](./Deliverables)**.  
Hackathon strategy and demo script live in **[PLAN.md](./PLAN.md)**.

---

## Quick start

### Use the live site

Open **[code-issue-collective.vercel.app](https://code-issue-collective.vercel.app/)** on your phone, tap **Take polaroid photo**, and upload a picture.

> Photo processing only works when API keys are configured on Vercel (see below).

### Run locally

```bash
git clone https://github.com/willchanpm/code-issue-collective.git
cd code-issue-collective
npm install
cp .env.example .env.local
```

Add your keys to `.env.local`, then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

Copy `.env.example` → `.env.local` (local) or add the same vars in the [Vercel dashboard](https://vercel.com/dashboard).

| Variable | Required | Purpose |
| --- | --- | --- |
| `AI_PROVIDER` | Yes | `openai` or `gemini` — picks the vision + image provider |
| `OPENAI_API_KEY` | If using OpenAI | Describes the photo and generates 8-bit sprites |
| `GEMINI_API_KEY` | If using Gemini | Same as above, via Google Gemini |
| `ELEVENLABS_API_KEY` | For audio | Narration, pet sounds, and theme music |
| `ELEVENLABS_VOICE_ID` | Optional | Voice for spoken descriptions (default included) |

Without keys, the homepage loads but photo processing will fail.

---

## How the photo pipeline works

When someone uploads a Polaroid, the app runs **one API call at a time** (serialized on purpose — keeps each Vercel function inside timeout limits):

```
Photo upload
    ↓
1. POST /api/analyze-photo     → describe the person (OpenAI or Gemini vision)
    ↓
2. POST /api/generate-avatar   → one 8-bit sprite per mood (×8, serial)
    ↓
3. POST /api/generate-voice    → ElevenLabs reads the description aloud
    ↓
4. POST /api/generate-music    → chiptune-style theme music
    ↓
Results shown on screen (name, description, avatar grid, audio players)
```

### API routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/health` | GET | Check which providers are configured |
| `/api/analyze-photo` | POST | Upload photo → JSON description of the person |
| `/api/generate-avatar` | POST | `{ description, mood }` → one 8-bit sprite |
| `/api/generate-voice` | POST | `{ text }` → ElevenLabs TTS audio |
| `/api/generate-sound` | POST | `{ prompt }` → short pet reaction sound |
| `/api/generate-music` | POST | `{ mood }` → background chiptune audio |

---

## Project structure

```
app/
  page.tsx              ← Homepage (Tamagotcha landing + photo capture)
  api/                  ← Serverless API routes (run on Vercel)
components/
  PhotoCapture.tsx      ← Camera/upload UI + pipeline progress
lib/
  client.ts             ← Frontend fetch helpers (serialized pipeline)
  services/             ← OpenAI, Gemini, ElevenLabs integrations
  types.ts              ← Shared TypeScript types
PLAN.md                 ← Hackathon plan + demo script
Deliverables            ← Checkbox tracker for what’s shipped
TODO.md                 ← Next tasks to finish the demo
```

---

## Tech stack

- **[Next.js 15](https://nextjs.org/)** (App Router) — UI + API in one app
- **[Vercel](https://vercel.com/)** — hosting ([live deploy](https://code-issue-collective.vercel.app/))
- **OpenAI** or **Google Gemini** — vision + 8-bit image generation
- **[ElevenLabs](https://elevenlabs.io/)** — voice, sound effects, music

---

## Deploy to Vercel

Already deployed at **[code-issue-collective.vercel.app](https://code-issue-collective.vercel.app/)**.

To redeploy after pushing to `main`:

1. Repo: [github.com/willchanpm/code-issue-collective](https://github.com/willchanpm/code-issue-collective)
2. Vercel auto-builds from `main`
3. Set environment variables in **Project → Settings → Environment Variables**
4. Redeploy if you changed env vars

No separate backend server is needed — Next.js API routes handle everything.

---

## Demo flow (target)

The end-to-end hackathon demo we’re building toward:

1. Give someone a physical Polaroid
2. They scan the **QR code** on the back
3. Their **8-bit you** appears on their phone
4. They tap **Pint Beer** → sprite changes, sound plays
5. They tap **Dance** → sprite changes, music plays

See **[PLAN.md](./PLAN.md)** for the full pitch script.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start local dev server at `localhost:3000` |
| `npm run build` | Production build (same as Vercel) |
| `npm run start` | Run the production build locally |

---

## License

TBD
