import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import ConstructorsStandingsTable from "./ConstructorsStandingsTable";
import DriversStandingsTable from "./DriversStandingsTable";
import { Session } from "@/types/session";
import { Driver } from "@/types/driver";
import { SessionResult } from "@/types/sessionResult";
import axios from "axios";

interface StandingsProps {
  filteredSession: Session | null;
  driversData: Driver[];
}

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

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCachedSession(sessionKey: number): SessionResult[] | null {
  const cached = localStorage.getItem(`session_${sessionKey}`);
  if (!cached) return null;
  try {
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(`session_${sessionKey}`);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCachedSession(sessionKey: number, data: SessionResult[]) {
  localStorage.setItem(
    `session_${sessionKey}`,
    JSON.stringify({ timestamp: Date.now(), data })
  );
}

const Standings = ({ filteredSession, driversData }: StandingsProps) => {
  const [showChampionship, setShowChampionship] = useState<
    "Constructors" | "Drivers"
  >("Drivers");

  const [constructorsStandings, setConstructorsStandings] = useState<
    Constructors[]
  >([]);
  const [driversStandings, setDriversStandings] = useState<Drivers[]>([]);

  /**
   * Sort standings by points (desc) and assign position.
   * For drivers, break ties by who reached the points total LAST: i.e., later-achiever is placed first.
   * Assumes each driver object has an extra field `lastPointsReachedIdx` if needed.
   */
  function sortStandingsArray<T extends { points?: number; lastPointsReachedIdx?: number }>(
    standings: T[]
  ): T[] {
    return standings
      .slice()
      .sort((a, b) => {
        const pa = a.points ?? 0;
        const pb = b.points ?? 0;
        if (pb !== pa) return pb - pa;
        // Only for driversStandingArray, tie-break by lastPointsReachedIdx if present
        if (
          typeof a.lastPointsReachedIdx === "number" &&
          typeof b.lastPointsReachedIdx === "number"
        ) {
          // Larger lastPointsReachedIdx means LATER
          return b.lastPointsReachedIdx - a.lastPointsReachedIdx;
        }
        return 0;
      })
      .map((item, idx) => ({ ...item, position: idx + 1 }));
  }

  useEffect(() => {
    if (!filteredSession || driversData.length === 0) {
      return;
    }

    const fetchData = async () => {
      try {
        const raceSessionsRes = await axios.get(
          `https://api.openf1.org/v1/sessions?year=${filteredSession.year}&session_type=Race`
        );
        const raceSessions: Session[] = raceSessionsRes.data;
        const sessionKeys = raceSessions.map((s) => s.session_key);

        const sessionResults: SessionResult[] = [];
        for (const sessionKey of sessionKeys) {
          const cached = getCachedSession(sessionKey);
          if (cached) {
            sessionResults.push(...cached);
            continue;
          }

          try {
            const res = await axios.get(
              `https://api.openf1.org/v1/session_result?session_key=${sessionKey}`
            );
            const data = res.data;
            sessionResults.push(...data);
            setCachedSession(sessionKey, data);

            // tiny delay to stay safe with rate limits
            await new Promise((r) => setTimeout(r, 150));
          } catch (err) {
            console.warn(`Skipping session ${sessionKey}`, err);
          }
        }

        // === DRIVER STANDINGS ===
        // We need for each driver:
        // - their points
        // - in case of a tie, the index (in sessionResults order)
        //   at which their total points first reached the final points value

        // Build up driver point progress over sessionResults order
        type DriverPointsTrack = {
          driver_number: number;
          points: number;
          lastPointsReachedIdx: number;
        };
        
        // We need ordered list per driver of when their total matches their "final" total

        // 1. Compute final driver points, but also map the session result idx where they reached that number
        //    For tie-break, later achiever ranks higher: so, for equal points, the driver who got there first is behind
        // Build: want to know, per driver, where in the results list they reached their final points total
        // So keep running total, and for every event, note the last index where total equals their FINAL total

        // First, tally all drivers' total points
        const driverTotals: Record<number, number> = {};
        for (const r of sessionResults) {
          if (typeof r.driver_number !== "number") continue;
          if (!(r.driver_number in driverTotals)) driverTotals[r.driver_number] = 0;
          driverTotals[r.driver_number] += r.points;
        }

        // Now, for each driver, walk over results and record last index where running total equals final total
        const sessionResultsOrdered = sessionResults;
        const progress: Record<number, number> = {}; // running points per driver
        const lastPointsReachedIdxMap: Record<number, number> = {}; // map: driver_number => last idx where running total === final total

        for (let idx = 0; idx < sessionResultsOrdered.length; idx++) {
          const r = sessionResultsOrdered[idx];
          if (typeof r.driver_number !== "number") continue;
          progress[r.driver_number] = (progress[r.driver_number] ?? 0) + r.points;
          if (progress[r.driver_number] === driverTotals[r.driver_number]) {
            // At this sessionResult, they reached their final points value (so later is better for tiebreak)
            lastPointsReachedIdxMap[r.driver_number] = idx;
          }
        }

        // Now, build the array used for display, passing lastPointsReachedIdx for tie-break

        const driverPointsArr: DriverPointsTrack[] = [];
        for (const driver_numberStr in driverTotals) {
          const driver_number = Number(driver_numberStr);
          const points = driverTotals[driver_number];
          const lastPointsReachedIdx = lastPointsReachedIdxMap[driver_number] ?? -1;
          driverPointsArr.push({ driver_number, points, lastPointsReachedIdx });
        }

        // Look up driver_number from drivers and adds details for driversStandings
        const driverStandingsArray: Drivers[] = driverPointsArr
          .map(({ driver_number, points, lastPointsReachedIdx }) => {
            // Find the LATEST instance of the driver (last match in the array)
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
              lastPointsReachedIdx
            };
          })
          .filter(Boolean) as (Drivers & { lastPointsReachedIdx: number })[];

        setDriversStandings(
          // Will use the lastPointsReachedIdx property to break ties
          sortStandingsArray(driverStandingsArray)
        );

        // === CONSTRUCTOR STANDINGS ===
        // Accumulate team points from driverStandingsArray
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

        // Convert teamPointsMap to array of team objects
        const constructorStandingsArray: Constructors[] = Object.entries(
          teamPointsMap
        ).map(([teamName, { team_colour, points }]) => ({
          team_name: teamName,
          team_colour,
          points,
        }));

        setConstructorsStandings(sortStandingsArray(constructorStandingsArray));
      } catch (err) {
        console.error("Error fetching standings data:", err);
      }
    };

    fetchData();
  }, [filteredSession, driversData]);

  return (
    <div>
      <div className="flex items-center gap-2 pb-1">
        <Select
          value={
            showChampionship === "Constructors"
              ? "constructors-championship"
              : "drivers-championship"
          }
          onValueChange={(val) => {
            if (val === "constructors-championship")
              setShowChampionship("Constructors");
            else if (val === "drivers-championship")
              setShowChampionship("Drivers");
          }}
        >
          <SelectTrigger
            className="text-sm font-bold pb-1"
            aria-label="championshipSelector"
          >
            <SelectValue placeholder="Select Championship" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="constructors-championship">
                Constructors
              </SelectItem>
              <SelectItem value="drivers-championship">Drivers</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <span
          className="text-[11px] px-2 py-0.5 rounded border border-border dark:border-border bg-gray-50 dark:bg-background font-semibold"
          title="Session averages are calculated using all available measurements for this session."
        >
          Standings
        </span>
      </div>
      <Separator className="mt-2 mb-1" />
      <div className="h-[300px] h-min-[220px] overflow-y-auto overscroll-contain">
        {showChampionship === "Constructors" ? (
          <ConstructorsStandingsTable
            constructorsStandings={constructorsStandings}
          />
        ) : (
          <DriversStandingsTable driversStandings={driversStandings} />
        )}
      </div>
    </div>
  );
};

export default Standings;
