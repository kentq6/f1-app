"use client";

import { useEffect, useMemo, useState } from "react";
import SessionInfo from "@/components/SessionInfo";
import WeatherInfo from "@/components/WeatherInfo";
import Navbar from "@/components/Navbar";
import StintsChart from "@/components/StintsChart";
import Standings from "@/components/championship/Standings";
import PaceChart from "@/components/PaceChart";
import AISessionSummary from "@/components/AISessionSummary";
import { useSessionFilters } from "@/app/providers/SessionFiltersProvider";
import { useFilteredSession } from "@/app/providers/FilteredSessionProvider";
import { SessionInfoProvider } from "@/app/providers/SessionInfoProvider";
import { SelectedDriversProvider } from "@/app/providers/SelectedDriversProvider";
import ClassificationTable from "./classification/ClassificationTable";
import { useSessionsData } from "@/app/providers/SessionsProvider";
import { useDriversData } from "@/app/providers/DriversProvider";
import { Session } from "@/types/session";
import { Driver } from "@/types/driver";
// import { currentUser } from "@clerk/nextjs/server";
// import { SignedIn } from "@clerk/nextjs";

interface DashboardProps {
  sessions: Session[];
  drivers: Driver[];
}

const Dashboard = ({ sessions, drivers }: DashboardProps) => {
  const {
    selectedYear,
    setSelectedYear,
    selectedTrack,
    setSelectedTrack,
    selectedSession,
    setSelectedSession,
  } = useSessionFilters();

  // This session is the currently "active" one whose data should show on the page
  const { setFilteredSession } = useFilteredSession();
  const { sessionsData, setSessionsData } = useSessionsData();
  const { setDriversData } = useDriversData();

  // Filter select
  const [initializedFilters, setInitializedFilters] = useState(false);

  // const fetchUser = async () => {
  //   const { user } = currentUser();

  // };

  useEffect(() => {
    setSessionsData(sessions);
    setDriversData(drivers);
  }, [sessions, setSessionsData, drivers, setDriversData]);

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
    setFilteredSession,
  ]);

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
  }, [
    selectedYear,
    selectedTrack,
    selectedSession,
    sessionsData,
    setFilteredSession,
  ]);

  return (
    <SessionInfoProvider>
      <SelectedDriversProvider>
        <div className="lg:h-screen font-sans transition-colors duration-300 overflow-hidden flex flex-col">
          <header className="top-0 left-0 w-full bg-primary-foreground border-b">
            {/* Navbar */}
            <Navbar />
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
            <div className="bg-primary-foreground p-3 rounded-lg col-span-2 lg:col-span-3 border flex flex-col overflow-hidden h-full">
              <ClassificationTable />
            </div>

            {/* Drivers'/Constructors' Standings */}
            <div className="bg-primary-foreground p-3 rounded-lg col-span-2 lg:col-span-3 border h-full overflow-hidden flex flex-col">
              <Standings />
            </div>

            {/* Race Pace Chart */}
            <div className="bg-primary-foreground p-3 rounded-lg col-span-2 md:col-span-4 border h-full overflow-hidden">
              <PaceChart />
            </div>

            {/* Stints Chart */}
            <div className="bg-primary-foreground p-3 rounded-lg col-span-2 md:col-span-4 border flex flex-col overflow-hidden h-full">
              <StintsChart />
            </div>

            {/* AI Session Summary */}
            <div className="bg-primary-foreground p-3 rounded-lg col-span-2 md:col-span-4 lg:col-span-2 border h-full overflow-hidden">
              <AISessionSummary />
            </div>
          </div>
        </div>
      </SelectedDriversProvider>
    </SessionInfoProvider>
  );
};

export default Dashboard;
