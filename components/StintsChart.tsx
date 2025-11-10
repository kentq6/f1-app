import { useEffect, useState, useMemo, useCallback } from "react";
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
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface DriverData extends Stint {
  name_acronym?: string;
}

interface StintChartProps {
  filteredSession: Session | null;
  driversData: Driver[];
}

const StintsChart = ({ filteredSession, driversData }: StintChartProps) => {
  const [tireStintsData, setTireStintsData] = useState<DriverData[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<number[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasManuallyCleared, setHasManuallyCleared] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Safely load stint data only if filteredSession is not null
  useEffect(() => {
    if (!filteredSession) {
      setTireStintsData([]);
      return;
    }

    const fetchedStints = async () => {
      try {
        const res = await axios.get(
          `https://api.openf1.org/v1/stints?session_key=${filteredSession.session_key}`
        );

        const stints = res.data;

        // Create a quick lookup map from driversData (props)
        const driversMap = new Map<number, Driver>(
          driversData.map((d) => [d.driver_number, d])
        );

        // Merge driver info into stints
        const mergedData: DriverData[] = stints.map((stint: Stint) => {
          const driver = driversMap.get(stint.driver_number);
          return {
            ...stint,
            name_acronym: driver?.name_acronym ?? "UNK",
          };
        });

        setTireStintsData(mergedData);
      } catch (err) {
        console.error("Error fetching tire stints data: ", err);
      }
    };

    fetchedStints();
  }, [filteredSession, driversData]);

  // Extract unique driver numbers
  const drivers = useMemo(
    () =>
      Array.from(new Set(tireStintsData.map((s) => s.driver_number))).sort(
        (a, b) => a - b
      ),
    [tireStintsData]
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
      // Pick 5 random, unique drivers from the drivers array
      if (drivers.length >= 5) {
        const shuffled = [...drivers].sort(() => 0.5 - Math.random());
        setSelectedDrivers(shuffled.slice(0, 5));
      } else {
        setSelectedDrivers(drivers);
      }
    }
  }, [drivers, selectedDrivers.length, hasManuallyCleared]);

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

    selectedDrivers.forEach((driverNumber) => {
      const driverLabel =
        `${driverAcronymMap[driverNumber]} ${driverNumber}` ||
        `Driver ${driverNumber}`;
      const arr = driverStintsMap.get(driverNumber) || [];
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
  }, [selectedDrivers, driverStintsMap, driverAcronymMap, getCompoundColor]);

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
          (driverNumber) =>
            `${driverAcronymMap[driverNumber]} ${driverNumber}` ||
            `Driver ${driverNumber}`
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
      <h1 className="text-sm font-bold pb-1">Stint Chart</h1>
      <Separator />
      {/* Table */}
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
                {drivers.map((driverNumber) => (
                  <div
                    key={driverNumber}
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
          <Bar
            data={chartData}
            options={options}
            className="h-full overflow-y-auto rounded-lg shadow-md px-2 border border-border dark:border-primary-border bg-gray-50 dark:bg-background"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Please select at least one driver to view stint data</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StintsChart;