import { Session } from "@/types/session";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Driver } from "@/types/driver";
import { useEffect, useState } from "react";
import axios from "axios";

interface ConstructorsStandingTableProps {
  filteredSession: Session | null;
  driversData: Driver[];
}

type TeamResult = {
  position?: number;
  team_colour?: string;
  team_name?: string;
  points?: number;
};

const DummyData: TeamResult[] = [
  {
    position: 1,
    team_colour: "#4781D7",
    team_name: "Red Bull",
    points: 25,
  },
  {
    position: 2,
    team_colour: "#F47600",
    team_name: "McLaren",
    points: 18,
  },
  {
    position: 3,
    team_colour: "#1868DB",
    team_name: "Williams",
    points: 15,
  },
];

const ConstructorsStandingsTable = ({
  filteredSession,
  driversData,
}: ConstructorsStandingTableProps) => {
  const [teamData, setTeamData] = useState<TeamResult[]>(DummyData);

  useEffect(() => {
    const fetchedData = async () => {
      try {
        // Fetch sessions and drivers in parallel
        const [raceSessionsRes] = await Promise.all([
          axios.get(
            `https://api.openf1.org/v1/sessions?year=${filteredSession?.year}&session_name=Race`
          ),
          // axios.get<Driver[]>("https://api.openf1.org/v1/drivers"),
        ]);

        const raceSessionsResults = raceSessionsRes.data;
        // console.log(raceSessionsResults);

        // Create a quick lookup map for session keys from axios
        // To get all session keys from the raceSessionsResults array:
        const sessionKeys = raceSessionsResults.map((result: Session) => result.session_key);
        // console.log(sessionKeys);

        // Merge driver info into session results
        // const mergedData: DriverData[] = results.map((result: Result) => {
        //   const driver = driversMap.get(result.driver_number);
        //   return {
        //     ...result,
        //     name_acronym: driver?.name_acronym ?? "UNK",
        //     team_colour: driver?.team_colour ?? "",
        //     team_name: driver?.team_name ?? "",
        //   };

        //   setSessionResultsData(mergedData);
        // });
      } catch (error) {
        // If either request fails, handle the error
        console.error("Error fetching data:", error);
      }
    };

    fetchedData();
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pos.</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-right">Points</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teamData.map((result) => (
          <TableRow key={result.position}>
            <TableCell className="font-medium">{result.position}</TableCell>
            <TableCell>
              <div className="inline-flex items-center gap-2 rounded-full">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: result.team_colour?.startsWith("#")
                      ? result.team_colour
                      : `#${result.team_colour}`,
                  }}
                />
                {result.team_name}
              </div>
            </TableCell>
            <TableCell className="text-right">{result.points}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ConstructorsStandingsTable;
