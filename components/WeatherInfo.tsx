import { Session } from "@/types/session";
import axios from "axios";
import {
  CloudDrizzle,
  CloudRain,
  Snowflake,
  Sun,
  ThermometerSun,
} from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { Separator } from "./ui/separator";
import { Table, TableBody, TableCell, TableHead, TableRow } from "./ui/table";

type Weather = {
  air_temperature: number;
  date: string; // ISO string
  humidity: number;
  meeting_key: number;
  pressure: number;
  rainfall: number;
  session_key: number;
  track_temperature: number;
  wind_direction: number;
  wind_speed: number;
};

interface WeatherInfoProp {
  filteredSession: Session | null;
}

// Helper: Get YYYY-MM-DD string from ISO date
const getDateString = (date: string) => {
  return date.slice(0, 10);
};

// Helper: Convert degrees to cardinal wind direction
const getCardinalDirection = (degrees: number) => {
  if (isNaN(degrees)) return "";
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
    "N",
  ];
  const ix = Math.round(degrees / 22.5);
  return directions[ix % 16];
};

// Celsius to Fahrenheit conversion
const toFahrenheit = (c: number) => (c * 9) / 5 + 32;

// Helper: Given an array of Wx, group by day, then get an average for each numeric property per day
function computeAveragesByDay(weatherData: Weather[]) {
  // Group by day
  const byDay: { [date: string]: Weather[] } = {};
  for (const entry of weatherData) {
    const day = getDateString(entry.date);
    byDay[day] ||= [];
    byDay[day].push(entry);
  }

  // For each day, compute averages
  const dailyAverages: {
    date: string;
    air_temperature: number;
    track_temperature: number;
    humidity: number;
    rainfall: number;
    wind_speed: number;
    wind_direction: number;
    pressure: number;
  }[] = [];

  for (const date in byDay) {
    const items = byDay[date];
    const n = items.length;
    // Compute means
    const avg = {
      date,
      air_temperature: items.reduce((a, b) => a + b.air_temperature, 0) / n,
      track_temperature: items.reduce((a, b) => a + b.track_temperature, 0) / n,
      humidity: items.reduce((a, b) => a + b.humidity, 0) / n,
      rainfall: items.reduce((a, b) => a + b.rainfall, 0) / n,
      wind_speed: items.reduce((a, b) => a + b.wind_speed, 0) / n,
      wind_direction: items.reduce((a, b) => a + b.wind_direction, 0) / n,
      pressure: items.reduce((a, b) => a + b.pressure, 0) / n,
    };
    dailyAverages.push(avg);
  }
  // Sort by date ascending
  dailyAverages.sort((a, b) => a.date.localeCompare(b.date));
  return dailyAverages;
}

const getWeatherIcon = (temp: number, rainValue: number) => {
  if (rainValue > 0 && rainValue < 2.5) {
    // Light Drizzle, blueish
    return <CloudDrizzle size={60} strokeWidth={2} color="#38bdf8" />;
  } else if (rainValue >= 2.5) {
    // Heavy Rain, deeper blue
    return <CloudRain size={60} strokeWidth={2} color="#0ea5e9" />;
  } else {
    // No Rain
    if (temp >= 31) {
      // Hot, orange-red
      return <ThermometerSun size={60} strokeWidth={2} color="#fb923c" />;
    } else if (temp <= 20) {
      // Cold, light blue
      return <Snowflake size={60} strokeWidth={2} color="#60a5fa" />;
    } else {
      // Warm/mild, yellow
      return <Sun size={60} strokeWidth={2} color="#facc15" />;
    }
  }
};

