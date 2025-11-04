import { useState } from "react";
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

interface StandingsProps {
  filteredSession: Session | null;
  driversData: Driver[];
}

const Standings = ({ filteredSession, driversData }: StandingsProps) => {
  const [showChampionship, setShowChampionship] = useState<
    "Constructors" | "Drivers"
  >("Constructors");

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
            filteredSession={filteredSession}
            driversData={driversData}
          />
        ) : (
          <DriversStandingsTable />
        )}
      </div>
    </div>
  );
};

export default Standings;
