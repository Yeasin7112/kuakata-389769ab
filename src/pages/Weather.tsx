import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeather } from '@/hooks/useWeather';
import { ArrowLeft, Loader2, Sunrise, Sunset, Cloud, Droplets, Wind, Thermometer, Sun, CloudRain, CloudLightning, CloudFog, CloudDrizzle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const WeatherIcon: React.FC<{ code: number }> = ({ code }) => {
  const className = "w-20 h-20 mx-auto mb-4";
  if (code === 0) return <Sun className={`${className} text-yellow-300`} />;
  if (code <= 3) return <Cloud className={`${className} text-white/90`} />;
  if (code <= 48) return <CloudFog className={`${className} text-white/80`} />;
  if (code <= 55) return <CloudDrizzle className={`${className} text-white/80`} />;
  if (code <= 65 || (code >= 80 && code <= 82)) return <CloudRain className={`${className} text-white/90`} />;
  if (code >= 95) return <CloudLightning className={`${className} text-yellow-200`} />;
  return <Cloud className={className} />;
};

const Weather: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { weather, loading, weatherCodeToCondition, weatherCodeToIcon } = useWeather();

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${String(displayHour).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const condition = weather
    ? weatherCodeToCondition(weather.weatherCode, language === 'bn' ? 'bn' : 'en')
    : (language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...');

  const conditionEmoji = weather ? weatherCodeToIcon(weather.weatherCode) : '🌤️';

  // Dynamic tips based on weather
  const getTips = () => {
    if (!weather) return [];
    const tips: string[] = [];
    
    if (weather.weatherCode >= 51) {
      tips.push(language === 'bn' ? '☔ ছাতা সাথে রাখুন' : '☔ Carry an umbrella');
    }
    if (weather.temperature > 30) {
      tips.push(language === 'bn' ? '🧴 সানস্ক্রিন ব্যবহার করুন' : '🧴 Use sunscreen');
      tips.push(language === 'bn' ? '💧 প্রচুর পানি পান করুন' : '💧 Stay hydrated');
    }
    if (weather.windSpeed > 20) {
      tips.push(language === 'bn' ? '💨 বাতাস বেশি, সাবধানে থাকুন' : '💨 High winds, stay cautious');
    }
    if (weather.weatherCode === 0 || weather.weatherCode <= 2) {
      tips.push(language === 'bn' ? '🏖️ সৈকতে যাওয়ার উপযুক্ত সময়' : '🏖️ Great time for the beach');
    }
    if (weather.humidity > 80) {
      tips.push(language === 'bn' ? '💦 আর্দ্রতা বেশি, হালকা পোশাক পরুন' : '💦 High humidity, wear light clothes');
    }
    if (tips.length === 0) {
      tips.push(language === 'bn' ? '🌤️ আবহাওয়া ভালো আছে' : '🌤️ Weather looks good');
      tips.push(language === 'bn' ? '🧴 সানস্ক্রিন ব্যবহার করুন' : '🧴 Use sunscreen');
    }
    return tips;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 text-white p-4 safe-area-top">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-bangla">
            {conditionEmoji} {language === 'bn' ? 'আবহাওয়া' : 'Weather'}
          </h1>
          <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">
            {language === 'bn' ? 'লাইভ' : 'Live'} 🔴
          </span>
        </div>

        {/* Current Weather */}
        <div className="text-center py-8">
          {weather && <WeatherIcon code={weather.weatherCode} />}
          <p className="text-6xl font-bold mb-2">{weather?.temperature ?? '--'}°C</p>
          <p className="text-xl font-bangla">{condition}</p>
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
              <p className="text-lg font-bold">{weather?.temperature ?? '--'}°C</p>
              <p className="text-xs text-muted-foreground font-bangla">
                {language === 'bn' ? 'তাপমাত্রা' : 'Temperature'}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-cyan-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Droplets className="w-6 h-6 text-cyan-600" />
              </div>
              <p className="text-lg font-bold">{weather?.humidity ?? '--'}%</p>
              <p className="text-xs text-muted-foreground font-bangla">
                {language === 'bn' ? 'আর্দ্রতা' : 'Humidity'}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Wind className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-lg font-bold">{weather?.windSpeed ?? '--'}</p>
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
            <p className="text-2xl font-bold">{weather ? formatTime(weather.sunrise) : '--:--'}</p>
          </div>
          <div className="bg-gradient-purple text-white rounded-2xl p-4 text-center">
            <Sunset className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm opacity-90 font-bangla">
              {language === 'bn' ? 'সূর্যাস্ত' : 'Sunset'}
            </p>
            <p className="text-2xl font-bold">{weather ? formatTime(weather.sunset) : '--:--'}</p>
          </div>
        </div>

        {/* Weather Tips - Dynamic */}
        <div className="card-elevated p-4">
          <h3 className="font-bold font-bangla mb-3">
            💡 {language === 'bn' ? 'আজকের টিপস' : "Today's Tips"}
          </h3>
          <div className="space-y-2 text-sm font-bangla">
            {getTips().map((tip, i) => (
              <p key={i}>{tip}</p>
            ))}
          </div>
        </div>

        {/* Data Source */}
        <p className="text-center text-xs text-muted-foreground">
          {language === 'bn' ? 'তথ্যসূত্র: Open-Meteo • প্রতি ৩০ মিনিটে আপডেট হয়' : 'Source: Open-Meteo • Updates every 30 minutes'}
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Weather;
