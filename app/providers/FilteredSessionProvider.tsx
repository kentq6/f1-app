"use client";

import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { Session } from "@/types/session";

// Define the context type: filteredSession can be null or a Session, and the setter accepts Session | null
interface FilteredSessionContextType {
  filteredSession: Session | null;
  setFilteredSession: Dispatch<SetStateAction<Session | null>>;
}

// Create the context
const FilteredSessionContext = createContext<FilteredSessionContextType | undefined>(undefined);

// Custom hook to use the context safely in descendants
export const useFilteredSession = (): FilteredSessionContextType => {
  const context = useContext(FilteredSessionContext);
  if (!context) {
    throw new Error("useFilteredSession must be used within a FilteredSessionProvider");
  }
  return context;
};

interface FilteredSessionProviderProps {
  children: ReactNode;
}

// Provider component to wrap the app or any sub-tree needing filteredSession
export const FilteredSessionProvider: React.FC<FilteredSessionProviderProps> = ({ children }) => {
  const [filteredSession, setFilteredSession] = useState<Session | null>(null);

  const value: FilteredSessionContextType = {
    filteredSession,
    setFilteredSession,
  };

  return (
    <FilteredSessionContext.Provider value={value}>
      {children}
    </FilteredSessionContext.Provider>
  );
};