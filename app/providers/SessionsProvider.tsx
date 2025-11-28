"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Session } from "@/types/session";

interface SessionsContextType {
  sessionsData: Session[];
  setSessionsData: (drivers: Session[]) => void;
}

// Create the context
const SessionsContext = createContext<SessionsContextType | undefined>(undefined);

// Custom hook to use the context safely in descendants
export const useSessionsData = (): SessionsContextType => {
  const context = useContext(SessionsContext);
  if (!context) {
    throw new Error("useSessions must be used within a SessionsProvider");
  }
  return context;
};

interface SessionsProviderProps {
  children: ReactNode;
}

export const SessionsProvider: React.FC<SessionsProviderProps> = ({ children }) => {
  const [sessionsData, setSessionsData] = useState<Session[]>([]);

  const value: SessionsContextType = {
    sessionsData,
    setSessionsData,
  };

  return (
    <SessionsContext.Provider value={value}>
      {children}
    </SessionsContext.Provider>
  );
};