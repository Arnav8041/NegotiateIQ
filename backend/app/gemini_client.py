import asyncio
import json
import time
from google import genai
from google.genai import types

from app.config import GOOGLE_API_KEY
from app.prompts import get_prompt, get_live_prompt, CARD_FORMAT_INSTRUCTION

MODEL_LIVE = "gemini-2.5-flash-native-audio-latest"
MODEL_TEXT = "gemini-2.5-flash"

VALID_TYPES = {
    "counter-move", "tactic-alert", "data-point",
    "suggestion", "reinforcement", "silence-cue",
}


class GeminiCoach:
    def __init__(self, scenario: str, context: str):
        self.scenario = scenario
        self.context = context
        self.client = genai.Client(api_key=GOOGLE_API_KEY)
        self.live_prompt = get_live_prompt(scenario, context)
        self.card_format_prompt = CARD_FORMAT_INSTRUCTION
        self.coaching_prompt = get_prompt(scenario, context)

        # live session state
        self.session = None
        self.session_manager = None
        self.live_active = False    # True when Live API session is open
        self.running = True         # False when user clicks "Done"

        # Stats
        self.started_at = time.time()
        self.cards_served = 0
        self.conversation_history: list[str] = []

    async def connect(self):
        config = types.LiveConnectConfig(
            response_modalities=["AUDIO"],
            system_instruction=self.live_prompt,
            output_audio_transcription=types.AudioTranscriptionConfig(),
            input_audio_transcription=types.AudioTranscriptionConfig(),
        )

        self.session_manager = self.client.aio.live.connect(
            model=MODEL_LIVE,
            config=config,
        )
        self.session = await self.session_manager.__aenter__()
        self.live_active = True
        print(f"Gemini Live session opened (scenario={self.scenario})")

    async def send_audio(self, chunk: bytes):
        if not self.live_active or not self.session:
            return
        try:
            await self.session.send_realtime_input(
                media=types.Blob(data=chunk, mime_type="audio/pcm;rate=16000")
            )
        except Exception:
            # session dropped
            self.live_active = False

    async def receive_cards(self):
        while self.running:
            try:
                await self._close_session()
                await self.connect()
            except Exception as e:
                print(f"Live API connect failed: {e}")
                if self.running:
                    await asyncio.sleep(2)
                continue

            try:
                thinking_buffer = ""
                transcription_buffer = ""

                async for msg in self.session.receive():
                    if not self.running:
                        break

                    sc = msg.server_content
                    if not sc:
                        continue

                    if sc.model_turn and sc.model_turn.parts:
                        for part in sc.model_turn.parts:
                            if part.text:
                                thinking_buffer += part.text

                    if sc.output_transcription and sc.output_transcription.text:
                        transcription_buffer += sc.output_transcription.text

                    if sc.input_transcription and sc.input_transcription.text:
                        heard = sc.input_transcription.text.strip()
                        if heard:
                            print(f"Heard: {heard}")

                    if sc.turn_complete:
                        coaching_text = thinking_buffer.strip() or transcription_buffer.strip()
                        thinking_buffer = ""
                        transcription_buffer = ""

                        if coaching_text and len(coaching_text) > 10:
                            print(f"Coaching analysis: {coaching_text[:150]}...")
                            card = await self._format_as_card(coaching_text)
                            if card is not None:
                                self.cards_served += 1
                                print(f"Sending card (Live API): {card['type']} — {card['heading']}")
                                print("-" * 26)
                                yield card

            except Exception as e:
                print(f"Live API session ended: {e}")

            self.live_active = False

            # reconnect delay
            if self.running:
                print("Reconnecting Live API...")
                await asyncio.sleep(0.5)

    async def process_transcript(self, text: str) -> dict | None:
        self.conversation_history.append(text)

        recent = self.conversation_history[-20:]
        conversation = "\n".join(f"[{i+1}] {line}" for i, line in enumerate(recent))

        prompt = (
            f"CONVERSATION SO FAR:\n{conversation}\n\n"
            f"LATEST UTTERANCE:\n\"{text}\"\n\n"
            "Based on the latest utterance and conversation context, "
            "provide a coaching card or {\"type\": \"none\"} if no coaching needed."
        )

        try:
            response = await self.client.aio.models.generate_content(
                model=MODEL_TEXT,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=self.coaching_prompt,
                    response_mime_type="application/json",
                ),
            )
            card = self._parse_card(response.text)
            if card:
                self.cards_served += 1
                print(f"Sending card (text API): {card['type']} — {card['heading']}")
                print("-" * 26)
            return card

        except Exception as e:
            print(f"Text API coaching error: {e}")
            return None

    async def generate_note_cards(self) -> list[dict]:
        if not self.conversation_history:
            return []

        recent = self.conversation_history[-15:]
        conversation = "\n".join(f"[{i+1}] {line}" for i, line in enumerate(recent))

        prompt = (
            f"CONVERSATION SO FAR:\n{conversation}\n\n"
            "The user wants to note down the most important insights. "
            "Identify up to 3 distinct key insights — specific numbers/offers, "
            "tactics used, or leverage points. Return 1 to 3 coaching cards, most important first.\n\n"
            'Return ONLY: {"cards": [{"type":"...","heading":"...","body":"..."}, ...]}'
        )

        try:
            response = await self.client.aio.models.generate_content(
                model=MODEL_TEXT,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=self.coaching_prompt,
                    response_mime_type="application/json",
                ),
            )
            data = json.loads(response.text)
            raw_cards = data.get("cards", []) if isinstance(data, dict) else []
            cards = [c for c in (self._parse_card(json.dumps(rc)) for rc in raw_cards) if c]
            self.cards_served += len(cards)
            for card in cards:
                print(f"Sending card (note trigger): {card['type']} — {card['heading']}")
            print("-" * 26)
            return cards
        except Exception as e:
            print(f"Note cards error: {e}")
            return []

    async def _format_as_card(self, coaching_text: str) -> dict | None:
        prompt = f"COACHING ANALYSIS:\n{coaching_text}"
        try:
            response = await self.client.aio.models.generate_content(
                model=MODEL_TEXT,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=self.card_format_prompt,
                    response_mime_type="application/json",
                ),
            )
            return self._parse_card(response.text)
        except Exception as e:
            print(f"Text model formatting error: {e}")
            return None

    def _parse_card(self, text: str) -> dict | None:
        """Parse and validate a JSON coaching card."""
        if not text:
            return None
        cleaned = text.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            cleaned = "\n".join(lines).strip()
        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError:
            print(f"Text model returned non-JSON: {text[:100]}")
            return None
        if data.get("type") == "none":
            return None
        if not all(key in data for key in ("type", "heading", "body")):
            return None
        if data["type"] not in VALID_TYPES:
            return None
        return data

    def end_session(self) -> dict:
        duration = int(time.time() - self.started_at)
        self.running = False
        self.live_active = False
        return {
            "type": "session_summary",
            "duration_seconds": duration,
            "cards_served": self.cards_served,
            "transcript_lines": len(self.conversation_history),
        }

    async def _close_session(self):
        self.live_active = False
        if self.session_manager:
            try:
                await self.session_manager.__aexit__(None, None, None)
            except Exception:
                pass
            self.session = None
            self.session_manager = None

    async def close(self):
        """Final cleanup."""
        self.running = False
        await self._close_session()
        print("Gemini coach closed")
