import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSessionFilters } from "@/app/providers/SessionFiltersProvider";
import { useSessionsData } from "@/app/providers/SessionsProvider";

const SessionSelect = () => {
  const {
    selectedYear,
    setSelectedYear,
    selectedTrack,
    setSelectedTrack,
    selectedSession,
    setSelectedSession,
  } = useSessionFilters();
  const { sessionsData } = useSessionsData();

  // Compute options for select fields
  const yearOptions = Array.from(new Set(sessionsData.map((s) => s.year))).sort(
    (a, b) => b - a
  );

  const trackOptions = Array.from(
    new Set(
      sessionsData
        .filter((s) => (selectedYear ? s.year === selectedYear : true))
        .map((s) => s.circuit_short_name)
    )
  ).sort((a, b) => {
    // Find the earliest session for each circuit to compare their first date
    const getFirstSessionDate = (track: string) => {
      const session = sessionsData
        .filter(
          (s) =>
            s.circuit_short_name === track &&
            (selectedYear ? s.year === selectedYear : true)
        )
        .sort(
          (a, b) =>
            new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
        )[0];
      return session
        ? new Date(session.date_start).getTime()
        : Number.MAX_SAFE_INTEGER;
    };
    return getFirstSessionDate(a) - getFirstSessionDate(b);
  });

  const sessionOptions = Array.from(
    new Set(
      sessionsData
        .filter(
          (s) =>
            (selectedYear ? s.year === selectedYear : true) &&
            (selectedTrack ? s.circuit_short_name === selectedTrack : true)
        )
        // Sort by date_start (oldest to newest) before mapping to names
        .sort(
          (a, b) =>
            new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
        )
        .map((s) => s.session_name)
    )
  );

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="hidden xl:block font-bold text-md">Session:</span>
      {/* Year */}
      <Select
        value={selectedYear === "" ? "" : String(selectedYear)}
        onValueChange={(val) => setSelectedYear(val === "" ? "" : Number(val))}
      >
        <SelectTrigger className="h-7 text-[11px]" aria-label="Select Year">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {yearOptions.map((year) => (
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
        onValueChange={(val) => setSelectedTrack(val)}
      >
        <SelectTrigger className="h-7 text-[11px]" aria-label="Select Track">
          <SelectValue placeholder="Track" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {trackOptions.map((track) => (
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
        onValueChange={(val) => setSelectedSession(val)}
      >
        <SelectTrigger className="h-7 text-[11px]" aria-label="Select Session">
          <SelectValue placeholder="Session" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {sessionOptions.map((session) => (
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
