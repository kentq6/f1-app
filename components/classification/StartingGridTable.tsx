"use client";

import { useEffect, useState } from "react";
import { Separator } from "../ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import Image from "next/image";
import { useFilteredSession } from "@/app/providers/FilteredSessionProvider";
import { StartingGrid } from "@/types/startingGrid";
import { useSessionInfo } from "@/app/providers/SessionInfoProvider";

interface ClassificationData extends StartingGrid {
  name_acronym?: string;
  team_colour?: string;
  team_name?: string;
  headshot_url?: string;
}

interface StartingGridProps {
  classificationData: ClassificationData[];
}

const StartingGridTable = ({ classificationData }: StartingGridProps) => {
  const { filteredSession } = useFilteredSession();
  const { drivers } = useSessionInfo();

  const [startingGridData, setStartingGridData] = useState<
    ClassificationData[]
  >([]);

  // Safely load stint data only if filteredSession is not null
  useEffect(() => {
    if (!filteredSession) {
      setStartingGridData([]);
      return;
    }

    const fetchStartingGrid = async () => {
      try {
        // Merge driver info into starting grid results
        const mergedData: ClassificationData[] = classificationData.map(
          (result: StartingGrid) => {
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

        setStartingGridData(mergedData);
      } catch (err) {
        console.error("Error fetching starting grid data: ", err);
      }
    };

    fetchStartingGrid();
  }, [filteredSession, classificationData, drivers]);

  /**
   * Returns the display string for the "Lap Duration" column,
   * depending on DNF, DNS, DSQ flags, else fallback to duration/gap.
   */
  function getResultStatus(result: number) {
    if (result && !isNaN(result)) {
      // show in HH:mm:ss.mss
      const minutes = Math.floor((result % 3600) / 60);
      const secs = Math.floor(result % 60);
      const millis = Math.round((result % 1) * 1000);

      return `${String(minutes).padStart(1, "0")}:${String(secs).padStart(
        2,
        "0"
      )}:${String(millis).padStart(3, "0")}`;
    }
    return "--";
  }

  /**
   * Returns the display string for the "Gap to Leader" column in seconds.
   * If leader, returns "0.000"; else, difference to leader's lap_duration in seconds (3 decimals).
   */
  function getGapToLeader(result: ClassificationData) {
    // If missing data, return "--"
    if (
      typeof result.lap_duration !== "number" ||
      isNaN(result.lap_duration) ||
      !startingGridData ||
      startingGridData.length === 0
    ) {
      return "--";
    }

    // Find leader (position 1)
    const leader = startingGridData.find((d) => d.position === 1);

    if (
      !leader ||
      typeof leader.lap_duration !== "number" ||
      isNaN(leader.lap_duration)
    ) {
      return "--";
    }

    const gap = result.lap_duration - leader.lap_duration;
    return gap === 0 ? "Interval" : `+${gap.toFixed(3)}s`;
  }

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-sm font-bold pb-1">Starting Grid</h1>
      <Separator />
      {/* Starting Grid Table */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead>POS.</TableHead>
              <TableHead>DRIVER</TableHead>
              <TableHead>TEAM</TableHead>
              <TableHead>LAP</TableHead>
              <TableHead>GAP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {startingGridData.map((result) => (
              <TableRow key={result.position + "-" + result.driver_number}>
                <TableCell className="font-md">{result.position}</TableCell>
                <TableCell className="inline-flex items-center gap-2">
                  {result.headshot_url && (
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-foreground dark:border-foreground transition-transform duration-200 hover:scale-120"
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
                <TableCell>{getResultStatus(result.lap_duration)}</TableCell>
                <TableCell>{getGapToLeader(result)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StartingGridTable;
