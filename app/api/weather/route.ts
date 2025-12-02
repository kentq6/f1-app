import { Weather } from "@/types/weather";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Forward all search parameters to the weather API
    const { searchParams } = new URL(request.url);

    // Construct the query string to append to the upstream API
    const queryString = searchParams.toString();
    let apiUrl = "https://api.openf1.org/v1/weather";
    if (queryString) {
      apiUrl += `?${queryString}`;
    }

    const res = await fetch(apiUrl, {
      next: { revalidate: 60 }, // cache 60s
    });

    if (!res.ok) throw new Error("Failed to fetch weather data");

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Weather fetch failed", details: String(err) },
      { status: 500 }
    );
  }
}

// Helper: Get YYYY-MM-DD string from ISO date
const getDateString = (date: string) => {
  return date.slice(0, 10);
};

// Helper: Given an array of Wx, group by day, then get an average for each numeric property per day **(MOVE TO BACKEND)
export default function computeAveragesByDay(weatherData: Weather[]) {
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
