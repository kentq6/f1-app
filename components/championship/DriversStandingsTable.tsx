import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import Image from "next/image";

interface DriversStandingsTableProps {
  driversStandings: {
    position?: number;
    team_name?: string;
    team_colour?: string;
    points?: number;
    first_name?: string;
    last_name?: string;
    headshot_url?: string;
    country_code?: string;
  }[];
}

// NOTE: Currently, the nationality for each driver is unavailable due to the way
// the lookup is executed

const DriversStandingsTable = ({
  driversStandings,
}: DriversStandingsTableProps) => {
  return (
    <Table className="text-xs">
      <TableHeader>
        <TableRow>
          <TableHead>POS.</TableHead>
          <TableHead>DRIVER</TableHead>
          {/* <TableHead>Nationality</TableHead> */}
          <TableHead>TEAM</TableHead>
          <TableHead className="text-right">PTS</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {driversStandings.map((driver) => (
          <TableRow
            key={`driver-${driver.first_name ?? ""}-${driver.last_name ?? ""}`}
          >
            <TableCell className="font-medium">{driver.position}</TableCell>
            <TableCell>
              <div className="inline-flex items-center gap-2 rounded-full">
                {driver.headshot_url && (
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-foreground dark:border-foreground transition-transform duration-200 hover:scale-120"
                    style={{
                      backgroundColor: driver.team_colour?.startsWith("#")
                        ? driver.team_colour
                        : `#${driver.team_colour}`,
                    }}
                  >
                    <Image
                      src={driver.headshot_url}
                      height={40}
                      width={40}
                      alt=""
                      className="object-cover w-full h-full rounded-full "
                    />
                  </span>
                )}
                <span>{driver.first_name + " " + driver.last_name}</span>
              </div>
            </TableCell>
            {/* <TableCell>{driver.country_code}</TableCell> */}
            <TableCell>
              <div className="inline-flex items-center gap-2 rounded-full">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: driver.team_colour?.startsWith("#")
                      ? driver.team_colour
                      : `#${driver.team_colour}`,
                  }}
                />
                {driver.team_name}
              </div>
            </TableCell>
            <TableCell className="text-right">{driver.points}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DriversStandingsTable;
