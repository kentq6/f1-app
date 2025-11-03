import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SessionSelectProps {
  selectedYear: number | "";
  selectedTrack: string;
  selectedSession: string;
  yearOptions: number[];
  trackOptions: string[];
  sessionOptions: string[];
  onYearChange: (val: number | "") => void;
  onTrackChange: (val: string) => void;
  onSessionChange: (val: string) => void;
}

const SessionSelect: React.FC<SessionSelectProps> = ({
  selectedYear,
  selectedTrack,
  selectedSession,
  yearOptions,
  trackOptions,
  sessionOptions,
  onYearChange,
  onTrackChange,
  onSessionChange,
}) => {
  return (
    <div className="flex items-center gap-2 w-full">
      <span className="font-bold uppercase tracking-wider ">
        Search Session:
      </span>
      {/* Year */}
      <Select
        value={selectedYear === "" ? "" : String(selectedYear)}
        onValueChange={val => onYearChange(val === "" ? "" : Number(val))}
      >
        <SelectTrigger
          className="h-7 text-[11px] "
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
        onValueChange={val => onTrackChange(val)}
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
        onValueChange={val => onSessionChange(val)}
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
