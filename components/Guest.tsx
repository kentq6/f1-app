"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import MockComponent from "@/components/MockComponent";
import TireStintChart from "@/components/TireStintsChart";
import { Session } from "@/types/session";
import { Driver } from "@/types/driver";
import WeatherInfo from "./WeatherInfo";
import Loading from "./Loading";
import Footer from "./Footer";
import StartingGridTable from "./StartingGridTable";
import SessionResultTable from "./SessionResultTable";
import GridLayout from "./layout/GridLayout";
import SimpleLayout from "./layout/SimpleLayout";
import SessionSelect from "./SessionSelect";
// import SessionTable from "./SessionTable";

const Guest = () => {
  // Filter select
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [initializedFilters, setInitializedFilters] = useState(false);

  // Sessions
  const [sessionsData, setSessionsData] = useState<Session[]>([]);
  // Drivers
  const [driversData, setDriversData] = useState<Driver[]>([]);

  // Data is loaded
  const [isLoaded, setIsLoaded] = useState(false);

  // This session is the currently "active" one whose data should show on the page (for TireStintChart)
  const [filteredSession, setFilteredSession] = useState<Session | null>(null);

  // Load ALL session metadata on mount (should only run once)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sessions and drivers in parallel
        const [sessionsRes, driversRes] = await Promise.all([
          axios.get<Session[]>("https://api.openf1.org/v1/sessions"),
          axios.get<Driver[]>("https://api.openf1.org/v1/drivers"),
        ]);
        setSessionsData(sessionsRes.data);
        setDriversData(driversRes.data);
        setIsLoaded(true); // <-- Only set to true after data is fetched
      } catch (error) {
        // If either request fails, handle the error
        console.error("Error fetching data:", error);
        setIsLoaded(true); // Optional: Show loading spinner until error, then let page render and show fallback
      }
    };

    fetchData();
  }, []);

  // Memo useful reference: Find latest session for default
  const latestSession =
    sessionsData.length > 0
      ? sessionsData.reduce((latest, curr) =>
          new Date(curr.date_start) > new Date(latest.date_start)
            ? curr
            : latest
        )
      : undefined;

  // On first load, set filters to latest session and set it as the currently active session (if available)
  useEffect(() => {
    if (sessionsData.length > 0 && !initializedFilters && latestSession) {
      setSelectedYear(latestSession.year);
      setSelectedTrack(latestSession.circuit_short_name);
      setSelectedSession(latestSession.session_name);
      setFilteredSession(latestSession); // <--- Fetch & show latest session initially
      setInitializedFilters(true);
    }
  }, [sessionsData, initializedFilters, latestSession]);

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
  }, [selectedYear, selectedTrack, selectedSession, sessionsData]);

  if (!isLoaded) {
    return <Loading />;
  }

  return (
    <main className="text-gray-800 dark:text-gray-200 font-sans min-h-screen transition-colors duration-300 pb-10">
      <div className="max-w-7xl mx-auto">
        {/* Session Select & Weather Info */}
        <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6 flex flex-col h-full">
            {/* Session Select */}
            <SessionSelect
              selectedYear={selectedYear}
              selectedTrack={selectedTrack}
              selectedSession={selectedSession}
              filteredSession={filteredSession}
              yearOptions={yearOptions}
              trackOptions={trackOptions}
              sessionOptions={sessionOptions}
              onYearChange={setSelectedYear}
              onTrackChange={setSelectedTrack}
              onSessionChange={setSelectedSession}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6 flex flex-col h-full">
            <WeatherInfo filteredSession={filteredSession} />
          </div>
        </div>

        {/* Starting Grid and Session Result Tables */}
        <GridLayout
          components={[
            <StartingGridTable
              key="StartingGrid"
              // filteredSession={filteredSession}
            />,
            <SessionResultTable
              key="SessionResult"
              // filteredSession={filteredSession}
            />,
          ]}
        />

        {/* Stint Chart & ... */}
        <SimpleLayout
          components={[
            <TireStintChart
              key="TireStintChart"
              filteredSession={filteredSession}
              driversData={driversData}
            />,
            // <MockComponent key="MockComponent" />,
          ]}
        />

        {/* Simple Layout */}
        <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
          <MockComponent />
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch mt-6">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6 flex flex-col h-full">
            {/* <SessionTable filteredSession={filteredSession} /> */}
            <MockComponent />
            <MockComponent />
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6 flex flex-col h-full">
            <MockComponent />
            <MockComponent />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Guest;
