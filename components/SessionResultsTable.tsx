import { useEffect, useState } from "react";
import { Separator } from "./ui/separator";
import { Session } from "@/types/session";
import { Driver } from "@/types/driver";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

type Result = {
  position: number;
  driver_number: number;
  number_of_laps: number;
  points: number;
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
  gap_to_leader: number;
  duration: number;
  meeting_key: number;
  session_key: number;
};

interface DriverData extends Result {
  name_acronym?: string;
  team_colour?: string;
  team_name?: string;
}

interface SessionResultsTableProps {
  filteredSession: Session | null;
  driversData: Driver[];
}

const SessionResultsTable = ({
  filteredSession,
  driversData,
}: SessionResultsTableProps) => {
  const [sessionResultsData, setSessionResultsData] = useState<DriverData[]>(
    []
  );

  // Safely load stint data only if filteredSession is not null
  useEffect(() => {
    if (!filteredSession) {
      setSessionResultsData([]);
      return;
    }

    const fetchedResults = async () => {
      try {
        const response = await axios.get(
          `https://api.openf1.org/v1/session_result?session_key=${filteredSession.session_key}`
        );

        const results = response.data;

        // Create a quick lookup map from driversData (props)
        const driversMap = new Map<number, Driver>(
          driversData.map((d) => [d.driver_number, d])
        );

        // Merge driver info into session results
        const mergedData: DriverData[] = results.map((result: Result) => {
          const driver = driversMap.get(result.driver_number);
          return {
            ...result,
            name_acronym: driver?.name_acronym ?? "UNK",
            team_colour: driver?.team_colour ?? "",
            team_name: driver?.team_name ?? "",
          };
        });

        setSessionResultsData(mergedData);
      } catch (error) {
        console.error("Error fetching session results data: ", error);
      }
    };

    fetchedResults();
  }, [filteredSession, driversData]);

  /**
   * Returns the display string for the "Time / Retired" column,
   * depending on DNF, DNS, DSQ flags, else fallback to duration/gap.
   */
  function getResultStatus(result: DriverData) {
    if (result.dsq) return "DSQ";
    if (result.dns) return "DNS";
    if (result.dnf) return "DNF";
    // display duration (in seconds) formatted as e.g. "+24.6s" if gap_to_leader, else winning time
    // fallback to duration
    if (result.position === 1) {
      // winner
      if (result.duration && !isNaN(result.duration)) {
        // show in mm:ss.sss, or just seconds
        const totalSeconds = result.duration / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        if (minutes > 0)
          return `${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
        return `${seconds.toFixed(3)}s`;
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
    <div className="w-full h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-4">
      <h1 className="text-lg font-bold text-left w-full pb-2">Results</h1>
      <Separator className="mb-4" />
      {/* Session Results Table */}
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-15">Pos.</TableHead>
              <TableHead>No.</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Laps</TableHead>
              <TableHead>Time / Retired</TableHead>
              <TableHead className="text-right">PTS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessionResultsData.map((result) => (
              <TableRow key={result.position + "-" + result.driver_number}>
                <TableCell className="font-medium">{result.position}</TableCell>
                <TableCell>{result.driver_number}</TableCell>
                <TableCell>{result.name_acronym}</TableCell>
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
                <TableCell className="text-right">{result.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SessionResultsTable;
