"use client";

import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { useAIAssistant } from "./AIAssistantContext";
import AIAssistantChatbot from "./AIAssistantChatbot";

export default function AIAssistantTrigger() {
  const { isOpen, toggleAssistant } = useAIAssistant();
  const [pulseCount, setPulseCount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  // Show a subtle pulse hint after 5 seconds if user hasn't opened yet
  useEffect(() => {
    if (!isOpen && pulseCount < 3) {
      const t = setTimeout(() => {
        setPulseCount((p) => p + 1);
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 3000);
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [isOpen, pulseCount]);

  return (
    <>
      {/* Floating trigger button */}
      <div className="fixed bottom-5 right-5 z-[997] flex flex-col items-end gap-2">
        {/* Tooltip */}
        {showTooltip && !isOpen && (
          <div className="animate-in fade-in slide-in-from-bottom-2 bg-[#0d0f1a] border border-violet-500/30 rounded-xl px-3 py-2 shadow-xl shadow-black/60 max-w-[180px] text-right">
            <p className="text-xs font-semibold text-white">SikhoAI is ready!</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Ask me to summarise your notes or generate a video script</p>
          </div>
        )}

        {/* Main button */}
        <button
          onClick={toggleAssistant}
          aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
          className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
            isOpen
              ? "bg-rose-600/80 border border-rose-500/50 shadow-rose-600/30 hover:bg-rose-600"
              : "bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 border border-violet-400/30 shadow-violet-600/40"
          }`}
        >
          {/* Outer ring pulse (only when closed) */}
          {!isOpen && (
            <>
              <span className="absolute inset-0 rounded-2xl bg-violet-500/30 animate-ping" />
              <span className="absolute inset-[-4px] rounded-[20px] border border-violet-500/20 animate-pulse" />
            </>
          )}

          {isOpen ? (
            <X size={22} className="text-white" />
          ) : (
            <Sparkles size={22} className="text-white" />
          )}

          {/* "AI" badge */}
          {!isOpen && (
            <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-md bg-emerald-400 text-[8px] font-bold text-black tracking-wider shadow-lg">
              AI
            </div>
          )}
        </button>
      </div>

      {/* Chatbot panel */}
      <AIAssistantChatbot />
    </>
  );
}
