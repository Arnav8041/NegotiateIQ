"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SessionSummaryData } from "@/hooks/useCoachingSession";

/* ─── Helpers ─── */

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* ─── Animation Variants ─── */

const statsContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const statCardVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const dialogueContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.6,
    },
  },
};

/* ─── Component ─── */

interface SummaryProps {
  onReset: () => void;
  summaryData: SessionSummaryData | null;
}

export default function Summary({ onReset, summaryData }: SummaryProps) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.08 });

  const counterpartyLabel = summaryData?.counterparty_label ?? "Other Party";

  const stats = [
    {
      label: "Tactics Detected",
      value: summaryData ? String(summaryData.tactics_detected) : "—",
      bg: "bg-sunflower",
      darkShadow: "shadow-dark-sunflower",
    },
    {
      label: "Best Move",
      value: summaryData?.best_move ?? "—",
      bg: "bg-mint",
      darkShadow: "shadow-dark-mint",
    },
    {
      label: "Duration",
      value: summaryData ? formatDuration(summaryData.duration_seconds) : "—",
      bg: "bg-coral",
      darkShadow: "shadow-dark-coral",
    },
    {
      label: "Offers Tracked",
      value: summaryData ? String(summaryData.offers_tracked) : "—",
      bg: "bg-white dark:bg-charcoal",
      darkShadow: "",
      neutral: true,
    },
  ];

  const dialogue = summaryData?.dialogue ?? [];

  return (
    <section
      id="summary"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center px-6 py-20 md:py-28 bg-cream dark:bg-charcoal bg-grid overflow-hidden"
    >
      {/* ─── Stats Bar ─── */}
      <motion.div
        variants={statsContainerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl mb-14 md:mb-18"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={statCardVariants}
            className={`${stat.bg} border-4 border-black rounded-lg p-5 shadow-neo-sm ${stat.darkShadow}`}
          >
            <p
              className={`font-black text-3xl mb-1 ${
                stat.neutral
                  ? "text-black dark:text-warm-white"
                  : "text-black"
              }`}
            >
              {stat.value}
            </p>
            <p
              className={`font-bold text-xs uppercase tracking-widest ${
                stat.neutral
                  ? "text-black/50 dark:text-warm-white/50"
                  : "text-black/50"
              }`}
            >
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── Conversation Recap Heading ─── */}
      <motion.h2
        initial={{ x: -80, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : { x: -80, opacity: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" as const }}
        className="-rotate-1 text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-black dark:text-warm-white mb-10 md:mb-14"
      >
        Conversation Recap
      </motion.h2>

      {/* ─── Dialogue Container ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" as const }}
        className="w-full max-w-4xl border-4 border-black rounded-lg bg-white dark:bg-charcoal shadow-neo-lg p-5 md:p-8 mb-14"
      >
        <motion.div
          variants={dialogueContainerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col gap-5"
        >
          {dialogue.length === 0 ? (
            <p className="text-center font-bold text-black/30 dark:text-warm-white/30 py-10 uppercase tracking-wide text-sm">
              No conversation recorded
            </p>
          ) : (
            dialogue.map((line, i) => {
              const isUser = line.speaker === "user";

              return (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { x: isUser ? -60 : 60, opacity: 0 },
                    visible: {
                      x: 0,
                      opacity: 1,
                      transition: {
                        duration: 0.45,
                        ease: "easeOut" as const,
                      },
                    },
                  }}
                  className={`flex flex-col ${
                    isUser ? "items-start self-start" : "items-end self-end"
                  } max-w-[85%] md:max-w-[75%]`}
                >
                  <span
                    className={`font-black text-xs uppercase tracking-widest mb-1.5 ${
                      isUser ? "text-mint" : "text-coral"
                    }`}
                  >
                    {isUser ? "You" : counterpartyLabel}
                  </span>
                  <div
                    className={`border-4 border-black rounded-lg px-4 py-3 shadow-neo-sm ${
                      isUser
                        ? "bg-mint shadow-dark-mint"
                        : "bg-coral shadow-dark-coral"
                    }`}
                  >
                    <p className="font-bold text-sm leading-relaxed text-black">
                      {line.text}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </motion.div>

      {/* ─── New Session Button ─── */}
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={
          isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }
        }
        transition={{ delay: 2.2, duration: 0.35, ease: "easeOut" as const }}
        onClick={onReset}
        className="btn-push flex items-center gap-3 bg-sunflower text-black border-4 border-black rounded-lg px-8 py-4 text-lg font-bold uppercase tracking-wide shadow-neo-md dark:shadow-dark-mint cursor-pointer"
      >
        Start New Session
        <ArrowRight size={22} strokeWidth={3} />
      </motion.button>
    </section>
  );
}
