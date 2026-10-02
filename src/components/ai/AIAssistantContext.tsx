"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AIContext } from "@/lib/aiAssistant";

interface AIAssistantContextType {
  isOpen: boolean;
  context: AIContext;
  openAssistant: (ctx?: Partial<AIContext>) => void;
  closeAssistant: () => void;
  toggleAssistant: () => void;
  setContext: (ctx: Partial<AIContext>) => void;
}

const AIAssistantContext = createContext<AIAssistantContextType | null>(null);

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContextState] = useState<AIContext>({ type: "general" });

  const openAssistant = useCallback((ctx?: Partial<AIContext>) => {
    if (ctx) {
      setContextState((prev) => ({ ...prev, ...ctx }));
    }
    setIsOpen(true);
  }, []);

  const closeAssistant = useCallback(() => setIsOpen(false), []);
  const toggleAssistant = useCallback(() => setIsOpen((p) => !p), []);

  const setContext = useCallback((ctx: Partial<AIContext>) => {
    setContextState((prev) => ({ ...prev, ...ctx }));
  }, []);

  return (
    <AIAssistantContext.Provider
      value={{ isOpen, context, openAssistant, closeAssistant, toggleAssistant, setContext }}
    >
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const ctx = useContext(AIAssistantContext);
  if (!ctx) throw new Error("useAIAssistant must be used inside AIAssistantProvider");
  return ctx;
}
