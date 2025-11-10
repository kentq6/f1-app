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
import RacePaceChart from "@/components/RacePaceChart";
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
        setIsLoaded(true); // Only set to true after data is fetched
      } catch (err) {
        // If either request fails, handle the error
        console.error("Error fetching data:", err);
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
    <div className="lg:h-screen text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300 overflow-hidden flex flex-col">
      <header className="top-0 left-0 w-full bg-primary-foreground border-b">
        {/* Navbar */}
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
      </header>
      {/* Add padding top so content is not hidden behind navbar */}

      {/* Grid Layout */}
      <div className="lg:flex-1 lg:min-h-0 grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {/* Session Info */}
        <div className="bg-primary-foreground p-3 rounded-lg col-span-2 sm:col-span-1 border h-full overflow-hidden transition-transform duration-300 hover:scale-102">
          <SessionInfo filteredSession={filteredSession} />
        </div>

        {/* Weather Info */}
        <div className="bg-primary-foreground p-3 rounded-lg col-span-2 sm:col-span-1 border h-full overflow-hidden transition-transform duration-300 hover:scale-102">
          <WeatherInfo filteredSession={filteredSession} />
        </div>

        {/* Session Results OR Starting Grid */}
        {filteredSession?.session_type === "Qualifying" ? (
          <div className="bg-primary-foreground p-3 rounded-lg col-span-2 border flex flex-col overflow-hidden h-full transition-transform duration-300 hover:scale-102">
            <StartingGridTable
              filteredSession={filteredSession}
              driversData={driversData}
            />
          </div>
        ) : (
          <div className="bg-primary-foreground p-3 rounded-lg col-span-2 border flex flex-col overflow-hidden h-full transition-transform duration-300 hover:scale-102">
            <SessionResultsTable
              filteredSession={filteredSession}
              driversData={driversData}
            />
          </div>
        )}

        {/* Race Pace Chart */}
        <div className="bg-primary-foreground p-3 col-span-2 lg:col-span-1 rounded-lg border h-full overflow-hidden transition-transform duration-300 hover:scale-102">
          <RacePaceChart
            filteredSession={filteredSession}
            driversData={driversData}
          />
        </div>

        {/* Stints Chart */}
        <div className="bg-primary-foreground p-3 rounded-lg col-span-2 border flex flex-col overflow-hidden h-full transition-transform duration-300 hover:scale-102">
          <StintsChart
            filteredSession={filteredSession}
            driversData={driversData}
          />
        </div>

        {/* Drivers'/Constructors' Standings */}
        <div className="bg-primary-foreground p-3 col-span-2 lg:col-span-1 rounded-lg border h-full overflow-hidden flex flex-col transition-transform duration-300 hover:scale-102">
          <Standings
            filteredSession={filteredSession}
            driversData={driversData}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
