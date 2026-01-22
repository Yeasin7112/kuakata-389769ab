import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sunrise, Sunset, Wifi, WifiOff } from 'lucide-react';
import heroBanner from '@/assets/hero-banner.jpg';

const Banner: React.FC = () => {
  const { t, language } = useLanguage();
  const isOnline = navigator.onLine;

  // Mock data - would come from API/database
  const sunriseTime = '05:42';
  const sunsetTime = '18:23';

  return (
    <div className="px-4 py-4">
      {/* Welcome Banner */}
      <div className="card-elevated overflow-hidden mb-4">
        <div className="relative h-44">
          <img 
            src={heroBanner} 
            alt="Kuakata Beach Sunset"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <div className="flex justify-end">
              {/* Online/Offline badge */}
              {isOnline ? (
                <span className="badge-online flex items-center gap-1.5">
                  <Wifi className="w-3 h-3" />
                  {t('online')}
                </span>
              ) : (
                <span className="badge-offline flex items-center gap-1.5">
                  <WifiOff className="w-3 h-3" />
                  {t('offline')}
                </span>
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white font-bangla drop-shadow-lg">
                {t('welcomeMessage')}
              </h2>
              <p className="text-white/90 text-sm mt-1 drop-shadow">
                {language === 'bn' 
                  ? 'সাগর দর্শনের এক অনন্য স্থান' 
                  : 'A unique place to see the sea'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sunrise/Sunset Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-elevated p-3 flex items-center gap-3">
          <div className="icon-container bg-gradient-to-br from-amber-400 to-orange-500">
            <Sunrise className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bangla">{t('sunrise')}</p>
            <p className="text-lg font-bold text-foreground">{sunriseTime}</p>
          </div>
        </div>
        
        <div className="card-elevated p-3 flex items-center gap-3">
          <div className="icon-container bg-gradient-sunset">
            <Sunset className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bangla">{t('sunset')}</p>
            <p className="text-lg font-bold text-foreground">{sunsetTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
