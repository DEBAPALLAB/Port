# Live portfolio voice

The “Meet the person” section hosts a live AI guide, using the requested `gemini-3.1-flash-live-preview` model and the Orus voice. It is a synthetic guide based on Debapallab’s public portfolio, not a recording or voice clone. No avatar is implemented in this change.

## Local setup

Add this to the existing, gitignored `.env.local`:

```dotenv
GEMINI_API_KEY=your_google_ai_studio_key
```

Run `npm run dev` and open `http://127.0.0.1:5173/#connect`. The local endpoint reads environment files on each request, so adding the key does not require restarting Vite. The readiness endpoint returns only a boolean. Never prefix the key with `VITE_`; Vite exposes those variables to the browser.

Optional: `GEMINI_VOICE=Orus`. Supported choices in this application are Orus, Puck, Kore, Charon, Fenrir, Aoede, Leda and Zephyr. The model is deliberately fixed to the one requested. Microphone use requires localhost or HTTPS and a browser with Web Audio/AudioWorklet support.

## Production

The existing Vercel project serves `api/voice-session.js` as a Node function. Add `GEMINI_API_KEY` to the appropriate Vercel environment and redeploy. `vite preview` serves the built static frontend only; use `npm run dev` locally or Vercel for the API. A generic static-only host needs a server for this endpoint.

The endpoint issues a one-use token with a 60-second connection window and a five-minute expiry. The complete session setup is constrained on the server, including the model, voice, system instruction, response limits and tools. Only the short-lived token goes to the browser. Microphone and playback audio then stream directly between the visitor and Gemini. The site does not save transcripts or audio; the transcript remains in the current React session until another conversation or page unload. Google’s own data handling is separate.

POST requests require a matching Origin/Host, with `VOICE_ALLOWED_ORIGINS` available for an explicit comma-separated allowlist. The endpoint has a best-effort per-IP, per-server-instance limit of five session attempts per ten minutes. This is not a distributed abuse control: configure Vercel Firewall rate rules and the Gemini project’s usage limits for a public launch. There is no durable API key in the client bundle.

## Conversation behavior

- “Start a conversation” requests microphone access after checking service readiness. “Just listen”, starter questions and typed questions work without microphone permission.
- The microphone sends mono 16 kHz PCM16 little-endian audio in 20 ms chunks. A worklet performs streaming resampling at the actual device sample rate.
- Gemini’s 24 kHz PCM replies are scheduled contiguously in Web Audio. Interruption stops all queued playback. Transcripts and every audio part in a message are handled independently.
- Microphone mute disables tracks and flushes the input stream; sound mute changes playback gain. Ending, cancelling, leaving the tab, navigating away or unmounting releases tracks, worklets, sockets, timers and audio contexts. A late permission result after cancellation is immediately stopped.
- Sessions end at four minutes or after a quiet period. Network failures have an explicit restart path. No automatic reconnection silently reactivates a microphone.
- Tools can display only allowlisted project or About links. They cannot navigate, open windows, send emails or execute arbitrary instructions.

`server/voicePersona.js` defines the delivery and boundaries. `server/voiceProjectNotes.js` contains factual decision notes and contribution credits from the published case studies; update it when those records change. The guide explicitly distinguishes team work, internship work, explanatory simulations and unbuilt concepts.

## Future avatar connection

`VoiceExperience` accepts an optional `onAudioFrame({ amplitude, speaking, input })` callback. `amplitude` is derived from actual outgoing audio, normalized to 0–1. Bind this to a future avatar’s mouth or speech blend shape. The callback resets on stop/unmount. The canvas is currently an audio meter, not an avatar or simulated lip sync.

## Verification

```sh
npm test
npm run build
npm run check:voice
npm run check:voice:live
```

`check:voice` uses a fixture provider exclusively inside the browser test, with real Web Audio, a fake browser microphone device and the actual AudioWorklet/PCM path. It checks responsive layout, missing-key UI, captions, typed questions, project links, microphone mute, sound mute, track cleanup and permission recovery. It makes no Gemini calls. Screenshots are saved to `.taste-skill/voice-experience/`.

`check:voice:live` requires the real key. It mints a constrained token, requests one short spoken introduction, verifies audio plus transcription and writes `.tmp/voice-live/reply.wav` for listening. It does not use the microphone and never prints credentials. Fixture tests cannot verify Gemini’s actual voice, latency or account/model availability.

Implementation references: [requested model](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-live-preview), [Live WebSocket protocol](https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket), [ephemeral tokens](https://ai.google.dev/gemini-api/docs/live-api/ephemeral-tokens), [REST token schema](https://ai.google.dev/api/generate-content), [voice, transcription and interruption](https://ai.google.dev/gemini-api/docs/live-api/capabilities).
