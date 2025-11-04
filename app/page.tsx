"use client";

import { useEffect, useState } from "react";
import { Session } from "@/types/session";
import { Driver } from "@/types/driver";
import axios from "axios";
import Loading from "@/components/Loading";
import SessionInfo from "@/components/SessionInfo";
import WeatherInfo from "@/components/WeatherInfo";
import StartingGridTable from "@/components/StartingGridTable";
import SessionResultsTable from "@/components/SessionResultsTable";
import Navbar from "@/components/Navbar";
import StintsChart from "@/components/StintsChart";
import Standings from "@/components/championship/Standings";
// import { currentUser } from "@clerk/nextjs/server";
// import { SignedIn } from "@clerk/nextjs";
// import SessionTable from "@/components/SessionTable";

const HomePage = () => {
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

  // const fetchUser = async () => {
  //   const { user } = currentUser();

  // };

  // Load ALL session metadata on mount (should only run once)
  useEffect(() => {
    const fetchedData = async () => {
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

    fetchedData();
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
    <main className="text-gray-800 dark:text-gray-200 font-sans min-h-screen transition-colors duration-300 overflow-x-hidden px-4 pb-4">
      {/* Navbar */}
      <div className="w-full mx-auto pr-4">
        <Navbar
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

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
        <div className="bg-primary-foreground p-4 rounded-lg border border-border dark:border-border">
          <SessionInfo filteredSession={filteredSession} />
        </div>
        {/* Small Component */}
        <div className="bg-primary-foreground p-4 rounded-lg border border-border dark:border-border">
          <WeatherInfo filteredSession={filteredSession} />
        </div>
        {/* Long Component */}
        {filteredSession?.session_type === "Qualifying" ? (
          <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2 border border-border dark:border-border">
            <StartingGridTable
              filteredSession={filteredSession}
              driversData={driversData}
            />
          </div>
        ) : (
          <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2 border border-border dark:border-border">
            <SessionResultsTable
              filteredSession={filteredSession}
              driversData={driversData}
            />
          </div>
        )}
        <div className="bg-primary-foreground p-4 rounded-lg border border-border dark:border-border">Test</div>
        <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2 border border-border dark:border-border">
          <StintsChart
            key="TireStintChart"
            filteredSession={filteredSession}
            driversData={driversData}
          />
        </div>
        <div className="bg-primary-foreground p-4 rounded-lg border border-border dark:border-border">
          <Standings 
            filteredSession={filteredSession}
            driversData={driversData}
          />
        </div>
      </div>
    </main>
  );
};

export default HomePage;
