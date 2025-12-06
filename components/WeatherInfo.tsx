"use client";

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
import { useFilteredSession } from "@/app/providers/FilteredSessionProvider";
import { useQuery } from "@tanstack/react-query";
import { Weather } from "@/types/weather";
import computeAveragesByDay from "@/lib/weatherUtils";

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

const WeatherInfo = () => {
  const { filteredSession } = useFilteredSession();
  const [weatherData, setWeatherData] = useState<Weather[]>([]);

  const { data: weather } = useQuery({
    queryKey: ["weather", filteredSession?.session_key],
    queryFn: async () => {
      const res = await fetch(
        `/api/weather?session_key=${filteredSession?.session_key}`
      );
      if (!res.ok) {
        const details = await res.json().catch(() => ({}));
        throw new Error(details?.error || "Failed to fetch weather data");
      }
      return res.json();
    },
  });

  useEffect(() => {
    if (!filteredSession) {
      setWeatherData([]);
      return;
    }

    setWeatherData(weather ?? []);
  }, [filteredSession, weather]);

  // Compute daily averages OUTSIDE return so it can be reused in return JSX
  const dailyAverages = useMemo(
    () => computeAveragesByDay(weatherData),
    [weatherData]
  );

  // Show the first day's icon as a representative for the session if available
  const firstDay = dailyAverages.length > 0 ? dailyAverages[0] : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 pb-1">
        <h1 className="text-sm font-bold">Weather</h1>
        <span className="hidden sm:block text-[11px] px-1 rounded border bg-gray-50 dark:bg-background font-semibold">
          Session Averages
        </span>
      </div>
      <Separator />
      
      {/* Icon & Air Temp */}
      <div className="flex flex-col items-center gap-2 my-3">
        {/* Icon */}
        <div className="rounded-full bg-gray-50 dark:bg-background p-3 shadow-md border flex items-center justify-center w-[72px] h-[72px]">
          {firstDay ? (
            getWeatherIcon(firstDay.air_temperature, firstDay.rainfall)
          ) : (
            <span className="text-lg">—</span>
          )}
        </div>

        {/* Air Temperature */}
        <div className="flex flex-col items-center justify-center text-xs font-medium min-h-[32px] text-center">
          {typeof firstDay?.air_temperature === "number" &&
          typeof firstDay?.track_temperature === "number" ? (
            <div className="flex flex-col items-center justify-center">
              <span className="mb-0.5">Air Temp:</span>
              <div className="flex items-center justify-center gap-1">
                <span className="font-semibold tracking-tight">
                  {firstDay.air_temperature.toFixed(1)}
                </span>
                <span className="opacity-80">°C</span>
                <span className="mx-1 opacity-40">/</span>
                <span className="font-semibold tracking-tight">
                  {toFahrenheit(firstDay.air_temperature).toFixed(1)}
                </span>
                <span className="opacity-80">°F</span>
              </div>
            </div>
          ) : (
            <span className="mt-4 text-center w-full">No weather data</span>
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
                  <TableRow className="odd:bg-white even:bg-neutral-100 odd:dark:bg-background even:dark:bg-neutral-800">
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
                  <TableRow className="odd:bg-white even:bg-neutral-100 odd:dark:bg-background even:dark:bg-neutral-800">
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
                  <TableRow className="odd:bg-white even:bg-neutral-100 odd:dark:bg-background even:dark:bg-neutral-800">
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
                  <TableRow className="odd:bg-white even:bg-neutral-100 odd:dark:bg-background even:dark:bg-neutral-800">
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
                  <TableRow className="odd:bg-white even:bg-neutral-100 odd:dark:bg-background even:dark:bg-neutral-800">
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
  );
};

export default WeatherInfo;
