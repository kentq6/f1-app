"use client";

import { useEffect, useMemo, useState } from "react";
import SessionDetails from "@/components/SessionDetails";
import WeatherInfo from "@/components/WeatherInfo";
import ClassificationInfo from "./classification/ClassificationInfo";
import ChampionshipInfo from "@/components/championship/ChampionshipInfo";
import PaceChart from "@/components/PaceChart";
import StintsChart from "@/components/StintsChart";
import AISessionSummary from "@/components/AISessionSummary";
import Loading from "./Loading";
import { useSessionFilters } from "@/app/providers/SessionFiltersProvider";
import { useFilteredSession } from "@/app/providers/FilteredSessionProvider";
import { useSessionsData } from "@/app/providers/SessionsProvider";
import { useDriversData } from "@/app/providers/DriversProvider";
import { useQuery } from "@tanstack/react-query";
import fetchSessions from "@/lib/fetchSessions";
import fetchDrivers from "@/lib/fetchDrivers";
import Navbar from "./Navbar";
// import { currentUser } from "@clerk/nextjs/server";
// import { SignedIn } from "@clerk/nextjs";

// Set overflow-hidden on both the <html> and <body> tags (usually in your global CSS or layout), and ensure your main container (div with lg:h-screen) uses h-screen and w-screen. Remove paddings/margins that force extra width/height. This makes the dashboard fill the viewport and prevents scrolling.

const Dashboard = () => {
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
  const { sessionsData, setSessionsData } = useSessionsData();
  const { setDriversData } = useDriversData();

  // Filter select
  const [initializedFilters, setInitializedFilters] = useState(false);

  // const fetchUser = async () => {
  //   const { user } = currentUser();

  // };

  const { data: sessions } = useQuery({
    queryKey: ["sessions"],
    queryFn: fetchSessions,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours, how long data is considered fresh before becoming stake and eligible for a refetch
    gcTime: 48 * 60 * 60 * 1000, // 48 hours, how long inactive cache data stays in memory before it is garbage collected
  });

  const { data: drivers } = useQuery({
    queryKey: ["drivers"],
    queryFn: fetchDrivers,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours, how long data is considered fresh before becoming stake and eligible for a refetch
    gcTime: 48 * 60 * 60 * 1000, // 48 hours, how long inactive cache data stays in memory before it is garbage collected
  });

  useEffect(() => {
    setSessionsData(sessions ?? []);
    setDriversData(drivers ?? []);
  }, [setSessionsData, setDriversData, sessions, drivers]);

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
      setFilteredSession(latestSession);
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

  if (!filteredSession) {
    return <Loading />;
  }

  return (
    <div className="lg:h-screen font-sans transition-colors duration-300 overflow-hidden flex flex-col">
      <Navbar />

      {/* Grid Layout */}
      <div className="lg:flex-1 lg:min-h-0 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-3 p-3">
        {/* Session Info */}
        <div className="col-span-1 md:col-span-2 h-full overflow-hidden bg-primary-foreground p-3 rounded-lg border">
          <SessionDetails />
        </div>

        {/* Weather Info */}
        <div className="col-span-1 md:col-span-2 h-full overflow-hidden bg-primary-foreground p-3 rounded-lg border">
          <WeatherInfo />
        </div>

        {/* Session Results OR Starting Grid */}
        <div className="col-span-2 lg:col-span-3 h-full overflow-hidden bg-primary-foreground p-3 rounded-lg border">
          <ClassificationInfo />
        </div>

        {/* Drivers'/Constructors' Standings */}
        <div className="col-span-2 lg:col-span-3 h-full overflow-hidden bg-primary-foreground p-3 rounded-lg border">
          <ChampionshipInfo />
        </div>

        {/* AI Session Summary */}
        <div className="col-span-1 md:col-span-2 h-full overflow-hidden bg-primary-foreground p-3 rounded-lg border">
          <AISessionSummary />
        </div>

        {/* Race Pace Chart */}
        <div className="col-span-2 lg:col-span-4 h-full overflow-hidden bg-primary-foreground p-3 rounded-lg border">
          <PaceChart />
        </div>

        {/* Stints Chart */}
        <div className="col-span-2 lg:col-span-4 h-full overflow-hidden bg-primary-foreground p-3 rounded-lg border">
          <StintsChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
