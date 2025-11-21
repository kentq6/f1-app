"use client";

import { useEffect, useState } from "react";
import { Separator } from "../ui/separator";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { SessionResult } from "@/types/sessionResult";
import { useFilteredSession } from "@/app/providers/FilteredSessionProvider";
import { useSessionInfo } from "@/app/providers/SessionInfoProvider";

interface ClassificationData extends SessionResult {
  name_acronym?: string;
  team_colour?: string;
  team_name?: string;
  headshot_url?: string;
}

interface SessionResultsProps {
  classificationData: ClassificationData[];
}

const SessionResults = ({ classificationData }: SessionResultsProps) => {
  const { filteredSession } = useFilteredSession();
  const { drivers } = useSessionInfo();

  const [sessionResults, setSessionResultsData] = useState<
    ClassificationData[]
  >([]);

  // Safely load stint data only if filteredSession is not null
  useEffect(() => {
    if (!filteredSession) {
      setSessionResultsData([]);
      return;
    }

    const fetchedResults = async () => {
      try {
        // Merge driver info into session results
        const mergedData: ClassificationData[] = classificationData.map(
          (result: SessionResult) => {
            const driver = drivers.find(
              (d) => d.driver_number === result.driver_number
            );
            return {
              ...result,
              name_acronym: driver?.name_acronym ?? "UNK",
              team_colour: driver?.team_colour ?? "",
              team_name: driver?.team_name ?? "",
              headshot_url: driver?.headshot_url ?? "",
            };
          }
        );

        setSessionResultsData(mergedData);
      } catch (err) {
        console.error("Error fetching session results data: ", err);
      }
    };

    fetchedResults();
  }, [filteredSession, classificationData, drivers]);

  /**
   * Returns the display string for the "Time / Retired" column,
   * depending on DNF, DNS, DSQ flags, else fallback to duration/gap.
   */
  function getResultStatus(result: ClassificationData) {
    if (result.dsq) return "DSQ";
    if (result.dns) return "DNS";
    if (result.dnf) return "DNF";

    // Display "+N LAP(S)" if lapped
    if (typeof result.gap_to_leader === "string") {
      return result.gap_to_leader;
    }

    // display duration (in seconds) formatted as e.g. "+24.6s" if gap_to_leader, else winning time
    if (result.position === 1) {
      // winner
      if (result.duration && !isNaN(result.duration)) {
        // show in HH:mm:ss.mss
        const hours = Math.floor(result.duration / 3600);
        const minutes = Math.floor((result.duration % 3600) / 60);
        const secs = Math.floor(result.duration % 60);
        const millis = Math.round((result.duration % 1) * 1000);

        const base = `${String(minutes).padStart(2, "0")}:${String(
          secs
        ).padStart(2, "0")}:${String(millis).padStart(3, "0")}`;
        return hours > 0 ? `${String(hours).padStart(1, "0")}:${base}` : base;
      }
      return "--";
    }
    if (
      "gap_to_leader" in result &&
      result.gap_to_leader != null &&
      !isNaN(result.gap_to_leader)
    ) {
      return `+${result.gap_to_leader.toFixed(3)}s`;
    }
    return "--";
  }

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-sm font-bold pb-1">Session Results</h1>
      <Separator />
      {/* Table */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead>Pos.</TableHead>
              <TableHead>No.</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Laps</TableHead>
              <TableHead>Time</TableHead>
              {(filteredSession?.session_type === "Race" ||
                filteredSession?.session_type === "Sprint") && (
                <TableHead>PTS</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessionResults.map((result) => (
              <TableRow key={result.position + "-" + result.driver_number}>
                <TableCell className="font-medium">{result.position}</TableCell>
                <TableCell>{result.driver_number}</TableCell>
                <TableCell className="inline-flex items-center gap-2">
                  {result.headshot_url && (
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-foreground dark:border-foreground overflow-hidden transition-transform duration-200 hover:scale-120"
                      style={{
                        backgroundColor: result.team_colour?.startsWith("#")
                          ? result.team_colour
                          : `#${result.team_colour}`,
                      }}
                    >
                      <Image
                        src={result.headshot_url}
                        height={40}
                        width={40}
                        alt=""
                        className="object-cover w-full h-full rounded-full "
                      />
                    </span>
                  )}
                  {result.name_acronym}
                </TableCell>
                <TableCell>
                  <div className="inline-flex items-center gap-2 rounded-full">
                    <span
                      className="w-2.5 h-2.5 rounded-full "
                      style={{
                        backgroundColor: result.team_colour?.startsWith("#")
                          ? result.team_colour
                          : `#${result.team_colour}`,
                      }}
                    />
                    {result.team_name}
                  </div>
                </TableCell>
                <TableCell>{result.number_of_laps}</TableCell>
                <TableCell>{getResultStatus(result)}</TableCell>
                {(filteredSession?.session_type === "Race" ||
                  filteredSession?.session_type === "Sprint") && (
                  <TableCell>{result.points}</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SessionResults;
