import { Session } from "@/types/session";
import axios from "axios";
import {
  CloudDrizzle,
  CloudRain,
  CloudSun,
  Snowflake,
  Sun,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Separator } from "./ui/separator";

// Type for weather API result
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
  // 360/16 = 22.5
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
    return <CloudDrizzle size={50} strokeWidth={2.5} />; // Drizzle
  } else if (rainValue >= 2.5) {
    return <CloudRain size={50} strokeWidth={2.5} />; // Rain
  } else {
    // No Rain
    if (temp >= 31) {
      return <Sun size={50} strokeWidth={2.5} />; // Hot
    } else if (temp >= 10 && temp < 31) {
      return <CloudSun size={50} strokeWidth={2.5} />; // Warm
    } else {
      return <Snowflake size={50} strokeWidth={2.5} />; // Cold
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
      } catch (error) {
        console.error("Error fetching weather data: ", error);
      }
    };
    fetchedWeather();
  }, [filteredSession]);

  // Compute daily averages OUTSIDE return so it can be reused in return JSX
  const dailyAverages = useMemo(
    () => computeAveragesByDay(weatherData),
    [weatherData]
  );

  // You might want to show the first day's icon as a representative for the session if available
  const firstDay = dailyAverages.length > 0 ? dailyAverages[0] : null;

  return (
    <div className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-4">
      <h1 className="text-lg font-bold text-left w-full pb-2">
        Weather
      </h1>
      <Separator className="mb-4" />
      <div className="w-full flex justify-center mt-1">
        <div className="flex flex-col items-center justify-center">
          <div className="rounded-full bg-gray-50 dark:bg-gray-900/60 p-3 shadow border border-gray-200/60 dark:border-gray-700/60">
            {firstDay
              ? getWeatherIcon(firstDay.air_temperature, firstDay.rainfall)
              : null}
          </div>
          <div className="mt-2 text-sm font-medium">
            {typeof firstDay?.track_temperature === "number" ? (
              <>
                <span className="tracking-tight font-semibold">
                  {firstDay.track_temperature.toFixed(1)}
                </span>
                <span className="opacity-80"> °C</span>
                <span className="mx-1 opacity-60">/</span>
                <span className="tracking-tight font-semibold">
                  {toFahrenheit(firstDay.track_temperature).toFixed(1)}
                </span>
                <span className="opacity-80"> °F</span>
              </>
            ) : (
              <span className="text-gray-400">N/A</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 mb-2 mt-4">
        {dailyAverages.length === 0 ? (
          <span className="text-gray-500 text-sm px-2 py-3">No weather data available.</span>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100/60 dark:border-gray-700/60 bg-gray-50/70 dark:bg-gray-900/40">
            <table className="w-full text-xs md:text-sm mt-0 text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/60">
                  <th className="px-3 py-2 font-bold text-gray-800 dark:text-gray-200 sticky left-0 bg-inherit border-b border-gray-100/70 dark:border-gray-700/70">Date</th>
                  {/* <th className="px-2 py-1">Air Temp (°C / °F)</th> */}
                  <th className="px-3 py-2 font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100/70 dark:border-gray-700/70">
                    Track Temp<br className="hidden sm:block" />
                    <span className="font-normal text-xs">(°C / °F)</span>
                  </th>
                  <th className="px-3 py-2 font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100/70 dark:border-gray-700/70">
                    Humidity<br className="hidden sm:block" />
                    <span className="font-normal text-xs">(%)</span>
                  </th>
                  <th className="px-3 py-2 font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100/70 dark:border-gray-700/70">
                    Rainfall<br className="hidden sm:block" />
                    <span className="font-normal text-xs">(mm / hr)</span>
                  </th>
                  <th className="px-3 py-2 font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100/70 dark:border-gray-700/70">
                    Wind<br className="hidden sm:block" />
                    <span className="font-normal text-xs">(m/s)</span>
                  </th>
                  <th className="px-3 py-2 font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100/70 dark:border-gray-700/70">
                    Pressure<br className="hidden sm:block" />
                    <span className="font-normal text-xs">(hPa)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {dailyAverages.map((day) => (
                  <tr
                    key={day.date}
                    className="odd:bg-white even:bg-gray-50 odd:dark:bg-gray-800 even:dark:bg-gray-900/30 transition-colors"
                  >
                    <td className="px-3 py-1 whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">{day.date}</td>
                    <td className="px-3 py-1 whitespace-nowrap">
                      <span className="font-medium text-gray-800 dark:text-gray-300">{day.track_temperature.toFixed(1)}</span>
                      <span className="opacity-80"> °C</span>
                      <span className="mx-1 opacity-60">/</span>
                      <span className="font-medium text-gray-800 dark:text-gray-300">{toFahrenheit(day.track_temperature).toFixed(1)}</span>
                      <span className="opacity-80"> °F</span>
                    </td>
                    <td className="px-3 py-1">{day.humidity.toFixed(0)}</td>
                    <td className="px-3 py-1">{day.rainfall.toFixed(2)}</td>
                    <td className="px-3 py-1">
                      {day.wind_speed.toFixed(1)}
                      {isNaN(day.wind_direction)
                        ? ""
                        : (
                            <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">
                              ({getCardinalDirection(day.wind_direction)})
                            </span>
                          )}
                    </td>
                    <td className="px-3 py-1">{day.pressure.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherInfo;
