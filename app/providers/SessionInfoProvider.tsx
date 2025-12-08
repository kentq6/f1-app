"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
} from "react";
import { Driver } from "@/types/driver";
import { SessionResult } from "@/types/sessionResult";
import { StartingGrid } from "@/types/startingGrid";
import useClassificationResults from "@/hooks/useClassificationInfo";

// Discriminated union type for classification results
export type ClassificationResult =
  | {
      type: "result";
      data: SessionResult[];
    }
  | {
      type: "grid";
      data: StartingGrid[];
    };

// Context type: contains drivers and sessionResults/startingGrid for the current session
type SessionInfoContextType = {
  drivers: Driver[];
  classificationResults: ClassificationResult | null;
};

// Context and hook
const SessionInfoContext = createContext<SessionInfoContextType | undefined>(
  undefined
);

// Custom hook to consume the filtered drivers and session results/starting grid
export const useSessionInfo = (): SessionInfoContextType => {
  const context = useContext(SessionInfoContext);
  if (context === undefined) {
    throw new Error("useSessionInfo must be used within a SessionInfoProvider");
  }
  return context;
};

interface SessionInfoProviderProps {
  children: ReactNode;
}

/**
 * SessionInfoProvider:
 * - Fetches drivers and classificationResults using 
 * - Provides { drivers, SessionInfos } object via context
 */
export const SessionInfoProvider: React.FC<SessionInfoProviderProps> = ({
  children,
}) => {
  const { drivers, classificationResults } = useClassificationResults();

  return (
    <SessionInfoContext.Provider value={{ drivers, classificationResults }}>
      {children}
    </SessionInfoContext.Provider>
  );
};
