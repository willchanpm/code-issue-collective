# Tamagotcha — TODO

Action list derived from `PLAN.md` and `Deliverables`. Work top to bottom; later items often depend on earlier ones.

---

## Phase 1 — Align AI output with demo needs

- [ ] Replace generic avatar moods with demo-specific sprites: **idle**, **pint glass**, **dancing** (keep others as stretch)
- [ ] Update `buildAvatarPrompt()` so pint/dance prompts mention props clearly (pint glass, dance pose)
- [ ] Trim avatar pipeline to 3 core moods first (faster demo), add extras if time allows
- [ ] Store generated avatars + analysis per friend (even localStorage or a simple `?id=` route is fine for hackathon)

---

## Phase 2 — Interactive character screen

- [ ] After photo processing, navigate to a **friend page** (e.g. `/friend/[id]`) instead of showing a raw results grid
- [ ] Show one large 8-bit character sprite (default: idle)
- [ ] Swap sprite when the user taps an action (idle → pint → dance)
- [ ] Add mobile-friendly action buttons:
  - [ ] **Tap / Message** — play a short voice line
  - [ ] **Pint Beer** — swap to pint sprite + play pint sound
  - [ ] **Dance** — swap to dance sprite + play dance music/sfx
- [ ] Add simple mood feedback text (“Cheers!”, “Let’s dance!”, etc.)

---

## Phase 3 — Audio (ElevenLabs)

- [ ] Generate and cache 3 action sounds during setup (or on first button tap):
  - [ ] Idle / tap reaction
  - [ ] Pint Beer
  - [ ] Dance
- [ ] Wire each button to the correct cached audio (avoid re-calling ElevenLabs on every tap during demo)
- [ ] Optional: pre-generate 5 voice lines from `PLAN.md` (“I miss you already”, etc.) for Message button

---

## Phase 4 — QR + shareable link

- [ ] Deploy to Vercel and copy the production URL
- [ ] Add a **QR landing route** (e.g. `/p/[id]`) that loads a friend’s character without re-uploading a photo
- [ ] Generate QR code PNG/SVG linking to that URL (use any QR library or qr-code generator)
- [ ] Print or stick QR on the back of the physical Polaroid

---

## Phase 5 — Creator flow (person making the Polaroid)

- [ ] Keep homepage as the **creator** flow: take Polaroid photo → run AI pipeline
- [ ] Show share link + QR preview after processing completes
- [ ] Copy-to-clipboard button for the friend’s link

---

## Phase 6 — Demo polish

- [ ] Write final 30–60 second pitch (use demo script in `PLAN.md`)
- [ ] Test full flow on a real phone: scan QR → character loads → pint → dance → sound
- [ ] Add loading / error states so the demo doesn’t break live
- [ ] Prepare fallback: pre-generated avatar + audio if API keys fail on the day

---

## Phase 7 — Stretch (if time)

- [ ] Background ambience from “what was happening in the photo”
- [ ] Tamagotchi-style hunger/happiness meter over time
- [ ] Friend can record a reply
- [ ] Multiple Polaroids → multiple pets
- [ ] NFC sticker instead of QR

---

## Suggested order for this weekend

1. Phase 1 — pint + dance sprites  
2. Phase 2 — character screen + buttons  
3. Phase 3 — wire audio to buttons  
4. Phase 4 — QR + deploy  
5. Phase 5 — creator share flow  
6. Phase 6 — rehearse demo  

---

## Blockers to resolve early

- [ ] Add API keys to `.env.local` (OpenAI or Gemini + ElevenLabs)
- [ ] Confirm Vercel env vars match `.env.example`
- [ ] Pick one test Polaroid photo for the whole team
- [ ] Assign: who owns QR/physical Polaroid, who owns demo script
