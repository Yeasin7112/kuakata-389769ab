import { useState, useEffect } from 'react';

// Kuakata, Bangladesh coordinates
const KUAKATA_LAT = 21.8167;
const KUAKATA_LON = 90.1167;

const OPEN_METEO_URL = `https://api.open-meteo.com/v1/forecast?latitude=${KUAKATA_LAT}&longitude=${KUAKATA_LON}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=sunrise,sunset&timezone=Asia/Dhaka&forecast_days=1`;

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  sunrise: string; // HH:MM format
  sunset: string;  // HH:MM format
}

const weatherCodeToCondition = (code: number, lang: 'bn' | 'en'): string => {
  const conditions: Record<number, { bn: string; en: string }> = {
    0: { bn: 'পরিষ্কার আকাশ', en: 'Clear Sky' },
    1: { bn: 'প্রায় পরিষ্কার', en: 'Mainly Clear' },
    2: { bn: 'আংশিক মেঘলা', en: 'Partly Cloudy' },
    3: { bn: 'মেঘলা', en: 'Overcast' },
    45: { bn: 'কুয়াশা', en: 'Fog' },
    48: { bn: 'ঘন কুয়াশা', en: 'Dense Fog' },
    51: { bn: 'হালকা গুঁড়ি বৃষ্টি', en: 'Light Drizzle' },
    53: { bn: 'গুঁড়ি বৃষ্টি', en: 'Moderate Drizzle' },
    55: { bn: 'ঘন গুঁড়ি বৃষ্টি', en: 'Dense Drizzle' },
    61: { bn: 'হালকা বৃষ্টি', en: 'Light Rain' },
    63: { bn: 'মাঝারি বৃষ্টি', en: 'Moderate Rain' },
    65: { bn: 'ভারী বৃষ্টি', en: 'Heavy Rain' },
    80: { bn: 'হালকা বৃষ্টি', en: 'Light Showers' },
    81: { bn: 'মাঝারি বৃষ্টি', en: 'Moderate Showers' },
    82: { bn: 'ভারী বৃষ্টি', en: 'Heavy Showers' },
    95: { bn: 'বজ্রপাতসহ ঝড়', en: 'Thunderstorm' },
    96: { bn: 'শিলাবৃষ্টিসহ ঝড়', en: 'Thunderstorm with Hail' },
    99: { bn: 'তীব্র শিলাবৃষ্টি', en: 'Severe Thunderstorm' },
  };
  const match = conditions[code];
  if (match) return match[lang];
  // Fallback for unknown codes
  return lang === 'bn' ? 'অজানা' : 'Unknown';
};

const weatherCodeToIcon = (code: number): string => {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 65) return '🌧️';
  if (code <= 82) return '🌧️';
  if (code >= 95) return '⛈️';
  return '🌤️';
};

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(OPEN_METEO_URL);
        if (!response.ok) throw new Error('Failed to fetch weather data');
        
        const data = await response.json();
        
        // Extract time (HH:MM) from ISO datetime strings
        const sunriseTime = data.daily.sunrise[0].split('T')[1].substring(0, 5);
        const sunsetTime = data.daily.sunset[0].split('T')[1].substring(0, 5);

        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          humidity: Math.round(data.current.relative_humidity_2m),
          windSpeed: Math.round(data.current.wind_speed_10m),
          weatherCode: data.current.weather_code,
          sunrise: sunriseTime,
          sunset: sunsetTime,
        });
      } catch (err: any) {
        console.error('Weather fetch error:', err);
        setError(err.message);
        // Fallback values
        setWeather({
          temperature: 28,
          humidity: 75,
          windSpeed: 15,
          weatherCode: 2,
          sunrise: '06:12',
          sunset: '17:48',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { weather, loading, error, weatherCodeToCondition, weatherCodeToIcon };
};
