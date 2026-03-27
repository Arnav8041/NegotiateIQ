# NegotiateIQ

**Your real-time AI negotiation coach.**

NegotiateIQ listens to your live negotiations and shows you tactical coaching cards on screen -- like having a negotiation expert passing you notes during a high-stakes conversation.

> Built for the **Gemini Live Agent Challenge** hackathon -- Powered by Gemini Live API on Google Cloud

---

## What It Does

1. You open the app and describe your situation (e.g. "My landlord wants to raise rent from $1,400 to $1,650")
2. You start your negotiation -- phone call, video call, in-person -- with the app open nearby
3. The app listens via your device mic and shows coaching cards in real-time:
   - **Counter-moves** -- what to say next
   - **Tactic alerts** -- when the other party uses anchoring, false deadlines, etc.
   - **Market data** -- rent comps, salary benchmarks pulled live
   - **Silence cues** -- when to stop talking and let silence work for you
   - **Reinforcement** -- when you are doing great
4. After the conversation: a full recap with tactics detected, offers tracked, and next steps

---

## Live URLs

| Endpoint | URL |
|----------|-----|
| **Backend API** | `<YOUR_CLOUD_RUN_URL>` |
| **Health Check** | `<YOUR_CLOUD_RUN_URL>/health` |
| **API Docs (Swagger)** | `<YOUR_CLOUD_RUN_URL>/docs` (disabled in production) |

---

## Reproducible Testing Instructions

### Option A: Quick Test (No Setup Required)

1. Open the health endpoint in your browser:
   ```
   <YOUR_CLOUD_RUN_URL>/health
   ```
   You should see `{"healthy": true}`.

2. Test the setup endpoint with curl (API key required):
   ```bash
   curl -X POST <YOUR_CLOUD_RUN_URL>/api/setup \
     -H "Content-Type: application/json" \
     -H "X-API-Key: your-api-key" \
     -d '{
       "scenario": "rent",
       "context": "My landlord wants to raise rent from $1,400 to $1,650. I have been a tenant for 3 years with no late payments."
     }'
   ```

### Option B: Run Locally (Full Experience)

**Prerequisites:** Node.js 18+, Python 3.11+, a Gemini API key, Chrome or Edge browser

1. Clone the repo:
   ```bash
   git clone https://github.com/arnav-nayak/negotiate-iq.git
   cd negotiate-iq
   ```

2. Start the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate       # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
   Create a `.env` file in the `backend/` directory (see `backend/.env.example`):
   ```
   GOOGLE_API_KEY=your-gemini-api-key
   NEGOTIATEIQ_API_KEY=your-client-api-key
   ALLOWED_ORIGINS=http://localhost:3000
   ```
   Then run the server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

3. Start the frontend (in a separate terminal):
   ```bash
   cd frontend
   npm install
   npm run dev                    # -> http://localhost:3000
   ```
   Create a `.env.local` file in the `frontend/` directory:
   ```
   NEXT_PUBLIC_API_KEY=your-client-api-key
   ```
   The frontend defaults to `ws://localhost:8000/ws/session` for the backend URL.

4. Walk through the full experience:
   - Open `http://localhost:3000` in Chrome
   - Select a negotiation scenario (e.g. Rent)
   - Add any additional context about your situation
   - Click the microphone button and allow mic access
   - Speak as if you are in a negotiation -- coaching cards will appear in real-time
   - Click **Done** when finished to see the post-session summary

5. **Demo mode** (no backend needed):
   - Open `http://localhost:3000/demo`
   - Press **Spacebar** to advance to the next coaching card
   - Press **D** to trigger the done/summary view
   - This mode runs entirely in the browser with no backend connection

### Option C: Deploy Your Own

```bash
export GOOGLE_CLOUD_PROJECT=your-project-id
# Create the API key secret in Secret Manager
echo -n "your-gemini-api-key" | gcloud secrets create google-api-key --data-file=-
# Deploy
bash deploy.sh
```

---

## Key Features

- **Hybrid AI pipeline** -- Gemini Live API streams audio analysis in real-time, Gemini 2.5 Flash generates structured coaching cards from the transcript
- **3-slot coaching cards** -- Up to three cards visible at once; oldest card fades out as new ones arrive, keeping the screen uncluttered during live conversations
- **Rate limiting** -- Cards are throttled so the user is never overwhelmed; minimum interval between card deliveries
- **Voice notes** -- Mic input is captured and streamed over WebSocket to the backend for continuous analysis
- **Post-session summary** -- After clicking Done, a full recap is generated with tactics detected, offers tracked, and recommended next steps
- **Neo-brutalism UI** -- Bold design with thick borders, hard offset shadows, Space Grotesk font, and a coral/yellow/teal color palette in both light and dark mode
- **Demo mode** -- A fully offline demo at `/demo` that cycles through pre-built coaching cards with keyboard controls, no backend or API key needed

---

## Coaching Card Types

