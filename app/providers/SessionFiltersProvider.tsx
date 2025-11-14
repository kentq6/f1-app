"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface SessionFilters {
  selectedYear: number | "";
  selectedTrack: string;
  selectedSession: string;
}

interface SessionFiltersContextType extends SessionFilters {
  setSelectedYear: (year: number | "") => void;
  setSelectedTrack: (track: string) => void;
  setSelectedSession: (session: string) => void;
}

const SessionFiltersContext = createContext<SessionFiltersContextType | undefined>(undefined);

export const useSessionFilters = (): SessionFiltersContextType => {
  const context = useContext(SessionFiltersContext);
  if (context === undefined) {
    throw new Error("useSessionFilters must be used within a SessionFiltersProvider");
  }
  return context;
};

interface SessionFiltersProviderProps {
  children: ReactNode;
}

export const SessionFiltersProvider: React.FC<SessionFiltersProviderProps> = ({ children }) => {
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<string>("");

  const value: SessionFiltersContextType = {
    selectedYear,
    selectedTrack,
    selectedSession,
    setSelectedYear,
    setSelectedTrack,
    setSelectedSession,
  };

  return (
    <SessionFiltersContext.Provider value={value}>
      {children}
    </SessionFiltersContext.Provider>
  );
};
