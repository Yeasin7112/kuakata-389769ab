import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { WifiOff, Sunrise, Sunset } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { supabase } from '@/integrations/supabase/client';
import heroBanner from '@/assets/hero-banner.jpg';

interface HeroBannerData {
  id: string;
  title_bn: string;
  title_en: string;
  subtitle_bn: string | null;
  subtitle_en: string | null;
  image_url: string | null;
}

const Banner: React.FC = () => {
  const { language } = useLanguage();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [heroData, setHeroData] = useState<HeroBannerData | null>(null);
  const { weather } = useWeather();

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
    const fetchHeroBanner = async () => {
      const { data } = await supabase
        .from('banners')
        .select('id, title_bn, title_en, subtitle_bn, subtitle_en, image_url')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(1)
        .maybeSingle();

      setHeroData(data ?? null);
    };

    fetchHeroBanner();
  }, []);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${String(displayHour).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const bannerTitle = language === 'bn'
    ? heroData?.title_bn || 'কুয়াকাটায় স্বাগতম'
    : heroData?.title_en || 'Welcome to Kuakata';

  const bannerSubtitle = language === 'bn'
    ? heroData?.subtitle_bn || 'সাগরকন্যা কুয়াকাটার সব সেবা এখন হাতের মুঠোয়'
    : heroData?.subtitle_en || 'All services of Kuakata now at your fingertips';

  const bannerImage = heroData?.image_url || heroBanner;

  return (
    <div className="px-4 pt-0">
      <div className="relative -mx-4 -mt-0">
        <div className="relative h-52 lg:h-72 xl:h-80">
          <img
            src={bannerImage}
            alt={bannerTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

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

          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white font-bangla drop-shadow-lg">
              {bannerTitle}
            </h2>
            <p className="text-white/90 text-sm mt-1 font-bangla">
              {bannerSubtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-gradient-orange rounded-2xl p-4 flex items-center gap-3 text-white">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Sunrise className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-white/80 font-bangla">
              {language === 'bn' ? 'সূর্যোদয়' : 'Sunrise'}
            </p>
            <p className="text-xl font-bold">{weather ? formatTime(weather.sunrise) : '--:--'}</p>
          </div>
        </div>

        <div className="bg-gradient-purple rounded-2xl p-4 flex items-center gap-3 text-white">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Sunset className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-white/80 font-bangla">
              {language === 'bn' ? 'সূর্যাস্ত' : 'Sunset'}
            </p>
            <p className="text-xl font-bold">{weather ? formatTime(weather.sunset) : '--:--'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