const WeatherInfo = ({ filteredSession }: WeatherInfoProp) => {
  const [weatherData, setWeatherData] = useState<Weather[]>([]);

  useEffect(() => {
    if (!filteredSession) {
      setWeatherData([]);
      return;
    }
    const fetchedWeather = async () => {
      try {
        const response = await axios.get(
          `https://api.openf1.org/v1/weather?session_key=${filteredSession.session_key}`
        );
        setWeatherData(response.data ?? []);
      } catch (err) {
        console.error("Error fetching weather data: ", err);
      }
    };
    fetchedWeather();
  }, [filteredSession]);

  // Compute daily averages OUTSIDE return so it can be reused in return JSX
  const dailyAverages = useMemo(
    () => computeAveragesByDay(weatherData),
    [weatherData]
  );

  // Show the first day's icon as a representative for the session if available
  const firstDay = dailyAverages.length > 0 ? dailyAverages[0] : null;

  if (WeatherInfo.length === 0) {
    return <div>No weather data available.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 pb-1">
        <h1 className="text-sm font-bold">Weather</h1>
        <span className="hidden sm:block text-[11px] px-1 rounded border bg-gray-50 dark:bg-background font-semibold">
          Session Averages
        </span>
      </div>
      <Separator />
      <div className="mt-2 flex flex-col items-center w-full gap-3 overflow-auto">
        {/* Icon & Air Temp */}
        <div className="flex flex-col items-center gap-2">
          {/* Icon */}
          <div className="rounded-full bg-gray-50 dark:bg-background p-3 shadow-md border flex items-center justify-center w-[72px] h-[72px]">
            {firstDay ? (
              getWeatherIcon(firstDay.air_temperature, firstDay.rainfall)
            ) : (
              <span className="text-lg">—</span>
            )}
          </div>

          {/* Air Temperature */}
          <div className="flex flex-col items-center text-xs font-medium min-h-[32px]">
            {typeof firstDay?.air_temperature === "number" &&
            typeof firstDay?.track_temperature === "number" ? (
              <span className="whitespace-nowrap">
                <span>
                  Air Temp: <br />
                </span>
                <span className="font-semibold tracking-tight">
                  {firstDay.air_temperature.toFixed(1)}
                </span>
                <span className="opacity-80">°C</span>
                <span className="mx-1 opacity-40">/</span>
                <span className="font-semibold tracking-tight">
                  {toFahrenheit(firstDay.air_temperature).toFixed(1)}
                </span>
                <span className="opacity-80">°F</span>
              </span>
            ) : (
              <span className="mt-4">No weather data</span>
            )}
          </div>
        </div>

        {/* Weather Averages Table */}
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Table Container */}
          <div className="flex flex-col rounded-md border overflow-auto">
            <Table className="text-xs">
              <TableBody>
                {/* Loop for each day or just single, depending on use-case */}
                {dailyAverages.map((day) => (
                  <React.Fragment key={day.date}>
                    {/* Track Temperature */}
                    <TableRow className="odd:bg-white even:bg-gray-100 odd:dark:bg-background even:dark:bg-gray-900/50">
                      <TableHead className="px-2 py-1 font-bold whitespace-nowrap">
                        Track Temp
                      </TableHead>
                      <TableCell className="px-2 py-1 whitespace-nowrap">
                        <span className="font-medium">
                          {day.track_temperature.toFixed(1)}
                        </span>
                        <span className="opacity-80"> °C</span>
                        <span className="mx-1 opacity-60">/</span>
                        <span className="font-medium">
                          {toFahrenheit(day.track_temperature).toFixed(1)}
                        </span>
                        <span className="opacity-80"> °F</span>
                      </TableCell>
                    </TableRow>
                    {/* Humidity */}
                    <TableRow className="odd:bg-white even:bg-gray-100 odd:dark:bg-background even:dark:bg-gray-900/50">
                      <TableHead className="px-2 py-1 font-bold whitespace-nowrap">
                        Humidity
                      </TableHead>
                      <TableCell className="px-2 py-1 whitespace-nowrap">
                        <span className="font-medium">
                          {day.humidity.toFixed(0)}
                        </span>
                        <span className="opacity-80">%</span>
                      </TableCell>
                    </TableRow>
                    {/* Rainfall Percentage */}
                    <TableRow className="odd:bg-white even:bg-gray-100 odd:dark:bg-background even:dark:bg-gray-900/50">
                      <TableHead className="px-2 py-1 font-bold whitespace-nowrap">
                        Rainfall
                      </TableHead>
                      <TableCell className="px-2 py-1 whitespace-nowrap">
                        <span className="font-medium">
                          {day.rainfall.toFixed(2)}
                        </span>
                        <span className="opacity-80"> mm / hr</span>
                      </TableCell>
                    </TableRow>
                    {/* Wind Speed */}
                    <TableRow className="odd:bg-white even:bg-gray-100 odd:dark:bg-background even:dark:bg-gray-900/50">
                      <TableHead className="px-2 py-1 font-bold whitespace-nowrap">
                        Wind
                      </TableHead>
                      <TableCell className="px-2 py-1 whitespace-nowrap">
                        <span className="font-medium">
                          {day.wind_speed.toFixed(1)}
                        </span>
                        <span className="opacity-80"> m/s</span>
                        {isNaN(day.wind_direction) ? (
                          ""
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">
                            ({getCardinalDirection(day.wind_direction)})
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                    {/* Air Pressure */}
                    <TableRow className="odd:bg-white even:bg-gray-100 odd:dark:bg-background even:dark:bg-gray-900/50">
                      <TableHead className="px-2 py-1 font-bold whitespace-nowrap">
                        Pressure
                      </TableHead>
                      <TableCell className="px-2 py-1 whitespace-nowrap">
                        <span className="font-medium">
                          {day.pressure.toFixed(0)}
                        </span>
                        <span className="opacity-80"> hPa</span>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherInfo;
