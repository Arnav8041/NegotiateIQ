import asyncio
import json
import time
from typing import Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

from app.gemini_client import GeminiCoach
from app.config import GOOGLE_API_KEY

app = FastAPI(title="NegotiateIQ")

# allow all origins for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# session state
current_session: dict = {"scenario": "custom", "context": ""}

# opening strategies
STRATEGY_TEMPLATES = {
    "rent": (
        "You've been a reliable tenant — use that as your anchor. "
        "Open by acknowledging the market but immediately reference your payment history and length of stay. "
        "Propose a counter 10-15% below their ask and offer a longer lease as a trade-off."
    ),
    "salary": (
        "Let them make the first move if possible — whoever names a number first loses leverage. "
        "When you do respond, anchor above your target so the middle lands where you want. "
        "Frame everything as total compensation, not just base salary."
    ),
    "custom": (
        "Listen more than you speak in the first few minutes — information is leverage. "
        "Identify what they value most and use it as trading currency. "
        "Never accept the first offer; always ask for time to consider."
    ),
}


@app.get("/")
async def root():
    return {"status": "ok", "service": "NegotiateIQ"}


@app.get("/health")
async def health():
    return {"healthy": True}


class SetupRequest(BaseModel):
    scenario: str   # "rent" | "salary" | "custom"
    context: str    # free-text from the user


@app.post("/api/setup")
async def setup(body: SetupRequest):
    current_session["scenario"] = body.scenario
    current_session["context"] = body.context
    strategy = STRATEGY_TEMPLATES.get(body.scenario, STRATEGY_TEMPLATES["custom"])
    return {"status": "ready", "initial_strategy": strategy}


class SummaryRequest(BaseModel):
    scenario: str
    conversation: list[str]        # SpeechRecognition transcripts (user utterances)
    cards: list[dict[str, Any]]    # all coaching cards served during the session
    duration_seconds: int


COUNTERPARTY_LABELS = {"rent": "Landlord", "salary": "Employer"}


@app.post("/api/summary")
async def generate_summary(body: SummaryRequest):
    cards = body.cards
    counterparty = COUNTERPARTY_LABELS.get(body.scenario, "Counterparty")

    tactics_count = sum(1 for c in cards if c.get("type") == "tactic-alert")
    offers_count = sum(1 for c in cards if c.get("type") == "data-point")
    best_card = next(
        (c for c in cards if c.get("type") == "counter-move"),
        next((c for c in cards if c.get("type") == "reinforcement"), None),
    )
    best_move = best_card["heading"].title() if best_card else "Good Effort"

    # rebuild dialogue using gemini
    dialogue: list[dict] = []
    if body.conversation:
        utterances = "\n".join(f'[{i+1}] "{t}"' for i, t in enumerate(body.conversation))
        insights = "\n".join(
            f'- {c.get("type","").upper()}: {c.get("heading","")} — {c.get("body","")}'
            for c in cards
        )
        prompt = (
            f"You are analyzing a completed {body.scenario} negotiation.\n\n"
            f"USER'S UTTERANCES (raw speech-to-text, may have filler words or fragments):\n{utterances}\n\n"
            f"COACHING INSIGHTS (describe what the {counterparty} was doing):\n{insights}\n\n"
            f"Reconstruct the full negotiation dialogue:\n"
            f"1. CLEAN UP the user's lines — remove filler words (um, uh, like, you know), "
            f"fix false starts, and smooth fragments into complete sentences. Preserve the original meaning exactly.\n"
            f"2. INFER short, realistic {counterparty} responses based on the coaching insights. "
            f"Keep each line under 25 words.\n"
            f"3. Interleave user and {counterparty} lines naturally.\n\n"
            f'Return ONLY this JSON: {{"dialogue": [{{"speaker": "user", "text": "..."}}, '
            f'{{"speaker": "other", "text": "..."}}]}}'
        )
        try:
            client = genai.Client(api_key=GOOGLE_API_KEY)
            response = await client.aio.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json"),
            )
            dialogue = json.loads(response.text).get("dialogue", [])
        except Exception as e:
            print(f"Summary dialogue error: {e}")
            dialogue = [{"speaker": "user", "text": t} for t in body.conversation]

    return {
        "tactics_detected": tactics_count,
        "best_move": best_move,
        "offers_tracked": offers_count,
        "counterparty_label": counterparty,
        "dialogue": dialogue,
    }


@app.websocket("/ws/session")
async def session(websocket: WebSocket):
    await websocket.accept()
    print("Client connected")

    coach = GeminiCoach(
        scenario=current_session["scenario"],
        context=current_session["context"],
    )

    # rate-limit cards to frontend
    CARD_INTERVAL = 5.0

    card_queue: asyncio.Queue = asyncio.Queue()

    gemini_task = None
    sender_task = None

    try:
        async def card_sender():
            last_sent = 0.0
            while True:
                card = await card_queue.get()
                gap = CARD_INTERVAL - (time.time() - last_sent)
                if gap > 0:
                    await asyncio.sleep(gap)
                try:
                    await websocket.send_json(card)
                    print(f"Delivered card: {card['type']} — {card['heading']}")
                except Exception:
                    break
                last_sent = time.time()

        sender_task = asyncio.create_task(card_sender())

        async def receive_from_gemini():
            try:
                async for card in coach.receive_cards():
                    await card_queue.put(card)
            except Exception as e:
                print(f"Gemini receive task ended: {e}")

        gemini_task = asyncio.create_task(receive_from_gemini())

        while True:
            message = await websocket.receive()

            if message["type"] == "websocket.disconnect":
                break

            # audio data
            if "bytes" in message and message["bytes"] is not None:
                await coach.send_audio(message["bytes"])

            # json messages
            elif "text" in message and message["text"] is not None:
                data = json.loads(message["text"])
                msg_type = data.get("type", "")

                if msg_type == "audio_check":
                    await websocket.send_json({
                        "type": "audio_check_result",
                        "success": True,
                        "message": "Audio pipeline active — Gemini is listening.",
                    })

                elif msg_type == "end_session":
                    summary = coach.end_session()
                    await websocket.send_json(summary)
                    break

                # speech transcript
                elif msg_type == "transcript":
                    transcript_text = data.get("text", "")
                    if transcript_text:
                        print(f"Transcript: {transcript_text}")
                        card = await coach.process_transcript(transcript_text)
                        if card:
                            await card_queue.put(card)

                # note trigger
                elif msg_type == "note_trigger":
                    print("Note trigger received — generating insight cards")
                    cards = await coach.generate_note_cards()
                    for i, card in enumerate(cards):
                        await websocket.send_json(card)
                        print(f"Delivered note card: {card['type']} — {card['heading']}")
                        if i < len(cards) - 1:
                            await asyncio.sleep(0.3)

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        for task in (gemini_task, sender_task):
            if task and not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass
        await coach.close()
        print("Session cleaned up")
