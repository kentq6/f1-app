"use client";

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
import { useChampionshipInfo } from "@/hooks/useChampionshipInfo";

const ChampionshipInfo = () => {
  const { driversStandings, constructorsStandings } = useChampionshipInfo();

  const [showChampionship, setShowChampionship] = useState<
    "Constructors" | "Drivers"
  >("Drivers");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 pb-2">
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
            className="text-xs font-bold"
            aria-label="championshipSelector"
          >
            <SelectValue placeholder="Select Championship" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="drivers-championship">Drivers</SelectItem>
              <SelectItem value="constructors-championship">
                Constructors
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <span className="text-[11px] px-1 rounded border bg-gray-50 dark:bg-background font-semibold">
          Current Standings
        </span>
      </div>
      <Separator />
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
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

export default ChampionshipInfo;