| Card Type | Purpose |
|-----------|---------|
| **Tactic Alert** | Flags when the other party uses a known negotiation tactic (anchoring, false deadline, good cop/bad cop, etc.) |
| **Counter-Move** | Suggests what to say or do next in response to the current situation |
| **Data Point** | Provides relevant market data, benchmarks, or comparable figures to strengthen your position |
| **Suggestion** | General strategic advice for improving your negotiating position |
| **Reinforcement** | Positive feedback when you make a strong move or hold firm on a key point |
| **Silence Cue** | Tells you to pause and let silence do the work -- one of the most powerful negotiation tools |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS v4, Framer Motion, lucide-react |
| **Backend** | Python 3.11, FastAPI, WebSocket, AsyncIO |
| **AI** | Gemini Live API (`gemini-2.5-flash-native-audio-latest`), Gemini 2.5 Flash (text) |
| **Cloud** | Google Cloud Run, Artifact Registry, Secret Manager |
| **Frontend Hosting** | Vercel |
| **Design** | Neo-brutalism (Space Grotesk, hard shadows, thick borders) |

---

## Project Structure

```
negotiate-iq/
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── layout.tsx              # Root layout, fonts, theme provider
│       │   ├── page.tsx                # Main app (setup -> session -> summary)
│       │   └── demo/
│       │       └── page.tsx            # Offline demo mode
│       ├── components/
│       │   ├── Hero.tsx                # Landing hero section
│       │   ├── Navbar.tsx              # Top navigation bar
│       │   ├── Setup.tsx               # Scenario selection and context input
│       │   ├── ActiveSession.tsx       # Live session with coaching cards
│       │   ├── DemoSession.tsx         # Demo mode session component
│       │   ├── Summary.tsx             # Post-session recap and analysis
│       │   └── ThemeProvider.tsx        # Light/dark mode provider
│       └── hooks/
│           └── useCoachingSession.ts   # WebSocket connection and session state
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI app, routes, WebSocket endpoint
│   │   ├── gemini_client.py            # Gemini Live API and text API integration
│   │   ├── prompts.py                  # System prompts for coaching card generation
│   │   ├── config.py                   # Environment variables and settings
│   │   ├── auth.py                     # API key authentication dependency
│   │   └── sanitize.py                 # Input sanitization utilities
│   ├── requirements.txt                # Python dependencies
│   └── .env.example                    # Example environment variables
├── deploy.sh                           # One-command GCP Cloud Run deployment
├── Dockerfile                          # Backend container for Cloud Run
├── .env.example                        # Root-level env example
└── docs/
```

---

## Architecture

The system uses a hybrid AI pipeline. Audio from the user's microphone is streamed over a WebSocket connection from the Next.js frontend to the FastAPI backend. The backend forwards the audio stream to the Gemini Live API, which performs real-time speech-to-text and conversational analysis. Transcript segments are then passed to Gemini 2.5 Flash (text model) with negotiation-specific system prompts to generate structured coaching cards. These cards are sent back to the frontend over the same WebSocket connection and rendered as an animated card stack using Framer Motion. When the session ends, a final summary request is made to Gemini to produce a comprehensive recap of the negotiation.

![Architecture Diagram](https://github.com/Arnav8041/NegotiateIQ/blob/7c1c64c1f82072a89844dd4c6a3effec13958ebf/Screenshot%202026-03-16%20185400.png)

---

## Demo

[📹 Demo video]

[NegotiateIQ demo](https://youtu.be/qjwR6wuUp-I)
---

## Security

NegotiateIQ includes the following security controls:

- **API key authentication** -- All HTTP endpoints and WebSocket connections require a valid `X-API-Key` header (or `api_key` query parameter for WebSocket). Set `NEGOTIATEIQ_API_KEY` in your environment.
- **CORS restrictions** -- Only origins listed in `ALLOWED_ORIGINS` can make cross-origin requests. Defaults to `http://localhost:3000` in development.
- **Session isolation** -- Each `/api/setup` call returns a unique `session_id`. WebSocket connections are scoped to their session, preventing cross-user data leakage.
- **Rate limiting** -- WebSocket connections are capped at `MAX_WS_CONNECTIONS` (default 10). Per-connection message rate limits prevent abuse.
- **Input sanitization** -- All user-provided text (context, transcripts) is sanitized and length-limited before being used in LLM prompts. User content is wrapped in XML-style delimiters to defend against prompt injection.
- **Security headers** -- Both backend and frontend set standard security headers (CSP, HSTS, X-Frame-Options, etc.).
- **Non-root Docker** -- The production container runs as a non-root user.
- **Structured logging** -- No stack traces or sensitive data are exposed in HTTP responses.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | Yes | Gemini API key |
| `NEGOTIATEIQ_API_KEY` | Yes (prod) | Client-to-backend auth key |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins (default: `http://localhost:3000`) |
| `ENVIRONMENT` | No | `development` or `production` (default: `development`) |
| `MAX_WS_CONNECTIONS` | No | Max concurrent WebSocket connections (default: `10`) |
| `GEMINI_TIMEOUT_SECONDS` | No | Gemini API call timeout (default: `30`) |

---

## Team

- Arnav Nayak
- Amvi Dwivedi

## License

MIT
