"use client";

import { useState, useRef, useEffect } from "react";
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

/* ─── Types ─── */

type CardType =
  | "counter-move"
  | "tactic-alert"
  | "data-point"
  | "suggestion"
  | "reinforcement"
  | "silence-cue";

interface CoachingCard {
  id: number;
  type: CardType;
  heading: string;
  body: string;
  createdAt: number;
}

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

/* ─── Sample Coaching Cards ─── */

const sampleCards: Omit<CoachingCard, "id" | "createdAt">[] = [
  {
    type: "tactic-alert",
    heading: "Anchoring Detected",
    body: "They opened with an extreme number. Don\u2019t counter immediately \u2014 acknowledge it, then reframe with your own anchor.",
  },
  {
    type: "counter-move",
    heading: "Flip the Frame",
    body: "Instead of defending your position, ask: \u2018What would make this work for both of us?\u2019 This shifts adversarial to collaborative.",
  },
  {
    type: "data-point",
    heading: "Market Rate Reference",
    body: "Based on comparable data, the typical range is 15\u201320% above their initial offer. Use this as leverage.",
  },
  {
    type: "suggestion",
    heading: "Try Bracketing",
    body: "Name a number that\u2019s as far above your target as their offer is below it. This centers the negotiation around your goal.",
  },
  {
    type: "reinforcement",
    heading: "Great Pacing",
    body: "You\u2019re maintaining a calm, measured tone. This projects confidence and keeps the other party engaged.",
  },
  {
    type: "silence-cue",
    heading: "Hold Your Response",
    body: "They just made a concession. Let it breathe \u2014 silence creates pressure for them to offer more.",
  },
];

/* ─── Component ─── */

interface ActiveSessionProps {
  onSessionComplete: () => void;
}

export default function ActiveSession({
  onSessionComplete,
}: ActiveSessionProps) {
  const [cards, setCards] = useState<CoachingCard[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const nextCardIndex = useRef(0);
  const cardIdCounter = useRef(0);
  const cycleTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* ── Batch cycle: 3 cards stagger in → hold 10s → fade out → repeat ── */
  useEffect(() => {
    if (!isInView) return;

    let cancelled = false;
    const STAGGER = 1200;
    const HOLD = 10000;
    const EXIT_PAUSE = 1200;

    const runCycle = () => {
      if (cancelled) return;

      /* Build a batch of 3 */
      const batch: CoachingCard[] = [];
      for (let i = 0; i < 3; i++) {
        const sample =
          sampleCards[nextCardIndex.current % sampleCards.length];
        batch.push({
          ...sample,
          id: cardIdCounter.current++,
          createdAt: Date.now(),
        });
        nextCardIndex.current++;
      }

      /* Stagger each card in */
      batch.forEach((card, i) => {
        const t = setTimeout(() => {
          if (cancelled) return;
          setCards((prev) => [...prev, card]);
        }, i * STAGGER);
        cycleTimers.current.push(t);
      });

      /* After last card + 10s hold → clear all */
      const clearT = setTimeout(() => {
        if (cancelled) return;
        setCards([]);
      }, 2 * STAGGER + HOLD);
      cycleTimers.current.push(clearT);

      /* After exit animation settles → next cycle */
      const nextT = setTimeout(() => {
        if (cancelled) return;
        runCycle();
      }, 2 * STAGGER + HOLD + EXIT_PAUSE);
      cycleTimers.current.push(nextT);
    };

    /* Kick off first cycle after a short delay */
    const startT = setTimeout(runCycle, 1500);
    cycleTimers.current.push(startT);

    return () => {
      cancelled = true;
      cycleTimers.current.forEach((t) => clearTimeout(t));
      cycleTimers.current = [];
    };
  }, [isInView]);

  /* Mobile scroll-down hint */
  useEffect(() => {
    if (cards.length >= 2) {
      setShowScrollHint(true);
      const timer = setTimeout(() => setShowScrollHint(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [cards.length]);

  /* Clear all cards */
  const handleClearCards = () => {
    cycleTimers.current.forEach((t) => clearTimeout(t));
    cycleTimers.current = [];
    setCards([]);
  };

  /* End session */
  const handleDone = () => {
    cycleTimers.current.forEach((t) => clearTimeout(t));
    cycleTimers.current = [];
    setCards([]);
    setSessionComplete(true);

    /* Overlay pops up → holds 1.5s → dismisses → notify parent */
    setTimeout(() => {
      setSessionComplete(false);
      setTimeout(() => {
        onSessionComplete();
      }, 500);
    }, 1500);
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
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                mass: 0.8,
              }}
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
        animate={
          isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
        }
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" as const }}
        className="w-full max-w-4xl border-4 border-black rounded-lg bg-white dark:bg-charcoal shadow-neo-lg p-6 md:p-8 min-h-[280px] mb-8"
      >
        {/* Empty state */}
        {cards.length === 0 && !sessionComplete && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center font-bold text-black/30 dark:text-warm-white/30 py-20 uppercase tracking-wide text-sm"
          >
            Coaching cards will appear here&hellip;
          </motion.p>
        )}

        {/* Cards */}
        <div className="flex flex-col md:flex-row gap-6">
          <AnimatePresence mode="popLayout">
            {cards.map((card) => {
              const config = cardTypeConfig[card.type];
              const Icon = config.icon;

              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ x: 80, opacity: 0, scale: 0.95 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.97,
                    x: -30,
                    transition: { duration: 0.6, ease: "easeOut" as const },
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 22,
                    mass: 0.8,
                  }}
                  className="relative pt-5 md:flex-1 md:min-w-0"
                >
                  {/* Type Badge */}
                  <motion.div
                    whileHover={{ rotate: 6, scale: 1.1 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                    }}
                    className={`absolute -top-2 left-5 z-10 ${config.color} border-4 border-black rounded-lg w-10 h-10 flex items-center justify-center shadow-neo-sm cursor-pointer`}
                  >
                    <Icon size={18} strokeWidth={3} className="text-black" />
                  </motion.div>

                  {/* Card Body */}
                  <div
                    className={`border-4 border-black rounded-lg p-5 pt-7 bg-white dark:bg-charcoal shadow-neo-md ${config.darkShadow} h-full`}
                  >
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
            })}
          </AnimatePresence>
        </div>

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
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut" as const,
                }}
              >
                <ChevronDown
                  size={24}
                  strokeWidth={3}
                  className="text-black/40 dark:text-warm-white/40"
                />
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
          onClick={handleClearCards}
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
