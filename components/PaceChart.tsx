"use client";

import { useEffect, useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Title,
} from "chart.js";
import { Session } from "@/types/session";
import { Driver } from "@/types/driver";
import { Separator } from "./ui/separator";
import { useTheme } from "next-themes";

// UI Select controls - you may need to update import path as per your project
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
} from "./ui/select";
// import getLapTimesBySession from "@/lib/external/getLapTimesBySession";

type LapTime = {
  driver_number: number;
  lap_number: number;
  lap_duration: number;
};

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Title
);

interface RacePaceChartProps {
  filteredSession: Session | null;
  driversData: Driver[];
}

const RacePaceChart = ({
  filteredSession,
  driversData,
}: RacePaceChartProps) => {
  const [lapData, setLapData] = useState<LapTime[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<number[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasManuallyCleared, setHasManuallyCleared] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Build lists for driver selection and acronyms
  const drivers = useMemo(
    () => Array.from(new Set(driversData.map((d) => d.driver_number))).sort((a, b) => a - b),
    [driversData]
  );

  const driverAcronymMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const d of driversData) {
      map[d.driver_number] = d.name_acronym ?? "";
    }
    return map;
  }, [driversData]);

  // --- DATA LOADING ---
  useEffect(() => {
    if (!filteredSession) {
      setLapData([]);
      return;
    }

    const fetchLapTimes = async () => {
      try {
        const res = await fetch(
          `/api/laps?session_key=${encodeURIComponent(
            filteredSession.session_key
          )}`
        );
        if (!res.ok) {
          const details = await res.json().catch(() => ({}));
          throw new Error(details?.error || "Failed to fetch tire stints");
        }
        const lapTimesRaw = await res.json();

        // Filter valid laps
        const validLaps = lapTimesRaw.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (lap: any) => lap.lap_duration && lap.lap_duration > 0
        );

        setLapData(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          validLaps.map((lap: any) => ({
            driver_number: lap.driver_number,
            lap_number: lap.lap_number,
            lap_duration: lap.lap_duration,
          }))
        );
      } catch (err) {
        setLapData([]);
        console.error("Error fetching lap data: ", err);
      }
    };

    fetchLapTimes();
  }, [filteredSession]);

  // When filteredSession or driversData changes, select 5 by default unless user cleared manually
  useEffect(() => {
    if (!hasManuallyCleared && drivers.length > 0) {
      setSelectedDrivers(drivers.slice(0, 5));
    }
    // Don't include hasManuallyCleared in deps intentionally to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drivers.join(",")]);

  // ==========================
  //    Data Processing
  // ==========================

  // Only show data for selected drivers
  const visibleLapData = useMemo(() => {
    if (!selectedDrivers.length) return [];
    return lapData.filter((lap) => selectedDrivers.includes(lap.driver_number));
  }, [lapData, selectedDrivers]);

  // Group laps per driver
  const grouped = useMemo(() => {
    const acc: Record<number, LapTime[]> = {};
    for (const lap of visibleLapData) {
      if (!acc[lap.driver_number]) acc[lap.driver_number] = [];
      acc[lap.driver_number].push(lap);
    }
    return acc;
  }, [visibleLapData]);

  // Collect all lap numbers to use as labels
  const lapNumbers = useMemo(() => {
    const set = new Set<number>();
    for (const lap of visibleLapData) set.add(lap.lap_number);
    return Array.from(set).sort((a, b) => a - b);
  }, [visibleLapData]);

  // Build datasets for chartjs
  const datasets = useMemo(() => {
    return Object.entries(grouped)
      .map(([driverNumber, laps]) => {
        const driver = driversData.find(
          (d) => d.driver_number === Number(driverNumber)
        );
        if (!driver) return null;

        const color = driver.team_colour?.startsWith("#")
          ? driver.team_colour
          : `#${driver.team_colour}`;

        // Fill gaps with nulls, so every driver's line stays aligned
        const lapDataByNumber: Record<number, number> = {};
        for (const lap of laps) {
          lapDataByNumber[lap.lap_number] = lap.lap_duration;
        }
        const data: (number | null)[] = lapNumbers.map(
          (lapNum) => lapDataByNumber[lapNum] ?? null
        );

        return {
          label: driver.name_acronym ?? `#${driver.driver_number}`,
          data,
          borderColor: color,
          backgroundColor: color,
          pointRadius: 0,
          tension: 0.3,
          borderWidth: 2,
        };
      })
      .filter(Boolean);
  }, [grouped, driversData, lapNumbers]);

  const chartData = useMemo(
    () => ({
      labels: lapNumbers,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      datasets: datasets as any[],
    }),
    [lapNumbers, datasets]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label: (ctx: any) =>
              `${ctx.dataset.label}: ${ctx.formattedValue}s`,
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Lap Number",
            color: isDark ? "#adb5bd" : "#424242",
          },
          ticks: { color: isDark ? "#adb5bd" : "#424242" },
        },
        y: {
          title: {
            display: true,
            text: "Lap Duration (s)",
            color: isDark ? "#adb5bd" : "#424242",
          },
          ticks: { color: isDark ? "#adb5bd" : "#424242" },
        },
      },
    }),
    [isDark]
  );

  // ========================
  // Selection Controls
  // ========================
  const handleDriverToggle = (driverNumber: number) => {
    setSelectedDrivers((prev) => {
      if (prev.includes(driverNumber)) {
        return prev.filter((d) => d !== driverNumber);
      } else {
        return [...prev, driverNumber].sort((a, b) => a - b);
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedDrivers(drivers);
    setHasManuallyCleared(false);
  };

  const handleClearAll = () => {
    setSelectedDrivers([]);
    setHasManuallyCleared(true);
  };

  // ==========================

  if (!filteredSession) {
    // Show a message if required session data not provided
    return (
      <div className="flex flex-col h-full">
        <h1 className="text-md font-bold pb-1">Stints Chart</h1>
        <Separator className="mb-1" />
        <div className="flex items-center justify-center h-full font-medium text-center">
          <p>Select a session to view tire stint data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-sm font-bold pb-1">Pace Chart</h1>
      <Separator />
      <div className="flex justify-between items-center mt-2">
        {/* Left side is now empty but can be used for future controls or just spacing */}
        <div></div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">
            {selectedDrivers.length} driver
            {selectedDrivers.length !== 1 ? "s" : ""} selected
          </span>
          {/* Driver Selection Dropdown */}
          <Select
            open={isDropdownOpen}
            onOpenChange={setIsDropdownOpen}
            value=""
            onValueChange={() => {}}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Drivers" />
            </SelectTrigger>
            <SelectContent align="end" className="w-44">
              <div className="p-2 border-b flex gap-2 bg-muted/60">
                {/* Select All Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectAll();
                  }}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary text-primary-foreground px-2 py-1 text-xs font-medium shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  type="button"
                  tabIndex={-1}
                >
                  Select All
                </button>
                {/* Clear All Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearAll();
                  }}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-muted text-foreground px-2 py-1 text-xs font-medium shadow-sm transition-colors hover:bg-muted/70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  type="button"
                  tabIndex={-1}
                >
                  Clear All
                </button>
              </div>
              <SelectGroup>
                {drivers.map((driverNumber, index) => (
                  <div
                    key={`driver-${driverNumber}-race-pace-${index}`}
                    className="flex items-center gap-2 px-2 py-[5px] cursor-pointer rounded hover:bg-muted/80 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDriverToggle(driverNumber);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDrivers.includes(driverNumber)}
                      readOnly
                      className="h-4 w-4 border-gray-300 rounded accent-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      tabIndex={-1}
                    />
                    <span className="text-xs font-medium text-foreground">
                      {driverAcronymMap[driverNumber]
                        ? `${driverAcronymMap[driverNumber]} ${driverNumber}`
                        : `Driver ${driverNumber}`}
                    </span>
                  </div>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex-1 min-h-0 mt-2">
        {selectedDrivers.length > 0 ? (
          <div className="flex flex-col h-full">
            <Line
              data={chartData}
              options={chartOptions}
              className="h-full overflow-y-auto rounded-lg shadow-md px-2 border border-border dark:border-primary-border bg-gray-50 dark:bg-background"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            <p>Please select at least one driver to view lap data</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RacePaceChart;