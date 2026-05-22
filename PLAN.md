# Hackathon Plan: Polaroid Pocket Friend

## Summary
Build **Idea 1** as the main demo: a physical Polaroid becomes a gateway to a tiny 8-bit “you” that lives on your friend’s phone like a Tamagotchi. The back of the Polaroid has a QR code. Scanning it opens a Lovable-built web app that shows the pixel character, lets the friend interact with it, and uses ElevenLabs for voice/audio messages.

The emotional pitch: **“I can’t be with you all the time, so here’s a little version of me to carry around.”**

## MVP
- Take or upload a Polaroid/photo.
- Convert it into an 8-bit/pixel avatar.
- Generate a small interactive “Tamagotchi friend” page.
- Include 3-4 interactions:
  - Tap character
  - Feed
  - Cheer up
  - Play memory/song
- Use ElevenLabs for short voice lines from “you.”
- Put a QR code on the back of the Polaroid linking to the app.

## Recommended Team Roles
- **Product/Narrative Lead:** Owns the story, demo script, emotional arc, judging pitch.
- **Frontend/Lovable Lead:** Builds the app UI quickly in Lovable.
- **AI/Image Lead:** Handles photo-to-8-bit avatar pipeline.
- **ElevenLabs Lead:** Creates voice lines, sound effects, background audio.
- **Physical/QR Lead:** Handles Polaroid, QR code, presentation artifact.
- **Demo Wrangler:** Keeps everyone on time, integrates pieces, tests final flow.

If there are fewer people, combine Product + Demo, and Physical + ElevenLabs.

## 20-Minute Planning Sprint
- **Minutes 0-3:** Lock concept: “Polaroid Pocket Friend.”
- **Minutes 3-6:** Assign roles and pick one test photo.
- **Minutes 6-10:** Define app screens:
  - QR landing page
  - Pixel avatar view
  - Interaction buttons
  - Voice/audio playback
- **Minutes 10-14:** Write 5 voice lines:
  - “I miss you already.”
  - “Don’t forget to feed me.”
  - “Play our song?”
  - “I’m proud of you.”
  - “Tap me when you miss me.”
- **Minutes 14-17:** Decide demo path:
  - Show Polaroid
  - Scan QR
  - Avatar appears
  - Tap interaction
  - ElevenLabs voice plays
- **Minutes 17-20:** Each role states first task and blocker.

## Build Approach
Use Lovable for the fastest app build.

Core app prompt:
“Build a mobile-first web app called Pocket Friend. A user scans a QR code from the back of a Polaroid and lands on a cute 8-bit Tamagotchi-style character page. The character is based on a friend’s photo. Include pixel-art styling, interaction buttons for Feed, Play, Cheer Up, and Message. When buttons are tapped, show changing mood states and play short voice/audio clips. Make it feel nostalgic, intimate, and emotionally warm, not like a generic chatbot.”

Image pipeline:
- Fastest: manually create/prompt-generate a pixel avatar from the photo.
- Better if time allows: upload photo, send to image model or filter, return pixel version.
- Hackathon-safe fallback: use a pre-generated pixel avatar and say “photo conversion is the next automated step.”

ElevenLabs pipeline:
- Generate 5 short voice clips.
- Add them as audio files or hosted links in the Lovable app.
- Optional stretch: generate background ambience from “what was happening when the photo was taken.”

## Demo Script
“Before leaving, I take a Polaroid and give it to my friend. But the photo doesn’t just freeze a memory. On the back is a little portal. When they scan it, I become this tiny 8-bit companion they can keep with them. It speaks in my voice, reacts to care, and preserves the feeling of the moment.”

## Stretch Ideas
- Scan Polaroid and recreate background sound/music from the scene.
- Mood changes over time like a real Tamagotchi.
- Friend can record replies.
- Multiple Polaroids create multiple memory pets.
- NFC sticker instead of QR code.

## Assumptions
- Team has 4-6 people.
- Goal is a compelling hackathon demo, not production robustness.
- Lovable is used for the app shell.
- ElevenLabs is used for voice/audio generation.
- The image-to-8-bit flow can be faked or semi-manual for the first demo if needed.
