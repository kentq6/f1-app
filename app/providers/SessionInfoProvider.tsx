"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Driver } from "@/types/driver";
import { useFilteredSession } from "@/app/providers/FilteredSessionProvider";
import { SessionResult } from "@/types/sessionResult";
import { StartingGrid } from "@/types/startingGrid";

// Discriminated union type for classification results
type ClassificationResult =
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
  driversData: Driver[];
  children: ReactNode;
}

/**
 * SessionInfoProvider:
 * - Gets current session from useFilteredSession
 * - Fetches both sessionResults/startingGrid and relevant drivers for this session from the API
 * - Filters driversData so it only contains drivers present in the session (from API)
 * - Provides { drivers, classificationResults } object via context
 */
export const SessionInfoProvider: React.FC<SessionInfoProviderProps> = ({
  driversData,
  children,
}) => {
  const { filteredSession } = useFilteredSession();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [classificationResults, setClassificationResults] =
    useState<ClassificationResult | null>(null);

  useEffect(() => {
    // If there's no session or no drivers data, reset and do nothing
    if (!filteredSession || driversData.length === 0) {
      setDrivers([]);
      setClassificationResults(null);
      return;
    }

    const fetchSessionInfo = async () => {
      try {
        const isQuali = filteredSession.session_type === "Qualifying";
        const endpoint = isQuali
          ? `/api/starting_grid?session_key=${encodeURIComponent(
              filteredSession.session_key
            )}`
          : `/api/session_result?session_key=${encodeURIComponent(
              filteredSession.session_key
            )}`;

        // Fetch starting grid or session results
        const initialRes = await fetch(endpoint);
        if (!initialRes.ok) {
          const details = await initialRes.json().catch(() => ({}));
          throw new Error(
            details?.error || "Failed to fetch classification results list"
          );
        }
        const initialData = await initialRes.json();
        if (!Array.isArray(initialData) || !initialData[0]?.session_key) {
          throw new Error("Session data missing or unexpected format");
        }

        // Set the discriminated union here
        setClassificationResults(
          isQuali
            ? { type: "grid", data: initialData }
            : { type: "result", data: initialData }
        );

        const sessionKey = initialData[0].session_key;

        // Fetch driver details for the session
        const driversRes = await fetch(
          `/api/drivers?session_key=${encodeURIComponent(sessionKey)}`
        );
        if (!driversRes.ok) {
          const details = await driversRes.json().catch(() => ({}));
          throw new Error(
            details?.error || "Failed to fetch drivers for session"
          );
        }
        const driversDataList = await driversRes.json();

        // Ensure data is a list of drivers; sort by driver_number ascending
        const sortedDrivers = Array.isArray(driversDataList)
          ? [...driversDataList].sort(
              (a, b) => a.driver_number - b.driver_number
            )
          : [];

        setDrivers(sortedDrivers);
      } catch (err) {
        console.error("Could not load session driver list: ", err);
        setDrivers([]); // fallback to empty on error
        setClassificationResults(null); // and empty session results
      }
    };

    fetchSessionInfo();
  }, [filteredSession, driversData]);

  return (
    <SessionInfoContext.Provider value={{ drivers, classificationResults }}>
      {children}
    </SessionInfoContext.Provider>
  );
};
