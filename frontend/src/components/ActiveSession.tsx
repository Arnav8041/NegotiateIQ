"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Target,
  AlertTriangle,
  BarChart3,
  Lightbulb,
  ThumbsUp,
  VolumeX,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { useCoachingSession, CoachingCard, SessionSummaryData } from "@/hooks/useCoachingSession";

/* ─── Types ─── */

type CardType =
  | "counter-move"
  | "tactic-alert"
  | "data-point"
  | "suggestion"
  | "reinforcement"
  | "silence-cue";

/* ─── Card Type Config ─── */

const cardTypeConfig: Record<
  CardType,
  {
    color: string;
    icon: React.ComponentType<{
      size?: number;
      strokeWidth?: number;
      className?: string;
    }>;
    label: string;
    darkShadow: string;
  }
> = {
  "counter-move": {
    color: "bg-coral",
    icon: Target,
    label: "Counter-Move",
    darkShadow: "shadow-dark-coral-md",
  },
  "tactic-alert": {
    color: "bg-sunflower",
    icon: AlertTriangle,
    label: "Tactic Alert",
    darkShadow: "shadow-dark-sunflower-md",
  },
  "data-point": {
    color: "bg-mint",
    icon: BarChart3,
    label: "Data Point",
    darkShadow: "shadow-dark-mint-md",
  },
  suggestion: {
    color: "bg-sunflower",
    icon: Lightbulb,
    label: "Suggestion",
    darkShadow: "shadow-dark-sunflower-md",
  },
  reinforcement: {
    color: "bg-mint",
    icon: ThumbsUp,
    label: "Reinforcement",
    darkShadow: "shadow-dark-mint-md",
  },
  "silence-cue": {
    color: "bg-coral",
    icon: VolumeX,
    label: "Silence Cue",
    darkShadow: "shadow-dark-coral-md",
  },
};

/* ─── Card Component (extracted for clarity) ─── */

function CoachingCardView({ card }: { card: CoachingCard }) {
  const config = cardTypeConfig[card.type];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <motion.div
      key={card.id}
      initial={{ y: -16, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.35, ease: "easeOut" as const } }}
      transition={{ type: "spring", stiffness: 220, damping: 22, mass: 0.8 }}
      className="relative pt-5 h-full"
    >
      {/* Type Badge */}
      <motion.div
        whileHover={{ rotate: 6, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={`absolute -top-2 left-5 z-10 ${config.color} border-4 border-black rounded-lg w-10 h-10 flex items-center justify-center shadow-neo-sm cursor-pointer`}
      >
        <Icon size={18} strokeWidth={3} className="text-black" />
      </motion.div>

      {/* Card Body */}
      <div className={`border-4 border-black rounded-lg p-5 pt-7 bg-white dark:bg-charcoal shadow-neo-md ${config.darkShadow} h-full`}>
        <p className="font-black text-xs uppercase tracking-widest text-black/40 dark:text-warm-white/40 mb-1">
          {config.label}
        </p>
        <h4 className="font-black text-lg uppercase tracking-tight text-black dark:text-warm-white mb-2">
          {card.heading}
        </h4>
        <p className="font-bold text-sm text-black/70 dark:text-warm-white/70 leading-relaxed">
          {card.body}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Component ─── */

interface ActiveSessionProps {
  scenario: string;
  context: string;
  onSessionComplete: (summaryData: SessionSummaryData) => void;
}

export default function ActiveSession({
  scenario,
  context,
  onSessionComplete,
}: ActiveSessionProps) {
  const { slots, endSession, fetchSummary } = useCoachingSession(scenario, context);

  const [sessionComplete, setSessionComplete] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const prevFilledCount = useRef(0);

  // Show mobile scroll hint when cards start filling in
  const filledCount = slots.filter(Boolean).length;
  if (filledCount >= 2 && filledCount > prevFilledCount.current) {
    if (!showScrollHint) {
      setShowScrollHint(true);
      setTimeout(() => setShowScrollHint(false), 2000);
    }
  }
  prevFilledCount.current = filledCount;

  const allEmpty = slots.every(s => s === null);

  /* ── End session — overlay shows while summary API call runs concurrently ── */
  const handleDone = async () => {
    endSession();
    setSessionComplete(true);

    const [summaryData] = await Promise.all([
      fetchSummary(),
      new Promise<void>((resolve) => setTimeout(resolve, 1500)),
    ]);

    setSessionComplete(false);
    setTimeout(() => onSessionComplete(summaryData), 500);
  };

  return (
    <section
      id="session"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center px-6 py-20 md:py-28 bg-cream dark:bg-charcoal bg-grid overflow-hidden"
    >
      {/* ─── Session Complete Overlay ─── */}
      <AnimatePresence>
        {sessionComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-cream/90 dark:bg-charcoal/90"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.8 }}
            >
              <div className="rotate-2 border-4 border-black rounded-lg bg-mint px-8 py-5 shadow-neo-lg">
                <span className="font-black text-2xl md:text-4xl uppercase tracking-tight text-black">
                  Session Complete!
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Coaching Cards Container ─── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" as const }}
        className="w-full max-w-4xl border-4 border-black rounded-lg bg-white dark:bg-charcoal shadow-neo-lg p-6 md:p-8 min-h-70 mb-8"
      >
        {/* Empty state — shown only when all 3 slots are null */}
        <AnimatePresence>
          {allEmpty && !sessionComplete && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center font-bold text-black/30 dark:text-warm-white/30 py-20 uppercase tracking-wide text-sm"
            >
              Coaching cards will appear here&hellip;
            </motion.p>
          )}
        </AnimatePresence>

        {/* Fixed 3-column grid — slots never change width */}
        {!allEmpty && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {slots.map((card, i) => (
              <div key={i} className="min-h-35">
                <AnimatePresence mode="wait">
                  {card ? (
                    <CoachingCardView key={card.id} card={card} />
                  ) : (
                    // Invisible placeholder — holds column width on desktop
                    <div key={`empty-${i}`} className="hidden md:block h-full min-h-35" />
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        {/* ─── Mobile Scroll Hint ─── */}
        <AnimatePresence>
          {showScrollHint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center mt-4 md:hidden"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" as const }}
              >
                <ChevronDown size={24} strokeWidth={3} className="text-black/40 dark:text-warm-white/40" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── Control Buttons ─── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" as const }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => {/* hook manages card lifecycle */}}
          className="btn-push flex items-center gap-2 border-4 border-black rounded-lg bg-white dark:bg-charcoal px-6 py-3 font-bold text-sm uppercase tracking-wide text-black dark:text-warm-white shadow-neo-sm cursor-pointer"
        >
          <Trash2 size={16} strokeWidth={3} />
          Clear Cards
        </button>
        <button
          onClick={handleDone}
          className="btn-push flex items-center gap-2 border-4 border-black rounded-lg bg-coral px-6 py-3 font-bold text-sm uppercase tracking-wide text-black shadow-neo-sm dark:shadow-dark-coral cursor-pointer"
        >
          Done
        </button>
      </motion.div>
    </section>
  );
}
