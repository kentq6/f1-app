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
      <h1 className="text-lg font-bold text-left w-full">Weather</h1>
      <div className="w-full flex justify-center mt-1">
        <div className="flex flex-col items-center justify-center">
          {firstDay
            ? getWeatherIcon(firstDay.air_temperature, firstDay.rainfall)
            : null}
          <div className="mt-2">
            {typeof firstDay?.track_temperature === "number" ? (
              <>
                {firstDay.track_temperature.toFixed(1)}
                {" °C / "}
                {toFahrenheit(firstDay.track_temperature).toFixed(1)}
                {" °F"}
              </>
            ) : (
              <span>N/A</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 mb-2">
        {dailyAverages.length === 0 ? (
          <span>No weather data available.</span>
        ) : (
          <table className="w-full text-sm mt-2">
            <thead>
              <tr>
                <th className="text-left px-2 py-1">Date</th>
                {/* <th className="text-left px-2 py-1">Air Temp (°C / °F)</th> */}
                <th className="text-left px-2 py-1">Track Temp<br />(°C / °F)</th>
                <th className="text-left px-2 py-1">Humidity<br />(%)</th>
                <th className="text-left px-2 py-1">Rainfall<br />(mm / hr)</th>
                <th className="text-left px-2 py-1">Wind<br />(m/s)</th>
                <th className="text-left px-2 py-1">Pressure<br />(hPa)</th>
              </tr>
            </thead>
            <tbody>
              {dailyAverages.map((day) => (
                <tr key={day.date}>
                  <td className="px-2 py-1">{day.date}</td>
                  <td className="px-2 py-1">
                    {/* Track temp, Celsius + Fahrenheit */}
                    {day.track_temperature.toFixed(1)}
                    {" °C / "}
                    {toFahrenheit(day.track_temperature).toFixed(1)}
                    {" °F"}
                  </td>
                  <td className="px-2 py-1">{day.humidity.toFixed(0)}</td>
                  <td className="px-2 py-1">{day.rainfall.toFixed(2)}</td>
                  <td className="px-2 py-1">
                    {day.wind_speed.toFixed(1)}
                    {isNaN(day.wind_direction)
                      ? ""
                      : ` (${getCardinalDirection(day.wind_direction)})`}
                  </td>
                  <td className="px-2 py-1">{day.pressure.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default WeatherInfo;
