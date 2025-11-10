import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  // Legend,
  Title,
} from "chart.js";
import { Session } from "@/types/session";
import { Driver } from "@/types/driver";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  // Legend,
  Title
);

interface RacePaceChartProps {
  filteredSession: Session | null;
  driversData: Driver[];
}

interface LapTime {
  driver_number: number;
  lap_number: number;
  lap_duration: number; // seconds
}

const RacePaceChart = ({
  filteredSession,
  driversData,
}: RacePaceChartProps) => {
  const [lapData, setLapData] = useState<LapTime[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!filteredSession) {
      setLapData([]);
      return;
    }

    const fetchLapTimes = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://api.openf1.org/v1/laps?session_key=${filteredSession.session_key}`
        );

        // Filter valid laps
        const validLaps = res.data.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (lap: any) => lap.lap_duration && lap.lap_duration > 0
        );

        setLapData(validLaps);
      } catch (err) {
        console.error("Error fetching lap data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLapTimes();
  }, [filteredSession]);

  // === PROCESS DATA ===
  const driverMap = new Map<number, Driver>(
    driversData.map((d) => [d.driver_number, d])
  );

  // Group laps per driver
  const grouped = lapData.reduce<Record<number, LapTime[]>>((acc, lap) => {
    if (!acc[lap.driver_number]) acc[lap.driver_number] = [];
    acc[lap.driver_number].push(lap);
    return acc;
  }, {});

  // Compute average lap pace per lap number
  const lapNumbers = Array.from(
    new Set(lapData.map((lap) => lap.lap_number))
  ).sort((a, b) => a - b);

  const datasets = Object.entries(grouped)
    .map(([driverNumber, laps]) => {
      const driver = driverMap.get(Number(driverNumber));
      if (!driver) return null;

      const color = driver.team_colour?.startsWith("#")
        ? driver.team_colour
        : `#${driver.team_colour}`;

      // Sort laps
      const sortedLaps = laps.sort((a, b) => a.lap_number - b.lap_number);

      return {
        label: driver.name_acronym ?? `#${driver.driver_number}`,
        data: sortedLaps.map((lap) => lap.lap_duration),
        borderColor: color,
        backgroundColor: color,
        pointRadius: 0,
        tension: 0.3,
        borderWidth: 2,
      };
    })
    .filter(Boolean);

  const chartData = {
    labels: lapNumbers,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    datasets: datasets as any[],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Race Pace per Lap (s)",
        color: "#eaeaea",
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (ctx: any) => `${ctx.dataset.label}: ${ctx.formattedValue}s`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Lap Number" },
        ticks: { color: "#ccc" },
      },
      y: {
        title: { display: true, text: "Lap Duration (s)" },
        ticks: { color: "#ccc" },
      },
    },
  };

  return (
    <div className="h-full flex flex-col bg-primary-foreground p-4 rounded-lg border border-border dark:border-border">
      <h1 className="text-md font-bold pb-2">Race Pace Chart</h1>
      {loading ? (
        <div className="flex justify-center items-center h-full text-gray-400">
          Loading race pace data...
        </div>
      ) : (
        <div className="h-auto">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default RacePaceChart;
