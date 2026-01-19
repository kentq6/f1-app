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
import { Separator } from "./ui/separator";
import { useTheme } from "next-themes";
import { useSelectedDrivers } from "@/app/providers/SelectedDriversProvider";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

type Lap = {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  lap_number: number;
  date_start: string;
  duration_sector_1: number;
  duration_sector_2: number;
  duration_sector_3: number;
  i1_speed: number;
  i2_speed: number;
  is_pit_out_lap: boolean;
  lap_duration: number;
  segments_sector_1: number[];
  segments_sector_2: number[];
  segments_sector_3: number[];
  st_speed: number;
};

type DriverPace = {
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

const PaceChart = () => {
  const filteredSession = useSelector((state: RootState) => state.filteredSession.filteredSession);
  const { selectedDrivers } = useSelectedDrivers();

  const [paceData, setPaceData] = useState<DriverPace[]>([]);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: lapData } = useQuery({
    queryKey: ["lapData", filteredSession?.session_key],
    queryFn: async () => {
      const res = await fetch(
        `/api/laps?session_key=${filteredSession?.session_key}`
      );
      if (!res.ok) {
        const details = await res.json().catch(() => ({}));
        throw new Error(details?.error || "Failed to fetch lap data");
      }
      return res.json();
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours, how long data is considered fresh before becoming stake and eligible for a refetch
    gcTime: 48 * 60 * 60 * 1000, // 48 hours, how long inactive cache data stays in memory before it is garbage collected
  });

  // Safely load lap data only if filteredSession is not null
  useEffect(() => {
    if (!filteredSession || !lapData) {
      setPaceData([]);
      return;
    }

    // Filter valid laps
    const validLaps = lapData.filter(
      (lap: Lap) => lap.lap_duration && lap.lap_duration > 0
    );

    // Merge driver name_acronym into tire stints and update state
    setPaceData(
      validLaps.map((lap: Lap) => ({
        driver_number: lap.driver_number,
        lap_number: lap.lap_number,
        lap_duration: lap.lap_duration,
      }))
    );
  }, [filteredSession, lapData]);

  // Only show data for selected drivers
  const visiblePaceData = useMemo(() => {
    if (!selectedDrivers.length) return [];
    // selectedDrivers is likely Driver[] not number[], so map to driver_number for comparison
    const selectedNumbers = selectedDrivers.map(
      (d: { driver_number: number } | number) =>
        typeof d === "number" ? d : d.driver_number
    );
    return paceData.filter((lap) =>
      selectedNumbers.includes(lap.driver_number)
    );
  }, [paceData, selectedDrivers]);

  // Group laps per driver
  const grouped = useMemo(() => {
    const acc: Record<number, DriverPace[]> = {};
    for (const lap of visiblePaceData) {
      if (!acc[lap.driver_number]) acc[lap.driver_number] = [];
      acc[lap.driver_number].push(lap);
    }
    return acc;
  }, [visiblePaceData]);

  // Collect all lap numbers to use as labels
  const lapNumbers = useMemo(() => {
    const set = new Set<number>();
    for (const lap of visiblePaceData) set.add(lap.lap_number);
    return Array.from(set).sort((a, b) => a - b);
  }, [visiblePaceData]);

  // Build datasets for chartjs
  const datasets = useMemo(() => {
    return Object.entries(grouped)
      .map(([driverNumber, laps]) => {
        const driver = selectedDrivers.find(
          (d) => d.driver_number === Number(driverNumber)
        );
        if (!driver) return null;

        const color = driver.team_colour?.startsWith("#")
          ? driver.team_colour
          : `#${driver.team_colour}`;

        // Fill gaps with nulls, so every driver's line stays aligned
        const paceDataByNumber: Record<number, number> = {};
        for (const lap of laps) {
          paceDataByNumber[lap.lap_number] = lap.lap_duration;
        }
        const data: (number | null)[] = lapNumbers.map(
          (lapNum) => paceDataByNumber[lapNum] ?? null
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
  }, [grouped, selectedDrivers, lapNumbers]);

  const chartData = useMemo(
    () => ({
      labels: lapNumbers,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      datasets: datasets as any[],
    }),
    [lapNumbers, datasets]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label: (ctx: any) => `${ctx.dataset.label}: ${ctx.formattedValue}s`,
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
      <div className="flex items-center gap-3 pb-1">
        <h1 className="text-sm font-bold">Pace Chart</h1>
        {selectedDrivers.length === 0 && (
          <span className="hidden sm:block text-sm text-gray-500">
            Select a driver to view lap data
          </span>
        )}
      </div>
      <Separator />
      <div className="flex-1 min-h-0 mt-2">
        <Line
          data={chartData}
          options={options}
          className="h-full overflow-y-auto rounded-lg shadow-md px-2 border border-border dark:border-primary-border bg-gray-50 dark:bg-background"
        />
      </div>
    </div>
  );
};

export default PaceChart;
