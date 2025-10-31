import { useEffect, useState } from "react";
import { Separator } from "./ui/separator";
import { Session } from "@/types/session";
import { Driver } from "@/types/driver";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import axios from "axios";

type StartingGrid = {
  position: number;
  driver_number: number;
  lap_duration: number;
  meeting_key: number;
  session_key: number;
};

interface DriverData extends StartingGrid {
  name_acronym?: string;
  team_colour?: string;
  team_name?: string;
}

interface StartingGridTableProps {
  filteredSession: Session | null;
  driversData: Driver[];
}

const StartingGridTable = ({
  filteredSession,
  driversData,
}: StartingGridTableProps) => {
  const [startingGridData, setStartingGridData] = useState<DriverData[]>(
    []
  );

  // Safely load stint data only if filteredSession is not null
  useEffect(() => {
    if (!filteredSession) {
      setStartingGridData([]);
      return;
    }

    const fetchedStartingGrid = async () => {
      try {
        const response = await axios.get(
          `https://api.openf1.org/v1/starting_grid?session_key=${filteredSession.session_key}`
        );

        const results = response.data;

        // Create a quick lookup map from driversData (props)
        const driversMap = new Map<number, Driver>(
          driversData.map((d) => [d.driver_number, d])
        );

        // Merge driver info into starting grid results
        const mergedData: DriverData[] = results.map((result: StartingGrid) => {
          const driver = driversMap.get(result.driver_number);
          return {
            ...result,
            name_acronym: driver?.name_acronym ?? "UNK",
            team_colour: driver?.team_colour ?? "",
            team_name: driver?.team_name ?? "",
          };
        });

        setStartingGridData(mergedData);
      } catch (error) {
        console.error("Error fetching starting grid data: ", error);
      }
    };

    fetchedStartingGrid();
  }, [filteredSession, driversData]);

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-md border border-gray-100/50 dark:border-gray-700/50 p-4">
      <h1 className="text-lg font-bold text-left w-full pb-2">Starting Grid</h1>
      <Separator className="mb-4" />
      {/* Starting Grid Table */}
      <div className="">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-15">Pos.</TableHead>
              <TableHead className="text-right">Driver</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {startingGridData.map((data) => (
              <TableRow key={data.position + "-" + data.driver_number}>
                <TableCell className="font-medium">{data.position}</TableCell>
                <TableCell className="text-right">{data.name_acronym}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StartingGridTable;
