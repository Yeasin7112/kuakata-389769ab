import { useState, useEffect } from 'react';

// Kuakata, Bangladesh coordinates
const KUAKATA_LAT = 21.8167;
const KUAKATA_LON = 90.1167;

// Method 1 = University of Islamic Sciences, Karachi (commonly used in Bangladesh/South Asia)
const ALADHAN_URL = `https://api.aladhan.com/v1/timings?latitude=${KUAKATA_LAT}&longitude=${KUAKATA_LON}&method=1`;

export interface PrayerTimesData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
}

export const usePrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const response = await fetch(ALADHAN_URL);
        if (!response.ok) throw new Error('Failed to fetch prayer times');

        const data = await response.json();
        const timings = data.data.timings;
        const dateInfo = data.data.date;

        // Extract only HH:MM from the time strings (they come as "HH:MM (TZ)")
        const cleanTime = (t: string) => t.replace(/\s*\(.*\)/, '');

        setPrayerTimes({
          fajr: cleanTime(timings.Fajr),
          sunrise: cleanTime(timings.Sunrise),
          dhuhr: cleanTime(timings.Dhuhr),
          asr: cleanTime(timings.Asr),
          maghrib: cleanTime(timings.Maghrib),
          isha: cleanTime(timings.Isha),
          date: dateInfo.gregorian.date, // DD-MM-YYYY format
        });
      } catch (err: any) {
        console.error('Prayer times fetch error:', err);
        setError(err.message);
        // Fallback values
        setPrayerTimes({
          fajr: '05:15',
          sunrise: '06:25',
          dhuhr: '12:05',
          asr: '15:45',
          maghrib: '17:50',
          isha: '19:10',
          date: new Date().toLocaleDateString('en-GB'),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();

    // Refresh every 6 hours
    const interval = setInterval(fetchPrayerTimes, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { prayerTimes, loading, error };
};
