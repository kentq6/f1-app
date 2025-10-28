import { Session } from "@/types/session";
import axios from "axios";
import { useEffect, useState } from "react";

type Weather = {
  air_temperature: number;
  date: string;
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

const WeatherInfo = ({ filteredSession }: WeatherInfoProp) => {
  const [weatherData, setWeatherData] = useState<Weather[]>([]);

  // Safely load weather data only if filteredSession is not null
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

        setWeatherData(response.data);
      } catch (error) {
        console.error("Error fetching weather data: ", error);
      }
    };

    fetchedWeather();
  }, [filteredSession]);

  return (
    <div className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-4">
      <h1 className="text-lg font-bold">Weather</h1>
      <div className="flex justify-between items-center mb-4">

        {/* <div>
        {weatherData.length > 0
          ? `Average Track Temperature: ${(
              weatherData.reduce((sum, data) => sum + data.track_temperature, 0) /
              weatherData.length
            ).toFixed(1)}°C`
          : "No weather data available."}
      </div> */}
      </div>
    </div>
  );
};

export default WeatherInfo;
