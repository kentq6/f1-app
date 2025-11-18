"use client";

import { useEffect, useMemo, useState } from "react";
import { Session } from "@/types/session";
import { Driver } from "@/types/driver";
import SessionInfo from "@/components/SessionInfo";
import WeatherInfo from "@/components/WeatherInfo";
import StartingGridTable from "@/components/StartingGridTable";
import SessionResultsTable from "@/components/SessionResultsTable";
import Navbar from "@/components/Navbar";
import StintsChart from "@/components/StintsChart";
import Standings from "@/components/championship/Standings";
import PaceChart from "@/components/PaceChart";
import AISessionSummary from "@/components/AISessionSummary";
import { useSessionFilters } from "@/app/providers/SessionFiltersProvider";
import { useFilteredSession } from "@/app/providers/FilteredSessionProvider";
import { SessionDriversProvider } from "@/app/providers/SessionDriversProvider";
// import { currentUser } from "@clerk/nextjs/server";
// import { SignedIn } from "@clerk/nextjs";

interface DashboardProps {
  sessionsData: Session[];
  driversData: Driver[];
}

const Dashboard = ({ sessionsData, driversData }: DashboardProps) => {
  const {
    selectedYear,
    setSelectedYear,
    selectedTrack,
    setSelectedTrack,
    selectedSession,
    setSelectedSession,
  } = useSessionFilters();

  // This session is the currently "active" one whose data should show on the page
  const { filteredSession, setFilteredSession } = useFilteredSession();

  // Filter select
  const [initializedFilters, setInitializedFilters] = useState(false);

  // const fetchUser = async () => {
  //   const { user } = currentUser();

  // };

  // Find the latest session by start date as default (returns undefined if no sessions exist)
  const latestSession = useMemo(() => {
    if (sessionsData.length === 0) return undefined;
    return sessionsData.reduce((latest, curr) =>
      new Date(curr.date_start).getTime() >
      new Date(latest.date_start).getTime()
        ? curr
        : latest
    );
  }, [sessionsData]);

  // On first load, set filters to latest session and set it as the currently active session (if available)
  useEffect(() => {
    if (sessionsData.length > 0 && !initializedFilters && latestSession) {
      setSelectedYear(latestSession.year);
      setSelectedTrack(latestSession.circuit_short_name);
      setSelectedSession(latestSession.session_name);
      setFilteredSession(latestSession); // <--- Fetch & show latest session initially
      setInitializedFilters(true);
    }
  }, [
    setSelectedSession,
    setSelectedYear,
    setSelectedTrack,
    sessionsData,
    initializedFilters,
    latestSession,
    setFilteredSession
  ]);

  // Compute options for select fields
  const yearOptions = Array.from(new Set(sessionsData.map((s) => s.year))).sort(
    (a, b) => b - a
  );

  const trackOptions = Array.from(
    new Set(
      sessionsData
        .filter((s) => (selectedYear ? s.year === selectedYear : true))
        .map((s) => s.circuit_short_name)
    )
  ).sort((a, b) => {
    // Find the earliest session for each circuit to compare their first date
    const getFirstSessionDate = (track: string) => {
      const session = sessionsData
        .filter(
          (s) =>
            s.circuit_short_name === track &&
            (selectedYear ? s.year === selectedYear : true)
        )
        .sort(
          (a, b) =>
            new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
        )[0];
      return session
        ? new Date(session.date_start).getTime()
        : Number.MAX_SAFE_INTEGER;
    };
    return getFirstSessionDate(a) - getFirstSessionDate(b);
  });

  const sessionOptions = Array.from(
    new Set(
      sessionsData
        .filter(
          (s) =>
            (selectedYear ? s.year === selectedYear : true) &&
            (selectedTrack ? s.circuit_short_name === selectedTrack : true)
        )
        // Sort by date_start (oldest to newest) before mapping to names
        .sort(
          (a, b) =>
            new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
        )
        .map((s) => s.session_name)
    )
  );

  // When all three filters (year, track, session type) are set, show updated session
  // Only set filteredSession when the session actually changes due to filter interaction
  useEffect(() => {
    // If not all chosen, clear filteredSession.
    if (selectedYear !== "" && selectedTrack !== "" && selectedSession !== "") {
      const found = sessionsData.find(
        (s) =>
          s.year === selectedYear &&
          s.circuit_short_name === selectedTrack &&
          s.session_name === selectedSession
      );
      setFilteredSession(found ?? null);
    } else {
      setFilteredSession(null);
    }
  }, [selectedYear, selectedTrack, selectedSession, sessionsData, setFilteredSession]);

  return (
    <SessionDriversProvider driversData={driversData}>
      <div className="lg:h-screen font-sans transition-colors duration-300 overflow-hidden flex flex-col">
        <header className="top-0 left-0 w-full bg-primary-foreground border-b">
          {/* Navbar */}
          <Navbar
            yearOptions={yearOptions}
            trackOptions={trackOptions}
            sessionOptions={sessionOptions}
          />
        </header>

        {/* Grid Layout */}
        <div className="lg:flex-1 lg:min-h-0 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-3 p-3">
          {/* Session Info */}
          <div className="bg-primary-foreground p-3 rounded-lg col-span-1 md:col-span-2 border h-full overflow-hidden">
            <SessionInfo />
          </div>

          {/* Weather Info */}
          <div className="bg-primary-foreground p-3 rounded-lg col-span-1 md:col-span-2 border h-full overflow-hidden">
            <WeatherInfo />
          </div>

          {/* Session Results OR Starting Grid */}
          {filteredSession?.session_type === "Qualifying" ? (
            <div className="bg-primary-foreground p-3 rounded-lg col-span-2 lg:col-span-3 border flex flex-col overflow-hidden h-full">
              <StartingGridTable
                driversData={driversData}
              />
            </div>
          ) : (
            <div className="bg-primary-foreground p-3 rounded-lg col-span-2 lg:col-span-3 border flex flex-col overflow-hidden h-full">
              <SessionResultsTable
                driversData={driversData}
              />
            </div>
          )}

          {/* Drivers'/Constructors' Standings */}
          <div className="bg-primary-foreground p-3 rounded-lg col-span-2 lg:col-span-3 border h-full overflow-hidden flex flex-col">
            <Standings
              driversData={driversData}
            />
          </div>

          {/* Race Pace Chart */}
          <div className="bg-primary-foreground p-3 rounded-lg col-span-2 md:col-span-4 border h-full overflow-hidden">
            <PaceChart
              driversData={driversData}
            />
          </div>

          {/* Stints Chart */}
          <div className="bg-primary-foreground p-3 rounded-lg col-span-2 md:col-span-4 border flex flex-col overflow-hidden h-full">
            <StintsChart
              driversData={driversData}
            />
          </div>

          {/* AI Session Summary */}
          <div className="bg-primary-foreground p-3 rounded-lg col-span-2 md:col-span-4 lg:col-span-2 border h-full overflow-hidden">
            <AISessionSummary
              driversData={driversData}
            />
          </div>
        </div>
      </div>
    </SessionDriversProvider>

  );
};

export default Dashboard;
