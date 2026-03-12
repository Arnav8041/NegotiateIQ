# 🎯 NegotiateIQ

**Your real-time AI negotiation coach.**

NegotiateIQ listens to your live negotiations and shows you tactical coaching cards on screen — like having a negotiation expert passing you notes during a high-stakes conversation.

> Built for the **Gemini Live Agent Challenge** hackathon · Powered by Gemini Live API on Google Cloud

---

## What It Does

1. You open the app and describe your situation (e.g. "My landlord wants to raise rent from $1,400 to $1,650")
2. You start your negotiation — phone call, video call, in-person — with the app open nearby
3. The app listens via your device mic and shows coaching cards in real-time:
   - 🎯 **Counter-moves** — what to say next
   - ⚠️ **Tactic alerts** — when the other party uses anchoring, false deadlines, etc.
   - 📊 **Market data** — rent comps, salary benchmarks pulled live
   - 🤫 **Silence cues** — when to stop talking and let silence work for you
   - ✅ **Reinforcement** — when you're doing great
4. After the conversation: a full recap with tactics detected, offers tracked, and next steps

---

## Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 14 · Tailwind CSS · Framer Motion |
| **Backend** | Python FastAPI · WebSocket |
| **AI** | Gemini Live API via Google GenAI SDK |
| **Cloud** | Cloud Run · Vertex AI · Firestore · Secret Manager |

---

## Project Structure

```
negotiate-iq/
├── frontend/           ← Next.js app (UI, mic capture, card display)
│   └── src/
├── backend/            ← FastAPI server (audio streaming, Gemini integration)
│   └── app/
│       └── main.py
├── deploy.sh           ← One-command GCP deployment
├── Dockerfile          ← Cloud Run container
└── docs/
```

---

## Getting Started

### Prerequisites

- **Node.js 18+** and **npm**
- **Python 3.11+**
- A **Google Cloud** account with a **Gemini API key**

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/negotiate-iq.git
cd negotiate-iq
```

### 2. Start the frontend

```bash
cd frontend
npm install
cp .env.example .env.local    # then add your values
npm run dev                    # → http://localhost:3000
```

### 3. Start the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # then add your API key
uvicorn app.main:app --reload --port 8000
```

### 4. Deploy to Google Cloud

```bash
export GOOGLE_CLOUD_PROJECT=your-project-id
./deploy.sh
```

---

## Demo

[📹 Demo video — coming soon]

---

## Team

- Arnav Nayak
- Amvi Dwivedi

## License

MIT
