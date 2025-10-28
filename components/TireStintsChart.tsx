"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
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
import { Driver } from "@/types/driver";
import { Session } from "@/types/session";

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

interface MergedData extends Stint {
  name_acronym?: string;
}

interface TireStintChartProp {
  filteredSession: Session | null;
  driversData: Driver[];
}

// F1 compound colors
const compoundColors: Record<string, string> = {
  SOFT: "#DA291C",
  MEDIUM: "#FFD700",
  HARD: "#FFFFFF",
  INTERMEDIATE: "#43B02A",
  WET: "#0067AD",
};

const TireStintsChart = ({
  filteredSession,
  driversData,
}: TireStintChartProp) => {
  // const [stints, setStints] = useState<Stint[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<number[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasManuallyCleared, setHasManuallyCleared] = useState(false);
  const { theme } = useTheme();

  const [mergedData, setMergedData] = useState<MergedData[]>([]);

  // Safely load stint data only if filteredSession is not null
  useEffect(() => {
    if (!filteredSession) {
      setMergedData([]);
      return;
    }

    const fetchedStints = async () => {
      try {
        const response = await axios.get(
          `https://api.openf1.org/v1/stints?session_key=${filteredSession.session_key}`
        );

        const stints = response.data;

        // Create a quick lookup map from driversData (props)
        const driversMap = new Map<number, Driver>(
          driversData.map((d) => [d.driver_number, d])
        );

        // Merge driver info into stints
        const combined: MergedData[] = stints.map((stint: Stint) => {
          const driver = driversMap.get(stint.driver_number);
          return {
            ...stint,
            name_acronym: driver?.name_acronym ?? "UNK",
          };
        });

        setMergedData(combined);
      } catch (error) {
        console.error("Error fetching tire stints data: ", error);
      }
    };

    fetchedStints();
  }, [filteredSession, driversData]);

  // Extract unique driver numbers
  const drivers = useMemo(
    () =>
      Array.from(new Set(mergedData.map((s) => s.driver_number))).sort(
        (a, b) => a - b
      ),
    [mergedData]
  );

  const driverAcronymMap = useMemo(
    () =>
      Object.fromEntries(
        driversData.map((d) => [d.driver_number, d.name_acronym])
      ),
    [driversData]
  );

  // Initialize with all 20 drivers when data loads
  useEffect(() => {
    if (
      drivers.length > 0 &&
      selectedDrivers.length === 0 &&
      !hasManuallyCleared
    ) {
      setSelectedDrivers(drivers.slice(0, 20));
    }
  }, [drivers, selectedDrivers.length, hasManuallyCleared]);

  // Group stints by driver, sort stints by lap_start within each driver
  const driverStintsMap = useMemo(() => {
    const map = new Map<number, Stint[]>();
    for (const stint of mergedData) {
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
  }, [mergedData]);

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
    const isDark = theme === "dark";

    selectedDrivers.forEach((driverNumber) => {
      const driverLabel = driverAcronymMap[driverNumber] || `Driver ${driverNumber}`;
      const arr = driverStintsMap.get(driverNumber) || [];
      arr.forEach((stint) => {
        // For openF1, lap_start/lap_end are inclusive stints
        // Chart.js expects [start, end] as the bar value.
        // If start==end: show as single lap bar
        dataArray.push({
          x: [stint.lap_start, stint.lap_end],
          y: driverLabel,
          compound: stint.compound,
          stint,
        });
        bgColors.push(compoundColors[stint.compound] || "#999");
        borderColors.push(isDark ? "#1f2937" : "#000"); // gray-800 for dark mode, black for light mode
      });
    });

    return {
      datasets: [
        {
          label: "Stints",
          data: dataArray,
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 1,
          borderSkipped: false,
          barThickness: 12,
          categoryPercentage: 0.8,
          barPercentage: 0.96,
          parsing: {
            xAxisKey: "x",
            yAxisKey: "y",
          },
        },
      ],
    };
  }, [selectedDrivers, driverStintsMap, driverAcronymMap, theme]);

  // Get min and max lap numbers for scaling
  const [lapMin, lapMax] = useMemo(() => {
    let min: number = Infinity;
    let max: number = -Infinity;
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
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
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
            return `${d.y} - ${d.compound} Laps ${start} - ${end}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "linear" as const,
        title: { display: true, text: "Lap Number" },
        beginAtZero: true,
        grid: {
          display: true,
        },
        min: lapMin,
        max: lapMax,
        ticks: {
          stepSize: 1,
          precision: 0,
        },
      },
      y: {
        type: "category" as const,
        labels: selectedDrivers.map((driverNumber) => driverAcronymMap[driverNumber] || `Driver ${driverNumber}`),
        title: { display: true, text: "Driver Number" },
        grid: {
          display: true,
        },
      },
    },
    elements: {
      bar: {
        borderWidth: 1,
      },
    },
  };

  // Driver selection handlers
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

  // Chart height calculations: always one row per driver
  const minChartHeight = 420;
  const rowHeight = 32;
  const chartHeight =
    selectedDrivers.length <= 5
      ? minChartHeight
      : Math.max(minChartHeight, selectedDrivers.length * rowHeight);

  if (!filteredSession) {
    // Show a message if required session data not provided
    return (
      <div
        className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-4 flex items-center justify-center"
        style={{ minHeight: 300 }}
      >
        <p>Please select a session to view tire stint data.</p>
      </div>
    );
  }

  return (
    <div
      className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-4"
    >
      <h1 className="text-lg font-bold">Tire Stints</h1>
      <div className="flex justify-between items-center mb-4">
        <h3>{`${filteredSession.year} ${filteredSession.circuit_short_name} ${filteredSession.session_name}`}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {selectedDrivers.length} driver
            {selectedDrivers.length !== 1 ? "s" : ""} selected
          </span>

          {/* Driver Selection Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              type="button"
            >
              Select Drivers
              <span
                className={`transform transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-gray-800 border rounded-md shadow-lg z-10 max-h-80 overflow-y-auto">
                <div className="p-2 border-b flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    type="button"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                    type="button"
                  >
                    Clear All
                  </button>
                </div>
                <div className="p-1">
                  {drivers.map((driverNumber) => (
                    <label
                      key={driverNumber}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDrivers.includes(driverNumber)}
                        onChange={() => handleDriverToggle(driverNumber)}
                        className="rounded"
                      />
                      <span className="text-sm">Driver #{driverNumber}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ height: `${chartHeight}px` }}>
        {selectedDrivers.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Please select at least one driver to view stint data</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TireStintsChart;
