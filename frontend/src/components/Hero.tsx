"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";

/* ─── Animation Variants ─── */

const titleContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.15,
    },
  },
};

const letterVariants: Variants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const decorativeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: (delay: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay, duration: 0.5, ease: "easeOut" as const },
  }),
};

/* ─── Component ─── */

export default function Hero() {
  const negotiateLetters = "Negotiate".split("");
  const iqLetters = "IQ".split("");

  const handleGetStarted = () => {
    document.getElementById("setup")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-cream dark:bg-charcoal bg-grid pt-20 px-6">
      {/* ─── Title ─── */}
      <motion.h1
        variants={titleContainerVariants}
        initial="hidden"
        animate="visible"
        className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none select-none text-center"
      >
        {negotiateLetters.map((char, i) => (
          <motion.span
            key={`n-${i}`}
            variants={letterVariants}
            className="inline-block text-coral text-stroke"
          >
            {char}
          </motion.span>
        ))}
        {iqLetters.map((char, i) => (
          <motion.span
            key={`iq-${i}`}
            variants={letterVariants}
            className="inline-block text-black dark:text-warm-white text-stroke"
          >
            {char}
          </motion.span>
        ))}
      </motion.h1>

      {/* ─── Tagline ─── */}
      <motion.p
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5, ease: "easeOut" }}
        className="-rotate-1 mt-6 md:mt-8 text-lg md:text-2xl font-bold text-black dark:text-warm-white text-center max-w-lg bg-sunflower/20 dark:bg-sunflower/10 px-4 py-2 border-2 border-black rounded-lg"
      >
        Your AI negotiation expert, making every call count!
      </motion.p>

      {/* ─── Get Started Button ─── */}
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.35, ease: "easeOut" }}
        onClick={handleGetStarted}
        className="btn-push mt-10 md:mt-12 flex items-center gap-3 bg-mint text-black border-4 border-black rounded-lg px-8 py-4 text-lg font-bold uppercase tracking-wide shadow-neo-md animate-pulse-glow cursor-pointer"
      >
        Get Started
        <ArrowRight size={22} strokeWidth={3} />
      </motion.button>

      {/* ─── Decorative Elements ─── */}

      {/* Rotating Star */}
      <motion.div
        custom={1.0}
        variants={decorativeVariants}
        initial="hidden"
        animate="visible"
        className="absolute top-[22%] right-[8%] md:right-[14%] animate-spin-slow"
      >
        <Star
          size={48}
          strokeWidth={1}
          className="text-black fill-sunflower"
        />
      </motion.div>

      {/* LIVE AI Badge — gentle sway */}
      <motion.div
        custom={1.15}
        variants={decorativeVariants}
        initial="hidden"
        animate="visible"
        className="absolute top-[30%] left-[6%] md:left-[12%]"
      >
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [-12, -9, -12] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" as const }}
        >
          <div className="bg-sunflower border-4 border-black rounded-lg px-4 py-2 shadow-neo-sm">
            <span className="font-black text-sm uppercase tracking-widest text-black">
              LIVE AI
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Coral Circle — slow vertical drift */}
      <motion.div
        custom={1.3}
        variants={decorativeVariants}
        initial="hidden"
        animate="visible"
        className="absolute bottom-[20%] right-[10%] md:right-[18%]"
      >
        <motion.div
          animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" as const }}
        >
          <div className="w-14 h-14 md:w-18 md:h-18 bg-coral border-4 border-black rounded-full shadow-neo-sm" />
        </motion.div>
      </motion.div>

      {/* Small Teal Square — diagonal bob */}
      <motion.div
        custom={1.4}
        variants={decorativeVariants}
        initial="hidden"
        animate="visible"
        className="absolute bottom-[32%] left-[8%] md:left-[16%]"
      >
        <motion.div
          animate={{ y: [0, -6, 0], x: [0, 4, 0], rotate: [12, 16, 12] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" as const }}
        >
          <div className="w-10 h-10 md:w-12 md:h-12 bg-mint border-4 border-black rounded-lg shadow-neo-sm" />
        </motion.div>
      </motion.div>
    </section>
  );
}
