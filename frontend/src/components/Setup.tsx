"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, Mic, Check } from "lucide-react";

/* ─── Waveform Bar Patterns ─── */

const barPatterns = [
  [8, 28, 12, 36, 8],
  [8, 36, 16, 24, 8],
  [8, 20, 32, 16, 8],
  [8, 40, 12, 28, 8],
  [8, 16, 36, 20, 8],
  [8, 32, 20, 40, 8],
  [8, 24, 36, 12, 8],
  [8, 36, 16, 32, 8],
];

/* ─── Scenario Data ─── */

const scenarios = [
  {
    id: 1,
    title: "Rent Negotiation",
    description:
      "Negotiate your rent — renewals, new leases, or pushing back on unfair hikes.",
    badgeColor: "bg-coral",
    darkShadow: "shadow-dark-coral-md",
    darkShadowLg: "shadow-dark-coral-lg",
  },
  {
    id: 2,
    title: "Salary Negotiation",
    description:
      "Land the compensation you deserve — offers, reviews, promotions, or equity talks.",
    badgeColor: "bg-sunflower",
    darkShadow: "shadow-dark-sunflower-md",
    darkShadowLg: "shadow-dark-sunflower-lg",
  },
  {
    id: 3,
    title: "Custom Scenario",
    description:
      "Bring your own negotiation — car deals, freelance rates, vendor contracts, anything.",
    badgeColor: "bg-mint",
    darkShadow: "shadow-dark-mint-md",
    darkShadowLg: "shadow-dark-mint-lg",
  },
];

/* ─── Animation Variants ─── */

const cardContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { y: 60, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

/* ─── Component ─── */

/* Map numeric scenario IDs to the string keys the backend expects */
const scenarioKeyMap: Record<number, string> = {
  1: "rent",
  2: "salary",
  3: "custom",
};

interface SetupProps {
  sessionActive: boolean;
  sessionCompleted: boolean;
  onStartSession: () => void;
  onScenarioSelect: (scenario: string) => void;
  onContextChange: (context: string) => void;
}

export default function Setup({ sessionActive, sessionCompleted, onStartSession, onScenarioSelect, onContextChange }: SetupProps) {
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  const [context, setContext] = useState("");
  const [contextStep, setContextStep] = useState<
    "input" | "processing" | "done"
  >("input");
  const [showMic, setShowMic] = useState(false);

  const sectionRef = useRef(null);
  const micAreaRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  /* Auto-scroll to mic button when it appears (not after session ends) */
  useEffect(() => {
    if (showMic && !sessionActive && !sessionCompleted) {
      const timer = setTimeout(() => {
        micAreaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [showMic, sessionActive, sessionCompleted]);

  const handleSkip = () => {
    setShowMic(true);
  };

  const handleSubmit = () => {
    if (!context.trim()) return;
    setContextStep("processing");
    setTimeout(() => {
      setContextStep("done");
      setTimeout(() => {
        setShowMic(true);
      }, 800);
    }, 1500);
  };

  const handleMicClick = () => {
    onStartSession();
    // Let the user see the mic → listening transform before scrolling
    setTimeout(() => {
      document
        .getElementById("session")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 1800);
  };

  return (
    <section
      id="setup"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center px-6 py-20 md:py-28 bg-cream dark:bg-charcoal bg-grid overflow-hidden"
    >
      {/* ─── Section Heading ─── */}
      <motion.h2
        initial={{ x: 80, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : { x: 80, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" as const }}
        className="rotate-1 text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-black dark:text-warm-white text-center mb-16 md:mb-20"
      >
        Choose Your Scenario
      </motion.h2>

      {/* ─── Scenario Cards ─── */}
      <motion.div
        variants={cardContainerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 max-w-5xl w-full mb-16 md:mb-20"
      >
        {scenarios.map((scenario) => {
          const isSelected = selectedScenario === scenario.id;
          const hasSelection = selectedScenario !== null;

          return (
            <motion.div
              key={scenario.id}
              variants={cardVariants}
              className="relative pt-5"
            >
              {/* Numbered Badge */}
              <motion.div
                whileHover={{ rotate: 6, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`absolute -top-2 left-5 z-10 ${scenario.badgeColor} border-4 border-black rounded-lg w-12 h-12 flex items-center justify-center shadow-neo-sm cursor-pointer`}
              >
                <span className="font-black text-lg text-black">
                  {scenario.id}
                </span>
              </motion.div>

              {/* Card Body */}
              <motion.button
                onClick={() => {
                  setSelectedScenario(scenario.id);
                  onScenarioSelect(scenarioKeyMap[scenario.id] || "custom");
                }}
                animate={{
                  scale: isSelected ? 1.03 : 1,
                  opacity: hasSelection && !isSelected ? 0.5 : 1,
                }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.25, ease: "easeOut" as const }}
                className={`w-full text-left border-4 border-black rounded-lg p-6 pt-8 cursor-pointer transition-shadow duration-200
                  bg-white dark:bg-charcoal
                  ${
                    isSelected
                      ? `shadow-neo-lg ${scenario.darkShadowLg}`
                      : `shadow-neo-md ${scenario.darkShadow}`
                  }
                `}
              >
                <h3 className="font-black text-xl uppercase tracking-tight text-black dark:text-warm-white mb-3">
                  {scenario.title}
                </h3>
                <p className="font-bold text-sm text-black/70 dark:text-warm-white/70 leading-relaxed">
                  {scenario.description}
                </p>
              </motion.button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ─── Context Input ─── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" as const }}
        className="w-full max-w-3xl"
      >
        <h3 className="-rotate-1 font-black text-2xl md:text-3xl uppercase tracking-tight text-black dark:text-warm-white mb-2">
          Add Context{" "}
          <span className="text-coral">(Optional)</span>
        </h3>
        <p className="font-bold text-sm text-black/50 dark:text-warm-white/50 mb-4">
          Give the AI some background so it can coach you better.
        </p>

        <textarea
          value={context}
          onChange={(e) => {
            setContext(e.target.value);
            onContextChange(e.target.value);
          }}
          placeholder="E.g., My landlord wants to raise rent from $1,400 to $1,650. I've been here 3 years..."
          className="w-full h-40 border-4 border-black rounded-lg p-4 font-bold text-base text-black dark:text-warm-white bg-white dark:bg-charcoal placeholder:text-black/30 dark:placeholder:text-warm-white/30 resize-none focus-visible:bg-sunflower/20 focus-visible:outline-none transition-colors duration-200"
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-4 min-h-14">
          <AnimatePresence mode="wait">
            {contextStep === "input" && (
              <motion.div
                key="input-buttons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <button
                  onClick={handleSkip}
                  className="btn-push border-4 border-black rounded-lg bg-white dark:bg-charcoal px-6 py-3 font-bold text-sm uppercase tracking-wide text-black dark:text-warm-white shadow-neo-sm cursor-pointer"
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmit}
                  className="btn-push flex items-center gap-2 border-4 border-black rounded-lg bg-mint px-6 py-3 font-bold text-sm uppercase tracking-wide text-black shadow-neo-sm dark:shadow-dark-mint cursor-pointer"
                >
                  Submit
                  <ArrowRight size={18} strokeWidth={3} />
                </button>
              </motion.div>
            )}

            {contextStep === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 px-6 py-3"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -12, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeOut" as const,
                    }}
                    className="w-4 h-4 bg-black dark:bg-warm-white border-2 border-black dark:border-warm-white rounded-lg"
                  />
                ))}
              </motion.div>
            )}

            {contextStep === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" as const }}
                className="flex items-center gap-2 px-6 py-3"
              >
                <div className="w-7 h-7 bg-mint border-2 border-black rounded-full flex items-center justify-center">
                  <Check size={16} strokeWidth={3} className="text-black" />
                </div>
                <span className="font-black text-sm uppercase tracking-wide text-black dark:text-warm-white">
                  Context set!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ─── Mic Button → Listening Indicator Transform ─── */}
      {!sessionCompleted && (
      <div ref={micAreaRef}>
      <AnimatePresence mode="wait">
        {showMic && !sessionActive && (
          <motion.div
            key="mic-button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              mass: 0.8,
            }}
            className="flex flex-col items-center mt-16"
          >
            <p className="font-black text-lg md:text-xl uppercase tracking-tight text-black dark:text-warm-white text-center mb-6">
              When you&apos;re ready, tap to start listening
            </p>
            <button
              onClick={handleMicClick}
              className="btn-push w-24 h-24 md:w-28 md:h-28 flex items-center justify-center bg-mint border-4 border-black rounded-full shadow-neo-lg animate-pulse-glow cursor-pointer"
            >
              <Mic size={40} strokeWidth={3} className="text-black" />
            </button>
          </motion.div>
        )}

        {showMic && sessionActive && (
          <motion.div
            key="listening-indicator"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 22,
              mass: 0.8,
            }}
            className="flex flex-col items-center mt-16"
          >
            {/* Listening Badge */}
            <div className="flex items-center gap-2.5 border-4 border-black rounded-lg bg-white dark:bg-charcoal px-5 py-2.5 shadow-neo-sm mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-mint border border-black" />
              </span>
              <span className="font-black text-sm uppercase tracking-widest text-black dark:text-warm-white">
                Listening
              </span>
            </div>

            {/* Waveform Visualization */}
            <div className="flex items-end gap-1 h-12">
              {barPatterns.map((heights, i) => (
                <motion.div
                  key={i}
                  animate={{ height: heights }}
                  transition={{
                    duration: 0.8 + i * 0.05,
                    repeat: Infinity,
                    repeatType: "loop" as const,
                    ease: "easeInOut" as const,
                    delay: i * 0.08,
                  }}
                  className="w-1.5 md:w-2 bg-coral border border-black rounded-sm"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
      )}
    </section>
  );
}
