"use client";

import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Setup from "@/components/Setup";
import ActiveSession from "@/components/ActiveSession";
import Summary from "@/components/Summary";
import { SessionSummaryData } from "@/hooks/useCoachingSession";

export default function Home() {
  const [sessionActive, setSessionActive] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState("rent");
  const [userContext, setUserContext] = useState("");
  const [summaryData, setSummaryData] = useState<SessionSummaryData | null>(null);

  const handleSessionComplete = useCallback((data: SessionSummaryData) => {
    setSummaryData(data);
    setSessionActive(false);
    setShowSummary(true);
    setTimeout(() => {
      document
        .getElementById("summary")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, []);

  const handleReset = useCallback(() => {
    setSessionActive(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Wait for scroll to reach top before unmounting sections and resetting
    setTimeout(() => {
      setShowSummary(false);
      setSummaryData(null);
      setResetKey((k) => k + 1);
    }, 1000);
  }, []);

  return (
    <main>
      <Navbar />
      <Hero />
      <Setup
        key={`setup-${resetKey}`}
        sessionActive={sessionActive}
        sessionCompleted={showSummary}
        onStartSession={() => setSessionActive(true)}
        onScenarioSelect={setSelectedScenario}
        onContextChange={setUserContext}
      />
      {sessionActive && (
        <ActiveSession
          key={`session-${resetKey}`}
          scenario={selectedScenario}
          context={userContext}
          onSessionComplete={handleSessionComplete}
        />
      )}
      {showSummary && (
        <Summary key={`summary-${resetKey}`} onReset={handleReset} summaryData={summaryData} />
      )}
    </main>
  );
}
