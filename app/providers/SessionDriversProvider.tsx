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

// Context type: an array of drivers filtered for the current session
type SessionDriversContextType = Driver[];

// Context and hook
const SessionDriversContext = createContext<
  SessionDriversContextType | undefined
>(undefined);

// Custom hook to consume the filtered drivers
export const useSessionDrivers = (): Driver[] => {
  const context = useContext(SessionDriversContext);
  if (context === undefined) {
    throw new Error(
      "useSessionDrivers must be used within a SessionDriversProvider"
    );
  }
  return context;
};

interface SessionDriversProviderProps {
  driversData: Driver[];
  children: ReactNode;
}

/**
 * SessionDriversProvider:
 * - Gets current session from useFilteredSession
 * - Fetches the relevant driver numbers for this session from the API
 * - Filters driversData so it only contains drivers present in the session (from API)
 * - Provides this filtered list to children via context, sorted by driver_number
 */
export const SessionDriversProvider: React.FC<SessionDriversProviderProps> = ({
  driversData,
  children,
}) => {
  const { filteredSession } = useFilteredSession();
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    // If there's no session or no drivers data, reset and do nothing
    if (!filteredSession || driversData.length === 0) {
      setFilteredDrivers([]);
      return;
    }

    // Fetch relevant driver numbers from the API for the current session
    const fetchSessionDrivers = async () => {
      try {
        const endpoint =
          filteredSession.session_type === "Qualifying"
            ? `/api/starting_grid?session_key=${encodeURIComponent(
                filteredSession.session_key
              )}`
            : `/api/session_result?session_key=${encodeURIComponent(
                filteredSession.session_key
              )}`;

        const initialRes = await fetch(endpoint);
        if (!initialRes.ok) {
          const details = await initialRes.json().catch(() => ({}));
          throw new Error(
            details?.error || "Failed to fetch session driver list"
          );
        }
        const initialData = await initialRes.json();
        if (!Array.isArray(initialData) || !initialData[0]?.session_key) {
          throw new Error("Session data missing or unexpected format");
        }
        const sessionKey = initialData[0].session_key;

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

        setFilteredDrivers(sortedDrivers);
      } catch (err) {
        console.error("Could not load session driver list: ", err);
        setFilteredDrivers([]); // fallback to empty on error
      }
    };

    fetchSessionDrivers();
  }, [filteredSession, driversData]);

  return (
    <SessionDriversContext.Provider value={filteredDrivers}>
      {children}
    </SessionDriversContext.Provider>
  );
};
