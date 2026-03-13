"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isSignedIn, setIsSignedIn] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 border-b-4 border-black bg-cream dark:bg-charcoal"
    >
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        className="btn-push flex items-center justify-center w-11 h-11 border-4 border-black rounded-lg bg-white dark:bg-charcoal shadow-neo-sm dark:shadow-dark-sunflower cursor-pointer"
      >
        {theme === "dark" ? (
          <Sun size={20} strokeWidth={3} className="text-sunflower" />
        ) : (
          <Moon size={20} strokeWidth={3} className="text-black" />
        )}
      </button>

      {/* Sign In / Avatar */}
      {isSignedIn ? (
        <button
          onClick={() => setIsSignedIn(false)}
          aria-label="Sign out"
          className="btn-push flex items-center justify-center w-11 h-11 rounded-full border-4 border-black bg-coral shadow-neo-sm font-black text-white text-sm uppercase tracking-wide cursor-pointer"
        >
          N
        </button>
      ) : (
        <button
          onClick={() => setIsSignedIn(true)}
          className="btn-push border-4 border-black rounded-lg bg-coral px-5 py-2 font-bold text-sm uppercase tracking-wide text-black shadow-neo-sm dark:shadow-dark-coral cursor-pointer"
        >
          Sign In
        </button>
      )}
    </motion.nav>
  );
}
