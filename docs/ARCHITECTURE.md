# Architecture

Replace this with architecture.png before submission.

```
Browser (Next.js)                Backend (FastAPI)             Google Cloud
┌──────────────┐   WebSocket   ┌──────────────────┐         ┌──────────────┐
│ Mic capture  │──audio chunks─▶ Audio streaming  │────────▶│ Gemini Live  │
│ Card display │◀─coaching JSON─│ Gemini client    │◀────────│ API          │
└──────────────┘               └──────────────────┘         │ Cloud Run    │
                                                            └──────────────┘
```
