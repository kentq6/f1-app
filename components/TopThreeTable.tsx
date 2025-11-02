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

interface TopThreeTableProps {
  filteredSession: Session | null;
  driversData: Driver[];
}

const TopThreeTable = ({
  filteredSession,
  driversData,
}: TopThreeTableProps) => {
  const [topThreeData, setTopThreeData] = useState<DriverData[]>(
    []
  );

  // Safely load stint data only if filteredSession is not null
  useEffect(() => {
    if (!filteredSession) {
      setTopThreeData([]);
      return;
    }

    const fetchedResults = async () => {
      try {
        const response = await axios.get(
          `https://api.openf1.org/v1/session_result?session_key=${filteredSession.session_key}&position<=3`
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

        setTopThreeData(mergedData);
      } catch (error) {
        console.error("Error fetching session results data: ", error);
      }
    };

    fetchedResults();
  }, [filteredSession, driversData]);

  return (
    <div>
      <h1 className="text-md font-bold pb-1">Top Three</h1>
      <Separator className="mb-1" />
      {/* Session Results Table */}
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pos.</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Team</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topThreeData.map((result) => (
              <TableRow key={result.position + "-" + result.driver_number}>
                <TableCell className="font-medium">{result.position}</TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TopThreeTable;
