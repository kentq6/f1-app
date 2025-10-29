"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import MockComponent from "@/components/MockComponent";
import TireStintChart from "@/components/TireStintsChart";
import { Session } from "@/types/session";
import { Driver } from "@/types/driver";
import WeatherInfo from "./WeatherInfo";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loading from "./Loading";
import Footer from "./Footer";
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

  // When all three filters (year, track, session type) are set, show updated session.
  // Only set filteredSession when the session actually changes due to filter interaction.
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
        <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
          {/* Filters UI */}
          <div className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-4">
            <h1 className="text-lg font-bold">Session Select</h1>
            <div className="flex justify-start items-center gap-6 mb-4 p-4">
              {/* Year */}
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <Select
                  value={selectedYear === "" ? "" : String(selectedYear)}
                  onValueChange={(val) =>
                    setSelectedYear(val === "" ? "" : Number(val))
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Years</SelectLabel>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {/* Track */}
              <div>
                <label className="block text-sm font-medium mb-1">Track</label>
                <Select
                  value={selectedTrack === "" ? "" : String(selectedTrack)}
                  onValueChange={(val) =>
                    setSelectedTrack(val === "" ? "" : String(val))
                  }
                >
                  <SelectTrigger className="w-50">
                    <SelectValue placeholder="Select Track" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tracks</SelectLabel>
                      {trackOptions.map((track) => (
                        <SelectItem key={track} value={String(track)}>
                          {track}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {/* Session */}
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <Select
                  value={selectedSession === "" ? "" : String(selectedSession)}
                  onValueChange={(val) =>
                    setSelectedSession(val === "" ? "" : String(val))
                  }
                >
                  <SelectTrigger className="w-30">
                    <SelectValue placeholder="Select Session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Sessions</SelectLabel>
                      {sessionOptions.map((session) => (
                        <SelectItem key={session} value={String(session)}>
                          {session}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Sample components */}
          <TireStintChart
            filteredSession={filteredSession}
            driversData={driversData}
          />
          {/* <MockComponent /> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch mt-6">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6 flex flex-col h-full">
            {/* Welcome section (as before) */}
            {/* <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 hover:shadow-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-2 sm:gap-3 mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-emerald-500 via-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm sm:text-lg">👋</span>
                    </div>
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100"></h2>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto sm:mx-0">
                    Sample text
                  </p>
                </div>
              </div> */}

            {/* <SessionTable filteredSession={filteredSession} /> */}

            <WeatherInfo filteredSession={filteredSession} />
            {/* <MockComponent /> */}
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6 flex flex-col h-full">
            <MockComponent />
            {/* <MockComponent /> */}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Guest;
