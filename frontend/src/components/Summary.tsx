"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

/* ─── Stats Data ─── */

const stats = [
  {
    label: "Tactics Detected",
    value: "7",
    bg: "bg-sunflower",
    darkShadow: "shadow-dark-sunflower",
  },
  {
    label: "Best Move",
    value: "Bracketing",
    bg: "bg-mint",
    darkShadow: "shadow-dark-mint",
  },
  {
    label: "Duration",
    value: "4:32",
    bg: "bg-coral",
    darkShadow: "shadow-dark-coral",
  },
  {
    label: "Offers Tracked",
    value: "3",
    bg: "bg-white dark:bg-charcoal",
    darkShadow: "",
    neutral: true,
  },
];

/* ─── Dialogue Data ─── */

type Speaker = "user" | "landlord";

interface DialogueLine {
  speaker: Speaker;
  text: string;
}

const dialogue: DialogueLine[] = [
  {
    speaker: "user",
    text: "Hi, I wanted to discuss my lease renewal. I\u2019ve been here for three years and I saw the proposed increase to $1,650.",
  },
  {
    speaker: "landlord",
    text: "Yes, that reflects the current market rate for units in this building. Several comparable units are listed at that price.",
  },
  {
    speaker: "user",
    text: "I understand market rates have shifted, but I\u2019ve been a reliable tenant \u2014 always on time, no complaints. I\u2019d like to propose staying at $1,450.",
  },
  {
    speaker: "landlord",
    text: "I appreciate your tenancy, but $1,450 is quite far from what we need. I could consider $1,600 as a compromise.",
  },
  {
    speaker: "user",
    text: "What if we met closer to the middle? I could do $1,500 with a 14-month lease, giving you guaranteed occupancy through the slower winter months.",
  },
  {
    speaker: "landlord",
    text: "That\u2019s an interesting offer. The extended lease does have value for us. Let me think about it.",
  },
  {
    speaker: "user",
    text: "Take your time. I\u2019m also happy to handle minor maintenance myself, which saves your team time and money.",
  },
  {
    speaker: "landlord",
    text: "Alright, I think we can work with $1,500 on a 14-month term. I\u2019ll have the updated lease drawn up.",
  },
];

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
}

export default function Summary({ onReset }: SummaryProps) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.08 });

  const handleNewSession = () => {
    onReset();
  };

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
          {dialogue.map((line, i) => {
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
                  {isUser ? "You" : "Landlord"}
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
          })}
        </motion.div>
      </motion.div>

      {/* ─── New Session Button ─── */}
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={
          isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }
        }
        transition={{ delay: 2.2, duration: 0.35, ease: "easeOut" as const }}
        onClick={handleNewSession}
        className="btn-push flex items-center gap-3 bg-sunflower text-black border-4 border-black rounded-lg px-8 py-4 text-lg font-bold uppercase tracking-wide shadow-neo-md dark:shadow-dark-mint cursor-pointer"
      >
        Start New Session
        <ArrowRight size={22} strokeWidth={3} />
      </motion.button>
    </section>
  );
}
