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
import { useFilteredSession } from "@/app/providers/FilteredSessionProvider";
import { useSelectedDrivers } from "@/app/providers/SelectedDriversProvider";

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

const PaceChart = () => {
  const { filteredSession } = useFilteredSession();
  const { selectedDrivers } = useSelectedDrivers();

  const [lapData, setLapData] = useState<LapTime[]>([]);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Safely load lap data only if filteredSession is not null
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

  // Only show data for selected drivers
  const visibleLapData = useMemo(() => {
    if (!selectedDrivers.length) return [];
    // selectedDrivers is likely Driver[] not number[], so map to driver_number for comparison
    const selectedNumbers = selectedDrivers.map(
      (d: { driver_number: number } | number) =>
        typeof d === "number" ? d : d.driver_number
    );
    return lapData.filter((lap) => selectedNumbers.includes(lap.driver_number));
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
        const driver = selectedDrivers.find(
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
  }, [grouped, selectedDrivers, lapNumbers]);

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
          options={chartOptions}
          className="h-full overflow-y-auto rounded-lg shadow-md px-2 border border-border dark:border-primary-border bg-gray-50 dark:bg-background"
        />
      </div>
    </div>
  );
};

export default PaceChart;
