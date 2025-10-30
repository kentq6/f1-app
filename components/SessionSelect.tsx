import React from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Session } from "@/types/session";

interface SessionSelectProps {
  selectedYear: number | "";
  selectedTrack: string;
  selectedSession: string;
  filteredSession: Session | null;
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
  filteredSession,
  yearOptions,
  trackOptions,
  sessionOptions,
  onYearChange,
  onTrackChange,
  onSessionChange,
}) => {
  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-4">
      <h1 className="text-lg font-bold text-left w-full pb-2">
        Session Select
      </h1>
      <Separator className="mb-4" />

      {/* Session Info Card */}
      {filteredSession && (
        <div className="mb-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-row items-center justify-between gap-1">
          <div className="flex flex-col">
            <div className="font-semibold text-base">
              {filteredSession.year} {filteredSession.country_name}
            </div>
            <div className="text-sm opacity-80 mt-1">
              <span className="font-medium">Date: </span>
              {new Date(filteredSession.date_start).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="text-sm opacity-80 mt-1">
              <span className="font-medium">Session Type:</span>{" "}
              {filteredSession.session_type}
            </div>
          </div>
          <Image
            src={`/country-flags/${filteredSession.country_code}.svg`}
            height={60}
            width={100}
            alt={`${filteredSession.country_code}`}
            className="mr-3"
          />
        </div>
      )}

      {/* Filter Dropdowns */}
      <div className="flex justify-start items-center gap-6 mb-4 p-4">
        {/* Year */}
        <div>
          <label className="block text-sm font-bold mb-1">Year</label>
          <Select
            value={selectedYear === "" ? "" : String(selectedYear)}
            onValueChange={(val) => onYearChange(val === "" ? "" : Number(val))}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Years</SelectLabel>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Track */}
        <div>
          <label className="block text-sm font-bold mb-1">Track</label>
          <Select
            value={selectedTrack}
            onValueChange={(val) => onTrackChange(val)}
          >
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Select Track" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Tracks</SelectLabel>
                {trackOptions.map((track) => (
                  <SelectItem key={track} value={track}>
                    {track}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Session */}
        <div>
          <label className="block text-sm font-bold mb-1">Session</label>
          <Select
            value={selectedSession}
            onValueChange={(val) => onSessionChange(val)}
          >
            <SelectTrigger className="w-30">
              <SelectValue placeholder="Select Session" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sessions</SelectLabel>
                {sessionOptions.map((session) => (
                  <SelectItem key={session} value={session}>
                    {session}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SessionSelect;
