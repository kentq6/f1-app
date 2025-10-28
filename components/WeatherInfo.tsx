import { Session } from '@/types/session';
import axios from 'axios';
import { useEffect, useState } from 'react'

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
};

const WeatherInfo = ({
  filteredSession
}: WeatherInfoProp) => {
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
    <div>WeatherInfo</div>
  )
}

export default WeatherInfo