import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Wifi, WifiOff, Sunrise, Sunset } from 'lucide-react';
import heroBanner from '@/assets/hero-banner.jpg';

interface SunTime {
  sunrise: string;
  sunset: string;
}

const Banner: React.FC = () => {
  const { language } = useLanguage();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sunTime, setSunTime] = useState<SunTime | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchSunTime = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('sun_times')
        .select('sunrise, sunset')
        .eq('date', today)
        .single();
      
      if (data) {
        setSunTime({
          sunrise: data.sunrise.substring(0, 5),
          sunset: data.sunset.substring(0, 5),
        });
      } else {
        setSunTime({ sunrise: '06:12', sunset: '05:48' });
      }
    };
    
    fetchSunTime();
  }, []);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${String(displayHour).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  return (
    <div className="px-4 pt-0">
      {/* Hero Banner */}
      <div className="relative -mx-4 -mt-0">
        <div className="relative h-52">
          <img 
            src={heroBanner} 
            alt="Kuakata Beach"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          
          {/* Online indicator */}
          <div className="absolute top-3 right-3">
            {isOnline ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-white text-xs">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {language === 'bn' ? 'অনলাইন' : 'Online'}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-white text-xs">
                <WifiOff className="w-3 h-3" />
                {language === 'bn' ? 'অফলাইন' : 'Offline'}
              </span>
            )}
          </div>
          
          {/* Welcome text */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white font-bangla drop-shadow-lg">
              {language === 'bn' ? 'কুয়াকাটায় স্বাগতম' : 'Welcome to Kuakata'}
            </h2>
            <p className="text-white/90 text-sm mt-1 font-bangla">
              {language === 'bn' 
                ? 'সাগরকন্যা কুয়াকাটার সব সেবা এখন হাতের মুঠোয়' 
                : 'All services of Kuakata now at your fingertips'}
            </p>
          </div>
        </div>
      </div>

      {/* Sunrise/Sunset Cards */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {/* Sunrise Card */}
        <div className="bg-gradient-orange rounded-2xl p-4 flex items-center gap-3 text-white">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Sunrise className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-white/80 font-bangla">
              {language === 'bn' ? 'সূর্যোদয়' : 'Sunrise'}
            </p>
            <p className="text-xl font-bold">{sunTime ? formatTime(sunTime.sunrise) : '--:--'}</p>
          </div>
        </div>
        
        {/* Sunset Card */}
        <div className="bg-gradient-purple rounded-2xl p-4 flex items-center gap-3 text-white">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Sunset className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-white/80 font-bangla">
              {language === 'bn' ? 'সূর্যাস্ত' : 'Sunset'}
            </p>
            <p className="text-xl font-bold">{sunTime ? formatTime(sunTime.sunset) : '--:--'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
