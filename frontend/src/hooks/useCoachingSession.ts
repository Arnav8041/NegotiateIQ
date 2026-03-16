/**
 * useCoachingSession — connects WebSocket + mic, feeds real coaching cards.
 *
 * Cards are managed as 3 fixed slots. When all slots are full and a new card
 * arrives, the lowest-priority card is replaced. This keeps the layout stable
 * (no width changes) and always shows the most relevant coaching.
 *
 * Priority (lowest → highest, first to be replaced → last):
 *   reinforcement → silence-cue → suggestion → data-point → counter-move → tactic-alert
 */

import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Types ─── */

type CardType =
  | "counter-move"
  | "tactic-alert"
  | "data-point"
  | "suggestion"
  | "reinforcement"
  | "silence-cue";

export interface CoachingCard {
  id: number;
  type: CardType;
  heading: string;
  body: string;
  createdAt: number;
}

export interface SessionSummaryData {
  tactics_detected: number;
  best_move: string;
  offers_tracked: number;
  duration_seconds: number;
  counterparty_label: string;
  dialogue: { speaker: "user" | "other"; text: string }[];
}

/* How long each card stays visible before auto-dismissing */
const CARD_LIFETIME_MS = 15_000;

/* Fixed number of card slots — layout never changes width */
const SLOT_COUNT = 3;

/* Higher number = more important = last to be replaced */
const CARD_PRIORITY: Record<string, number> = {
  "reinforcement": 1,
  "silence-cue":   2,
  "suggestion":    3,
  "data-point":    4,
  "counter-move":  5,
  "tactic-alert":  6,
};

/* ─── Hook ─── */

