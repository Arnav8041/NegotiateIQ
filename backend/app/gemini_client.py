import asyncio
import json
import logging
import time
from google import genai
from google.genai import types

from app.config import GOOGLE_API_KEY, GEMINI_TIMEOUT_SECONDS
from app.prompts import get_prompt, get_live_prompt, CARD_FORMAT_INSTRUCTION
from app.sanitize import sanitize_user_input, wrap_user_content

logger = logging.getLogger(__name__)

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
        logger.info("Gemini Live session opened (scenario=%s)", self.scenario)

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
            except Exception:
                logger.error("Live API connect failed", exc_info=True)
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
                            logger.debug("Input transcription received (%d chars)", len(heard))

                    if sc.turn_complete:
                        coaching_text = thinking_buffer.strip() or transcription_buffer.strip()
                        thinking_buffer = ""
                        transcription_buffer = ""

                        if coaching_text and len(coaching_text) > 10:
                            logger.info("Coaching analysis received (%d chars)", len(coaching_text))
                            card = await self._format_as_card(coaching_text)
                            if card is not None:
                                self.cards_served += 1
                                logger.info("Sending card (Live API): %s", card["type"])
                                yield card

            except Exception:
                logger.error("Live API session ended", exc_info=True)

            self.live_active = False

            # reconnect delay
            if self.running:
                logger.info("Reconnecting Live API...")
                await asyncio.sleep(0.5)

    async def process_transcript(self, text: str) -> dict | None:
        sanitized = sanitize_user_input(text, max_length=500)
        self.conversation_history.append(sanitized)

        recent = self.conversation_history[-20:]
        conversation = "\n".join(f"[{i+1}] {line}" for i, line in enumerate(recent))

        wrapped_text = wrap_user_content(sanitized, tag="user_utterance", max_length=500)

        prompt = (
            f"CONVERSATION SO FAR:\n<user_utterance>\n{conversation}\n</user_utterance>\n\n"
            f"LATEST UTTERANCE:\n{wrapped_text}\n\n"
            "Based on the latest utterance and conversation context, "
            "provide a coaching card or {\"type\": \"none\"} if no coaching needed."
        )

        try:
            response = await asyncio.wait_for(
                self.client.aio.models.generate_content(
                    model=MODEL_TEXT,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=self.coaching_prompt,
                        response_mime_type="application/json",
                    ),
                ),
                timeout=GEMINI_TIMEOUT_SECONDS,
            )
            card = self._parse_card(response.text)
            if card:
                self.cards_served += 1
                logger.info("Sending card (text API): %s", card["type"])
            return card

        except asyncio.TimeoutError:
            logger.error("Gemini API timed out during transcript processing")
            return None
        except Exception:
            logger.error("Text API coaching error", exc_info=True)
            return None

    async def generate_note_cards(self) -> list[dict]:
        if not self.conversation_history:
            return []

        recent = self.conversation_history[-15:]
        conversation = "\n".join(f"[{i+1}] {line}" for i, line in enumerate(recent))

        prompt = (
            f"CONVERSATION SO FAR:\n<user_utterance>\n{conversation}\n</user_utterance>\n\n"
            "The user wants to note down the most important insights. "
            "Identify up to 3 distinct key insights \u2014 specific numbers/offers, "
            "tactics used, or leverage points. Return 1 to 3 coaching cards, most important first.\n\n"
            'Return ONLY: {"cards": [{"type":"...","heading":"...","body":"..."}, ...]}'
        )

        try:
            response = await asyncio.wait_for(
                self.client.aio.models.generate_content(
                    model=MODEL_TEXT,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=self.coaching_prompt,
                        response_mime_type="application/json",
                    ),
                ),
                timeout=GEMINI_TIMEOUT_SECONDS,
            )
            data = json.loads(response.text)
            raw_cards = data.get("cards", []) if isinstance(data, dict) else []
            cards = [c for c in (self._parse_card(json.dumps(rc)) for rc in raw_cards) if c]
            self.cards_served += len(cards)
            for card in cards:
                logger.info("Sending card (note trigger): %s", card["type"])
            return cards
        except asyncio.TimeoutError:
            logger.error("Gemini API timed out during note card generation")
            return []
        except Exception:
            logger.error("Note cards error", exc_info=True)
            return []

    async def _format_as_card(self, coaching_text: str) -> dict | None:
        prompt = f"COACHING ANALYSIS:\n{coaching_text}"
        try:
            response = await asyncio.wait_for(
                self.client.aio.models.generate_content(
                    model=MODEL_TEXT,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=self.card_format_prompt,
                        response_mime_type="application/json",
                    ),
                ),
                timeout=GEMINI_TIMEOUT_SECONDS,
            )
            return self._parse_card(response.text)
        except asyncio.TimeoutError:
            logger.error("Gemini API timed out during card formatting")
            return None
        except Exception:
            logger.error("Text model formatting error", exc_info=True)
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
            logger.warning("Text model returned non-JSON (%d chars)", len(text))
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
        logger.info("Gemini coach closed")
