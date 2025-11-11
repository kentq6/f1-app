import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface ConstructorsStandingsTableProps {
  constructorsStandings: {
    position?: number;
    team_name?: string;
    team_colour?: string;
    points?: number;
  }[];
}

const ConstructorsStandingsTable = ({
  constructorsStandings
}: ConstructorsStandingsTableProps) => {
  return (
    <Table className="text-xs">
      <TableHeader>
        <TableRow>
          <TableHead>Pos.</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-right">Points</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {constructorsStandings.map((team) => (
          <TableRow key={`${team.position ?? "np"}-${team.team_name ?? "nt"}`}>
            <TableCell className="font-medium">{team.position}</TableCell>
            <TableCell>
              <div className="inline-flex items-center gap-2 rounded-full">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: team.team_colour?.startsWith("#")
                      ? team.team_colour
                      : `#${team.team_colour}`,
                  }}
                />
                {team.team_name}
              </div>
            </TableCell>
            <TableCell className="text-right">{team.points}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ConstructorsStandingsTable;