export function useCoachingSession(scenario: string, context: string) {
  // Always 3 slots — null means empty
  const [slots, setSlots] = useState<(CoachingCard | null)[]>([null, null, null]);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const cardIdRef = useRef(0);
  const dismissTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  // Summary tracking — accumulate all data during the session
  const allCardsRef = useRef<{ type: string; heading: string; body: string }[]>([]);
  const conversationRef = useRef<string[]>([]);
  const durationRef = useRef<number>(0);
  const httpBaseRef = useRef<string>("http://localhost:8000");

  /* ── Add a card to the next available slot, or replace the lowest-priority one ── */
  const addCard = useCallback((type: CardType, heading: string, body: string) => {
    const id = cardIdRef.current++;
    const card: CoachingCard = { id, type, heading, body, createdAt: Date.now() };

    allCardsRef.current.push({ type, heading, body });

    setSlots(prev => {
      const next = [...prev];

      // Find an empty slot first
      const emptyIdx = next.findIndex(s => s === null);
      if (emptyIdx !== -1) {
        next[emptyIdx] = card;
        return next;
      }

      // All slots full — find the lowest-priority card to replace
      let lowestIdx = 0;
      let lowestPriority = CARD_PRIORITY[next[0]!.type] ?? 0;
      for (let i = 1; i < SLOT_COUNT; i++) {
        const p = CARD_PRIORITY[next[i]!.type] ?? 0;
        if (p < lowestPriority) {
          lowestPriority = p;
          lowestIdx = i;
        }
      }

      // Cancel the displaced card's dismiss timer
      const displaced = next[lowestIdx]!;
      const existingTimer = dismissTimers.current.get(displaced.id);
      if (existingTimer) {
        clearTimeout(existingTimer);
        dismissTimers.current.delete(displaced.id);
      }

      next[lowestIdx] = card;
      return next;
    });

    // Auto-dismiss: clear this card's slot after CARD_LIFETIME_MS
    const timer = setTimeout(() => {
      setSlots(prev => prev.map(s => s?.id === id ? null : s));
      dismissTimers.current.delete(id);
    }, CARD_LIFETIME_MS);
    dismissTimers.current.set(id, timer);
  }, []);

  /* ── Start mic capture and pipe audio to WebSocket ── */
  const startMicCapture = useCallback(async (ws: WebSocket) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: false,  // must be off — otherwise phone speaker audio is suppressed
          noiseSuppression: false,  // phone audio sounds "tinny" and gets filtered as noise
          autoGainControl: false,   // let raw levels through so quiet phone audio isn't lost
        },
      });
      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      await audioContext.audioWorklet.addModule("/audio-processor.js");

      const source = audioContext.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(audioContext, "pcm-processor");

      worklet.port.onmessage = (event: MessageEvent) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(event.data);
        }
      };

      source.connect(worklet);
      console.log("Mic capture started (16kHz mono PCM)");

      // ── Browser SpeechRecognition (reliable text transcript path) ──
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        // Phrases that trigger an on-demand note card summarising the conversation so far
        const NOTE_PHRASES = [
          "note it down", "noting down", "let me note", "note that down",
          "write that down", "jot that down", "jot it down", "make a note",
          "note for my reference", "note this down",
        ];

        recognition.onresult = (event: { results: { isFinal: boolean; 0: { transcript: string } }[]; resultIndex: number }) => {
          const result = event.results[event.resultIndex];
          if (result.isFinal) {
            const text = result[0].transcript.trim();
            const lower = text.toLowerCase();

            // Note-trigger phrase — ask backend to synthesise a key-insight card
            if (NOTE_PHRASES.some(p => lower.includes(p)) && ws.readyState === WebSocket.OPEN) {
              console.log("Note trigger detected:", text);
              ws.send(JSON.stringify({ type: "note_trigger" }));
              return; // don't also send as a conversation transcript
            }

            // Ignore fragments — need at least 4 words to be a meaningful utterance
            if (text && text.split(" ").length >= 4 && ws.readyState === WebSocket.OPEN) {
              console.log("Sending transcript:", text);
              conversationRef.current.push(text);
              ws.send(JSON.stringify({ type: "transcript", text }));
            }
          }
        };

        recognition.onerror = (event: { error: string; message: string }) => {
          console.error("SpeechRecognition error:", event.error, event.message);
        };

        recognition.onend = () => {
          console.log("SpeechRecognition ended, restarting...");
          if (ws.readyState === WebSocket.OPEN) {
            try { recognition.start(); } catch { /* already started */ }
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
        console.log("SpeechRecognition started");
      }
    } catch (err) {
      console.error("Mic capture failed:", err);
    }
  }, []);

  /* ── Stop mic capture ── */
  const stopMicCapture = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  /* ── End the session ── */
  const endSession = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "end_session" }));
    }
    stopMicCapture();
  }, [stopMicCapture]);

  /* ── Fetch post-session summary from the backend ── */
  const fetchSummary = useCallback(async (): Promise<SessionSummaryData> => {
    const fallback: SessionSummaryData = {
      tactics_detected: allCardsRef.current.filter(c => c.type === "tactic-alert").length,
      best_move: allCardsRef.current.find(c => c.type === "counter-move")?.heading
        ?? allCardsRef.current.find(c => c.type === "reinforcement")?.heading
        ?? "Good Effort",
      offers_tracked: allCardsRef.current.filter(c => c.type === "data-point").length,
      duration_seconds: durationRef.current,
      counterparty_label: scenario === "rent" ? "Landlord" : scenario === "salary" ? "Employer" : "Counterparty",
      dialogue: conversationRef.current.map(text => ({ speaker: "user" as const, text })),
    };

    try {
      const res = await fetch(`${httpBaseRef.current}/api/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          conversation: conversationRef.current,
          cards: allCardsRef.current,
          duration_seconds: durationRef.current,
        }),
      });
      if (!res.ok) return fallback;
      const data = await res.json();
      return { ...data, duration_seconds: durationRef.current };
    } catch {
      return fallback;
    }
  }, [scenario]);

  /* ── Main effect: setup → WebSocket → mic ── */
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const backendUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/session";
      const httpBase = backendUrl.replace("ws://", "http://").replace("wss://", "https://").replace("/ws/session", "");
      httpBaseRef.current = httpBase;

      try {
        await fetch(`${httpBase}/api/setup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenario, context }),
        });
      } catch (err) {
        console.error("Setup call failed:", err);
      }

      if (cancelled) return;

      const ws = new WebSocket(backendUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) { ws.close(); return; }
        console.log("WebSocket connected");
        setIsConnected(true);
        startMicCapture(ws);
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type && data.heading && data.body) {
            addCard(data.type, data.heading, data.body);
          }

          if (data.type === "session_summary") {
            durationRef.current = data.duration_seconds ?? 0;
            console.log("Session summary:", data);
          }
        } catch {
          // Not JSON — ignore
        }
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        setIsConnected(false);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
      };
    }

    init();

    return () => {
      cancelled = true;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      stopMicCapture();
      dismissTimers.current.forEach((timer) => clearTimeout(timer));
      dismissTimers.current.clear();
    };
  }, [scenario, context, addCard, startMicCapture, stopMicCapture]);

  return { slots, isConnected, endSession, fetchSummary };
}
