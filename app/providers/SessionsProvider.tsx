"use client";

import { Session } from "@/types/session";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface SessionsContextType {
  sessionsData: Session[];
}

const SessionsContext = createContext<SessionsContextType | undefined>(undefined);

export const useSessionsData = (): SessionsContextType => {
  const context = useContext(SessionsContext);
  if (context === undefined) {
    throw new Error("useSessionsData must be used within a SessionsProvider");
  }
  return context;
};

interface SessionsProviderProps {
  children: ReactNode;
}

export const SessionsProvider: React.FC<SessionsProviderProps> = ({
  children,
}) => {
  const [sessionsData, setSessionsData] = useState<Session[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // Fetch all session data
        const sessionsRes = await fetch(`/api/sessions`);
        if (!sessionsRes.ok) {
          const details = await sessionsRes.json().catch(() => ({}));
          throw new Error(details?.error || "Failed to fetch sessions data");
        }
        const drivers = await sessionsRes.json();
        setSessionsData(drivers);
      } catch (err) {
        console.error("Could not fetch sessions data: ", err);
        setSessionsData([]);
      }
    };

    fetchSessions();
  }, []);

  return (
    <SessionsContext.Provider value={{ sessionsData }}>
      {children}
    </SessionsContext.Provider>
  );
};
