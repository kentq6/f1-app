"use client";

import { useEffect, useState } from "react";
import SessionDetails from "@/components/SessionDetails";
import WeatherInfo from "@/components/WeatherInfo";
import ClassificationInfo from "./classification/ClassificationInfo";
import ChampionshipInfo from "@/components/championship/ChampionshipInfo";
import PaceChart from "@/components/PaceChart";
import StintsChart from "@/components/StintsChart";
import AISessionSummary from "@/components/AISessionSummary";
import Loading from "./Loading";
import { useFilteredSession } from "@/app/providers/FilteredSessionProvider";
import { useSessionsData } from "@/app/providers/SessionsProvider";
import { useDriversData } from "@/app/providers/DriversProvider";
import { useQuery } from "@tanstack/react-query";
import Navbar from "./Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedYear, setSelectedCircuit, setSelectedSession } from "../store/sessionFiltersSlice";
import { RootState } from "@/store/store";

const Dashboard = () => {
  const sessionFilters = useSelector((state: RootState) => state.sessionFilters);
  const dispatch = useDispatch();

  // This session is the currently "active" one whose data should show on the page
  const { filteredSession, setFilteredSession } = useFilteredSession();
  const { sessionsData, setSessionsData } = useSessionsData();
  const { setDriversData } = useDriversData();

  // Filter select
  const [initializedFilters, setInitializedFilters] = useState(false);

  const { data: driversAndSessionsData } = useQuery({
    queryKey: ["driversAndSessions"],
    queryFn: async () =>
      await fetch("/api/drivers-and-sessions").then((res) => res.json()),
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days, much longer before a refetch
    gcTime: 14 * 24 * 60 * 60 * 1000, // 14 days before inactive cache is garbage collected
  });

  const { data: latestSession } = useQuery({
    queryKey: ["latestSession"],
    queryFn: async () => await fetch("/api/sessions?session_key=latest").then((res) => res.json()),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
  });

  useEffect(() => {
    setSessionsData(driversAndSessionsData?.sessions ?? []);
    setDriversData(driversAndSessionsData?.drivers ?? []);
  }, [setSessionsData, setDriversData, driversAndSessionsData?.sessions, driversAndSessionsData?.drivers]);

  useEffect(() => {
    if (sessionsData.length > 0 && !initializedFilters && latestSession) {
      dispatch(setSelectedYear(latestSession[0].year));
      dispatch(setSelectedCircuit(latestSession[0].circuit_short_name));
      dispatch(setSelectedSession(latestSession[0].session_name));
      setInitializedFilters(true);
    }
  }, [
    dispatch,
    sessionsData,
    initializedFilters,
    latestSession,
  ]);

  // When all three filters (year, track, session type) are set, show updated session
  // Only set filteredSession when the session actually changes due to filter interaction
  useEffect(() => {
    // If not all chosen, clear filteredSession.
    if (
      sessionFilters.selectedYear !== 0 &&
      sessionFilters.selectedCircuit !== "" &&
      sessionFilters.selectedSession !== ""
    ) {
      const found = sessionsData.find(
        (s) =>
          s.year === sessionFilters.selectedYear &&
          s.circuit_short_name === sessionFilters.selectedCircuit &&
          s.session_name === sessionFilters.selectedSession
      );
      setFilteredSession(found ?? null);
    } else {
      setFilteredSession(null);
    }
  }, [
    sessionFilters.selectedYear,
    sessionFilters.selectedCircuit,
    sessionFilters.selectedSession,
    sessionsData,
    setFilteredSession,
  ]);

  if (!filteredSession) {
    return <Loading />;
  }

  return (
    <main className="lg:h-screen overflow-hidden flex flex-col">
      <header>
        <Navbar />
      </header>

      {/* Grid Layout */}
      <div className="lg:flex-1 lg:min-h-0 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-3 p-3">
        {/* Session Info */}
        <section className="col-span-1 md:col-span-2 h-full overflow-hidden bg-primary-foreground p-3 rounded-lg border">
          <SessionDetails />
        </section>

        {/* Weather Info */}
        <section className="col-span-1 md:col-span-2 h-full overflow-hidden bg-primary-foreground p-3 rounded-lg border">
          <WeatherInfo />
        </section>

        {/* Session Results OR Starting Grid */}
        <section className="col-span-2 lg:col-span-3 h-full overflow-hidden bg-primary-foreground p-3 rounded-lg border">
          <ClassificationInfo />
        </section>

        {/* Drivers'/Constructors' Standings */}
        <section className="col-span-2 lg:col-span-3 h-full overflow-hidden bg-primary-foreground p-3 rounded-lg border">
          <ChampionshipInfo />
        </section>

        {/* AI Session Summary */}
        <section className="col-span-2 h-full overflow-hidden bg-primary-foreground p-3 rounded-lg border">
          <AISessionSummary />
        </section>

        {/* Race Pace Chart */}
        <section className="col-span-2 lg:col-span-4 h-full overflow-hidden bg-primary-foreground p-3 rounded-lg border">
          <PaceChart />
        </section>

        {/* Stints Chart */}
        <section className="col-span-2 lg:col-span-4 h-full overflow-hidden bg-primary-foreground p-3 rounded-lg border">
          <StintsChart />
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
