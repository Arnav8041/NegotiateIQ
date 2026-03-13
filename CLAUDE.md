# NegotiateIQ

Real-time AI negotiation coach. Listens to live conversations via device mic, displays tactical coaching cards on screen. Built for the Gemini Live Agent Challenge hackathon (deadline: March 16, 2026).

## Project Structure

- `frontend/` — Next.js 14 + Tailwind CSS + Framer Motion + lucide-react
- `backend/` — Python FastAPI with WebSocket endpoint
- `deploy.sh` — GCP Cloud Run deployment script
- `Dockerfile` — Backend container for Cloud Run

## Commands

**Frontend:**
```
cd frontend && npm install && npm run dev    # localhost:3000
```

**Backend:**
```
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000
```

## Design System

This project uses a **neo-brutalism** design with light + dark mode. The full design system is in `.claude/skills/neo-brutalism-design/SKILL.md`. ALWAYS follow it for any frontend work.

Key rules:
- Thick black borders (`border-4 border-black`) on everything, in both themes
- Hard offset shadows with zero blur (colored shadows in dark mode)
- `rounded-lg` (8px) on all elements — never sharp, never too round
- Space Grotesk font, weights 700 and 900 only
- Colors: Coral Red `#FF6B6B`, Sunflower Yellow `#FFD93D`, Mint Teal `#4ECDC4`
- Light bg: `#FFFDF5` (cream) / Dark bg: `#1A1A1A` (charcoal)
- Dark mode: `darkMode: "class"` in Tailwind config

## Frontend Architecture

- App Router (src/app/)
- Three app states: setup → active session → summary
- Coaching cards are the core UX — they slide in from right, auto-fade after 10s
- Mobile-first responsive design
- WebSocket connection to backend at `NEXT_PUBLIC_WS_URL`

## Backend Architecture

- FastAPI with async WebSocket at `/ws/session`
- Will connect to Gemini Live API for real-time audio analysis
- Coaching responses come back as JSON: `{ card_type, message, urgency }`
- Backend is intentionally minimal right now — being built incrementally

## Important

- Never commit `.env` or `.env.local` files
- All API keys go in environment variables
- This is a hackathon — prioritize the demo experience above all else
- The primary demo scenario is RENT NEGOTIATION