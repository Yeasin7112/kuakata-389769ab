import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, Sun, Sunrise, Sunset, Cloud, Droplets, Wind, Thermometer } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { format } from 'date-fns';

interface SunTimes {
  sunrise: string;
  sunset: string;
}

const Weather: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [sunTimes, setSunTimes] = useState<SunTimes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data } = await supabase
      .from('sun_times')
      .select('sunrise, sunset')
      .eq('date', today)
      .maybeSingle();
    if (data) setSunTimes(data);
    setLoading(false);
  };

  // Mock weather data (can be replaced with real API)
  const weatherInfo = {
    temp: 28,
    humidity: 75,
    wind: 15,
    condition: language === 'bn' ? 'আংশিক মেঘলা' : 'Partly Cloudy',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 text-white p-4 safe-area-top">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-bangla">
            {language === 'bn' ? '☀️ আবহাওয়া' : '☀️ Weather'}
          </h1>
        </div>

        {/* Current Weather */}
        <div className="text-center py-8">
          <Cloud className="w-20 h-20 mx-auto mb-4 animate-pulse-soft" />
          <p className="text-6xl font-bold mb-2">{weatherInfo.temp}°C</p>
          <p className="text-xl font-bangla">{weatherInfo.condition}</p>
          <p className="text-sm opacity-80 font-bangla">
            {language === 'bn' ? 'কুয়াকাটা, বাংলাদেশ' : 'Kuakata, Bangladesh'}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4 -mt-6">
        {/* Weather Stats */}
        <div className="card-elevated p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Thermometer className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-lg font-bold">{weatherInfo.temp}°C</p>
              <p className="text-xs text-muted-foreground font-bangla">
                {language === 'bn' ? 'তাপমাত্রা' : 'Temperature'}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-cyan-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Droplets className="w-6 h-6 text-cyan-600" />
              </div>
              <p className="text-lg font-bold">{weatherInfo.humidity}%</p>
              <p className="text-xs text-muted-foreground font-bangla">
                {language === 'bn' ? 'আর্দ্রতা' : 'Humidity'}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Wind className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-lg font-bold">{weatherInfo.wind}</p>
              <p className="text-xs text-muted-foreground font-bangla">
                {language === 'bn' ? 'কিমি/ঘন্টা' : 'km/h'}
              </p>
            </div>
          </div>
        </div>

        {/* Sun Times */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-orange text-white rounded-2xl p-4 text-center">
            <Sunrise className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm opacity-90 font-bangla">
              {language === 'bn' ? 'সূর্যোদয়' : 'Sunrise'}
            </p>
            <p className="text-2xl font-bold">{sunTimes?.sunrise || '06:00'}</p>
          </div>
          <div className="bg-gradient-purple text-white rounded-2xl p-4 text-center">
            <Sunset className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm opacity-90 font-bangla">
              {language === 'bn' ? 'সূর্যাস্ত' : 'Sunset'}
            </p>
            <p className="text-2xl font-bold">{sunTimes?.sunset || '18:00'}</p>
          </div>
        </div>

        {/* Weather Tips */}
        <div className="card-elevated p-4">
          <h3 className="font-bold font-bangla mb-3">
            💡 {language === 'bn' ? 'আজকের টিপস' : "Today's Tips"}
          </h3>
          <div className="space-y-2 text-sm font-bangla">
            <p>☔ {language === 'bn' ? 'ছাতা নেওয়া ভালো হবে' : 'Better to carry an umbrella'}</p>
            <p>🧴 {language === 'bn' ? 'সানস্ক্রিন ব্যবহার করুন' : 'Use sunscreen'}</p>
            <p>💧 {language === 'bn' ? 'প্রচুর পানি পান করুন' : 'Stay hydrated'}</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Weather;
