"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { useTheme } from "next-themes";
import { Separator } from "./ui/separator";
import { useFilteredSession } from "@/app/providers/FilteredSessionProvider";
import { useSessionInfo } from "@/app/providers/SessionInfoProvider";
import { useSelectedDrivers } from "@/app/providers/SelectedDriversProvider";
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type Stint = {
  compound: string;
  driver_number: number;
  lap_end: number;
  lap_start: number;
  meeting_key: number;
  session_key: number;
  stint_number: number;
  tyre_age_at_start: number;
};

interface DriverNameAcronym extends Stint {
  name_acronym?: string;
}

const StintsChart = () => {
  const { filteredSession } = useFilteredSession();
  const { drivers } = useSessionInfo();
  const { selectedDrivers } = useSelectedDrivers();

  const [tireStintsData, setTireStintsData] = useState<DriverNameAcronym[]>([]);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Safely load stint data only if filteredSession is not null
  useEffect(() => {
    if (!filteredSession) {
      setTireStintsData([]);
      return;
    }

    const fetchStints = async () => {
      try {
        const res = await fetch(
          `/api/stints?session_key=${encodeURIComponent(
            filteredSession.session_key
          )}`
        );
        if (!res.ok) {
          const details = await res.json().catch(() => ({}));
          throw new Error(details?.error || "Failed to fetch tire stints");
        }
        const tireStintsRaw = await res.json();
        const tireStints: Stint[] = Array.isArray(tireStintsRaw)
          ? tireStintsRaw
          : [];

        // Merge driver name_acronym into tire stints
        const mappedTireStints: DriverNameAcronym[] = tireStints.map(
          (stint) => {
            const driver = drivers.find(
              (driver) => driver.driver_number === stint.driver_number
            );
            return {
              ...stint,
              name_acronym: driver?.name_acronym ?? "UNK",
            };
          }
        );

        setTireStintsData(mappedTireStints);
      } catch (error) {
        console.error("Error fetching tire stints data: ", error);
      }
    };

    fetchStints();
  }, [filteredSession, drivers]);

  // Group stints by driver, sort stints by lap_start within each driver
  const driverStintsMap = useMemo(() => {
    const map = new Map<number, Stint[]>();
    for (const stint of tireStintsData) {
      if (!map.has(stint.driver_number)) map.set(stint.driver_number, []);
      map.get(stint.driver_number)!.push(stint);
    }
    // Sort each driver's stints by lap_start (and then by stint_number)
    for (const arr of map.values()) {
      arr.sort((a, b) =>
        a.lap_start !== b.lap_start
          ? a.lap_start - b.lap_start
          : a.stint_number - b.stint_number
      );
    }
    return map;
  }, [tireStintsData]);

  // F1 compound colors - move to useCallback for stable reference
  const getCompoundColor = useCallback(
    (compound: string) => {
      switch (compound) {
        case "SOFT":
          return {
            bg: isDark ? "rgba(218, 41, 28, 0.5)" : "rgba(218, 41, 28, 0.6)", // #DA291C
            border: isDark ? "rgba(218, 41, 28, 0.8)" : "rgba(218, 41, 28, 1)",
          };
        case "MEDIUM":
          return {
            bg: isDark ? "rgba(255, 215, 0, 0.5)" : "rgba(255, 215, 0, 0.6)", // #FFD700
            border: isDark ? "rgba(255, 215, 0, 0.8)" : "rgba(255, 215, 0, 1)",
          };
        case "HARD":
          return {
            bg: isDark
              ? "rgba(255, 255, 255, 0.5)"
              : "rgba(255, 255, 255, 0.6)", // #FFFFFF
            border: isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(30, 30, 30, 1)",
          };
        case "INTERMEDIATE":
          return {
            bg: isDark ? "rgba(67, 176, 42, 0.5)" : "rgba(67, 176, 42, 0.6)", // #43B02A
            border: isDark ? "rgba(67, 176, 42, 0.8)" : "rgba(67, 176, 42, 1)",
          };
        case "WET":
          return {
            bg: isDark ? "rgba(0, 103, 173, 0.5)" : "rgba(0, 103, 173, 0.6)", // #0067AD
            border: isDark ? "rgba(0, 103, 173, 0.8)" : "rgba(0, 103, 173, 1)",
          };
        default:
          return {
            bg: isDark
              ? "rgba(128, 128, 128, 0.5)"
              : "rgba(128, 128, 128, 0.6)", // fallback gray
            border: isDark
              ? "rgba(128, 128, 128, 0.8)"
              : "rgba(128, 128, 128, 1)",
          };
      }
    },
    [isDark]
  );

  // Chart.js data for correctly rendered contiguous stints
  const chartData = useMemo(() => {
    /**
     * Chart.js expects y labels/categories to come from y.labels field below.
     * For each driver, their stints are on one row, non-overlapping.
     * For each stint, x = [lap_start, lap_end] (inclusive).
     */
    type ChartDataItem = {
      x: number[]; // [lap_start, lap_end]
      y: string; // driver label
      compound: string;
      stint: Stint;
    };

    const dataArray: ChartDataItem[] = [];
    const bgColors: string[] = [];
    const borderColors: string[] = [];

    selectedDrivers.forEach((driver) => {
      const driverLabel =
        `${driver.name_acronym} ${driver.driver_number}` ||
        `Driver ${driver.driver_number}`;
      const arr = driverStintsMap.get(driver.driver_number) || [];
      arr.forEach((stint) => {
        // For openF1, lap_start/lap_end are inclusive stints
        // Chart.js expects [start, end] as the bar value.
        // If start==end: show as single lap bar
        const colors = getCompoundColor(stint.compound);
        dataArray.push({
          x: [stint.lap_start, stint.lap_end],
          y: driverLabel,
          compound: stint.compound,
          stint,
        });
        bgColors.push(colors.bg);
        borderColors.push(colors.border);
      });
    });

    return {
      datasets: [
        {
          label: "Stints",
          data: dataArray,
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 0.75,
          borderSkipped: false,
          barThickness:
            selectedDrivers.length > 15
              ? 5
              : selectedDrivers.length > 10
              ? 7
              : selectedDrivers.length > 5
              ? 9
              : 11,
          categoryPercentage: 0.8,
          barPercentage: 0.96,
          parsing: {
            xAxisKey: "x",
            yAxisKey: "y",
          },
        },
      ],
    };
  }, [selectedDrivers, driverStintsMap, getCompoundColor]);

  // Get min and max lap numbers for scaling
  const [lapMin, lapMax] = useMemo(() => {
    let min: number = Infinity;
    let max: number = -Infinity;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chartData.datasets[0]?.data?.forEach((d: any) => {
      if (Array.isArray(d.x) && d.x.length === 2) {
        if (typeof d.x[0] === "number" && d.x[0] < min) min = d.x[0];
        if (typeof d.x[1] === "number" && d.x[1] > max) max = d.x[1];
      }
    });
    if (!isFinite(min) || min === Infinity) min = 0;
    if (!isFinite(max) || max === -Infinity) max = 0;
    return [min, max];
  }, [chartData]);

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark
          ? "rgba(24, 24, 27, 0.98)" // matches dark dropdowns and popovers
          : "rgba(250, 250, 250, 0.98)", // matches light dropdowns and popovers
        titleColor: isDark ? "#f3f4f6" : "#0f172a", // zinc-100 or slate-950
        bodyColor: isDark ? "#e5e7eb" : "#334155", // zinc-200 or slate-700
        borderColor: isDark ? "#27272a" : "#e5e7eb", // zinc-900 or zinc-200
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (ctx: import("chart.js").TooltipItem<"bar">) {
            const d = ctx.raw as {
              x: [number, number];
              y: string;
              compound: string;
              stint: Stint;
            };
            if (!d) return "";
            const [start, end] = d.x;
            return ` ${d.y} - ${d.compound} Laps ${start} - ${end}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "linear" as const,
        title: {
          display: true,
          text: "Lap Number",
          color: isDark ? "#adb5bd" : "#424242", // Axis title color
        },
        beginAtZero: true,
        grid: {
          display: true,
          color: isDark
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(127, 140, 141, 0.18)",
          borderColor: isDark ? "#adb5bd" : "#424242",
          lineWidth: 1.5,
        },
        color: isDark ? "#adb5bd" : "#424242", // x-axis labels: white in dark, black otherwise
        min: lapMin,
        max: lapMax,
        ticks: {
          stepSize: 1,
          precision: 0,
          color: isDark ? "#adb5bd" : "#424242", // x-axis tick labels color
        },
      },
      y: {
        type: "category" as const,
        labels: selectedDrivers.map(
          (driver) =>
            `${driver.name_acronym} ${driver.driver_number}` ||
            `Driver ${driver.driver_number}`
        ),
        title: {
          display: true,
          text: "Driver Number",
          color: isDark ? "#adb5bd" : "#424242", // Axis title color
        },
        grid: {
          display: false, // Hide x-axis grid lines
        },
        ticks: {
          color: isDark ? "#adb5bd" : "#424242", // y-axis tick labels color
        },
      },
    },
    elements: {
      bar: {
        borderWidth: 1,
        borderRadius: 5,
      },
    },
  };

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
        <h1 className="text-sm font-bold">Stints Chart</h1>
        {selectedDrivers.length === 0 && (
          <span className="hidden sm:block text-sm text-gray-500">
            Select a driver to view stint data
          </span>
        )}
      </div>
      <Separator />
      <div className="flex-1 min-h-0 mt-2">
        <Bar
          data={chartData}
          options={options}
          className="h-full overflow-y-auto rounded-lg shadow-md px-2 border border-border dark:border-primary-border bg-gray-50 dark:bg-background"
        />
      </div>
    </div>
  );
};

export default StintsChart;
