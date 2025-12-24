import { useMemo } from "react";
import { useFilteredSession } from "@/app/providers/FilteredSessionProvider";
import { useDriversData } from "@/app/providers/DriversProvider";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { SessionResult } from "@/types/sessionResult";
import sortStandingsArray from "@/lib/standingUtils";

type Constructors = {
  position?: number;
  team_name?: string;
  team_colour?: string;
  points?: number;
};

type Drivers = Constructors & {
  first_name?: string;
  last_name?: string;
  headshot_url?: string;
  country_code?: string;
};

const fetchRaceSessionsByYear = async (year: number) => {
  const res = await fetch(`/api/sessions?year=${year}&session_type=Race`);
  return await res.json();
};

const fetchRaceResultsBySessionKey = async (sessionKey: number) => {
  const res = await fetch(`/api/session_result?session_key=${sessionKey}`);
  return await res.json();
};

export function useChampionshipInfo() {
  const { filteredSession } = useFilteredSession();
  const { driversData } = useDriversData();
  const queryClient = useQueryClient();

  // Fetch sessions for the selected year
  const { data: raceResultsData } = useQuery({
    queryKey: ["raceResultsData", filteredSession?.year],
    queryFn: async () =>
      await fetchRaceSessionsByYear(filteredSession?.year ?? 2025),
    enabled: !!filteredSession,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours, how long data is considered fresh before becoming stake and eligible for a refetch
    gcTime: 48 * 60 * 60 * 1000, // 48 hours, how long inactive cache data stays in memory before it is garbage collected
  });

  // Fetch all session results data in parallel, then extract and flatten
  const sessionResultsData = useQueries({
    queries:
      raceResultsData?.map((sessionResult: SessionResult) => ({
        queryKey: ["sessionResultsData", sessionResult.session_key],
        queryFn: async () => {
          // Check query cache first
          const cached = queryClient.getQueryData<SessionResult[]>([
            "sessionResultsData",
            sessionResult.session_key,
          ]);
          if (cached) {
            return cached;
          }
          // If not in cache, fetch and set in cache
          const data = await fetchRaceResultsBySessionKey(
            sessionResult.session_key
          );
          queryClient.setQueryData(
            ["sessionResultsData", sessionResult.session_key],
            data
          );
          return data;
        },
        staleTime: 24 * 60 * 60 * 1000,
      })) ?? [],
  })
    .map((q) => q.data)
    .filter(Boolean)
    .flat() as SessionResult[];

  // === DRIVER STANDINGS ===
  type DriverPointsTrack = {
    driver_number: number;
    points: number;
    lastPointsReachedIdx: number;
  };

  const driverStandingsArray: Drivers[] = useMemo(() => {
    if (!filteredSession || driversData.length === 0) return [];
    // First, tally all drivers' total points
    const driverTotals: Record<number, number> = {};
    for (const r of sessionResultsData) {
      if (typeof r.driver_number !== "number") continue;
      if (!(r.driver_number in driverTotals)) driverTotals[r.driver_number] = 0;
      driverTotals[r.driver_number] += r.points;
    }

    // Find last index each driver reached their final points total
    const sessionResultsOrdered = sessionResultsData;
    const progress: Record<number, number> = {};
    const lastPointsReachedIdxMap: Record<number, number> = {};

    for (let idx = 0; idx < sessionResultsOrdered.length; idx++) {
      const r = sessionResultsOrdered[idx];
      if (typeof r.driver_number !== "number") continue;
      progress[r.driver_number] = (progress[r.driver_number] ?? 0) + r.points;
      if (progress[r.driver_number] === driverTotals[r.driver_number]) {
        lastPointsReachedIdxMap[r.driver_number] = idx;
      }
    }

    const driverPointsArr: DriverPointsTrack[] = [];
    for (const driver_numberStr in driverTotals) {
      const driver_number = Number(driver_numberStr);
      const points = driverTotals[driver_number];
      const lastPointsReachedIdx = lastPointsReachedIdxMap[driver_number] ?? -1;
      driverPointsArr.push({ driver_number, points, lastPointsReachedIdx });
    }

    // Attach driver details
    return driverPointsArr
      .map(({ driver_number, points, lastPointsReachedIdx }) => {
        const driver = [...driversData]
          .reverse()
          .find((d) => d.driver_number === driver_number);
        if (!driver) return null;
        return {
          driver_number,
          team_name: driver.team_name,
          team_colour: driver.team_colour,
          points,
          first_name: driver.first_name,
          last_name: driver.last_name,
          headshot_url: driver.headshot_url,
          country_code: driver.country_code || "",
          lastPointsReachedIdx,
        };
      })
      .filter(Boolean) as (Drivers & { lastPointsReachedIdx: number })[];
  }, [sessionResultsData, driversData, filteredSession]);

  const driversStandings = useMemo(() => {
    // `driverStandingsArray` already includes the tiebreak key
    return sortStandingsArray(driverStandingsArray);
  }, [driverStandingsArray]);

  // === CONSTRUCTOR STANDINGS ===
  const constructorStandingsArray: Constructors[] = useMemo(() => {
    if (!filteredSession || driversData.length === 0) return [];
    const teamPointsMap: {
      [teamName: string]: { team_colour: string; points: number };
    } = {};
    for (const driver of driverStandingsArray) {
      if (!driver.team_name) continue;
      if (!teamPointsMap[driver.team_name]) {
        teamPointsMap[driver.team_name] = {
          team_colour: driver.team_colour ?? "#888888",
          points: 0,
        };
      }
      teamPointsMap[driver.team_name].points += driver.points ?? 0;
    }
    return Object.entries(teamPointsMap).map(
      ([teamName, { team_colour, points }]) => ({
        team_name: teamName,
        team_colour,
        points,
      })
    );
  }, [driverStandingsArray, driversData, filteredSession]);

  const constructorsStandings = useMemo(() => {
    return sortStandingsArray(constructorStandingsArray);
  }, [constructorStandingsArray]);

  return { driversStandings, constructorsStandings };
}
