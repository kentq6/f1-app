import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSessionFilters } from "@/app/providers/SessionFiltersProvider";

interface SessionSelectProps {
  yearOptions: number[];
  trackOptions: string[];
  sessionOptions: string[];
}

const SessionSelect: React.FC<SessionSelectProps> = ({
  yearOptions,
  trackOptions,
  sessionOptions,
}) => {
  const { selectedYear, setSelectedYear, selectedTrack, setSelectedTrack, selectedSession, setSelectedSession } = useSessionFilters();

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="hidden md:block font-bold text-md">
        Select Session:
      </span>
      <span className="md:hidden font-bold text-sm">
        Session:
      </span>
      {/* Year */}
      <Select
        value={selectedYear === "" ? "" : String(selectedYear)}
        onValueChange={val => setSelectedYear(val === "" ? "" : Number(val))}
      >
        <SelectTrigger
          className="h-7 text-[11px]"
          aria-label="Select Year"
        >
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {yearOptions.map(year => (
              <SelectItem key={year} value={String(year)} className="text-xs">
                {year}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Track */}
      <Select
        value={selectedTrack}
        onValueChange={val => setSelectedTrack(val)}
      >
        <SelectTrigger
          className="h-7 text-[11px]"
          aria-label="Select Track"
        >
          <SelectValue placeholder="Track" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {trackOptions.map(track => (
              <SelectItem key={track} value={track} className="text-xs">
                {track}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Session */}
      <Select
        value={selectedSession}
        onValueChange={val => setSelectedSession(val)}
      >
        <SelectTrigger
          className="h-7 text-[11px]"
          aria-label="Select Session"
        >
          <SelectValue placeholder="Session" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {sessionOptions.map(session => (
              <SelectItem key={session} value={session} className="text-xs">
                {session}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SessionSelect;
