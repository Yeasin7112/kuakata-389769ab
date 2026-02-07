import { useState, useEffect } from 'react';

// Kuakata, Bangladesh coordinates
const KUAKATA_LAT = 21.8167;
const KUAKATA_LON = 90.1167;

const MARINE_URL = `https://marine-api.open-meteo.com/v1/marine?latitude=${KUAKATA_LAT}&longitude=${KUAKATA_LON}&hourly=sea_level_height_msl&timezone=Asia/Dhaka&forecast_days=1`;

export interface TidePeakData {
  highTideTime: string;
  highTideLevel: string;
  lowTideTime: string;
  lowTideLevel: string;
  hourlyData: { time: string; level: number }[];
}

const findPeaks = (times: string[], levels: number[]): TidePeakData => {
  let maxLevel = -Infinity;
  let minLevel = Infinity;
  let highIdx = 0;
  let lowIdx = 0;
  const hourlyData: { time: string; level: number }[] = [];

  for (let i = 0; i < levels.length; i++) {
    const time = times[i].split('T')[1]?.substring(0, 5) || '--:--';
    hourlyData.push({ time, level: levels[i] });

    if (levels[i] > maxLevel) {
      maxLevel = levels[i];
      highIdx = i;
    }
    if (levels[i] < minLevel) {
      minLevel = levels[i];
      lowIdx = i;
    }
  }

  const formatTime = (iso: string) => iso.split('T')[1]?.substring(0, 5) || '--:--';

  return {
    highTideTime: formatTime(times[highIdx]),
    highTideLevel: `${maxLevel.toFixed(2)}m`,
    lowTideTime: formatTime(times[lowIdx]),
    lowTideLevel: `${minLevel.toFixed(2)}m`,
    hourlyData,
  };
};

export const useTideData = () => {
  const [tideData, setTideData] = useState<TidePeakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTideData = async () => {
      try {
        const response = await fetch(MARINE_URL);
        if (!response.ok) throw new Error('Failed to fetch tide data');

        const data = await response.json();
        const times: string[] = data.hourly.time;
        const levels: number[] = data.hourly.sea_level_height_msl;

        if (times.length > 0 && levels.length > 0) {
          setTideData(findPeaks(times, levels));
        }
      } catch (err: any) {
        console.error('Tide data fetch error:', err);
        setError(err.message);
        // Fallback
        setTideData({
          highTideTime: '06:00',
          highTideLevel: '1.2m',
          lowTideTime: '12:00',
          lowTideLevel: '0.3m',
          hourlyData: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTideData();

    // Refresh every hour
    const interval = setInterval(fetchTideData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { tideData, loading, error };
};
