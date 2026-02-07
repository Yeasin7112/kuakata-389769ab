import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, MapPin } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const prayerNames = {
  fajr: { bn: 'ফজর', en: 'Fajr', emoji: '🌙' },
  sunrise: { bn: 'সূর্যোদয়', en: 'Sunrise', emoji: '🌅' },
  dhuhr: { bn: 'যোহর', en: 'Dhuhr', emoji: '☀️' },
  asr: { bn: 'আসর', en: 'Asr', emoji: '🌤️' },
  maghrib: { bn: 'মাগরিব', en: 'Maghrib', emoji: '🌇' },
  isha: { bn: 'ইশা', en: 'Isha', emoji: '🌑' },
};

const mosquePrayerKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

interface MosquePrayerTime {
  id: string;
  name_bn: string;
  name_en: string;
  address_bn: string | null;
  address_en: string | null;
  latitude: number | null;
  longitude: number | null;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${String(displayHour).padStart(2, '0')}:${minutes} ${ampm}`;
};

const getNextPrayer = (prayerTimes: Record<string, string>): string | null => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const prayerOrder = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  for (const prayer of prayerOrder) {
    const time = prayerTimes[prayer];
    if (!time) continue;
    const [h, m] = time.split(':').map(Number);
    if (h * 60 + m > currentMinutes) return prayer;
  }
  return 'fajr';
};

const PrayerTimes: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { prayerTimes, loading } = usePrayerTimes();
  const [mosques, setMosques] = useState<MosquePrayerTime[]>([]);
  const [mosquesLoading, setMosquesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'mosque'>('general');

  useEffect(() => {
    const fetchMosques = async () => {
      const { data } = await supabase
        .from('mosque_prayer_times')
        .select('*')
        .eq('is_active', true)
        .order('name_en');
      setMosques((data as MosquePrayerTime[]) || []);
      setMosquesLoading(false);
    };
    fetchMosques();
  }, []);

  const nextPrayer = prayerTimes
    ? getNextPrayer({
        fajr: prayerTimes.fajr,
        sunrise: prayerTimes.sunrise,
        dhuhr: prayerTimes.dhuhr,
        asr: prayerTimes.asr,
        maghrib: prayerTimes.maghrib,
        isha: prayerTimes.isha,
      })
    : null;

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
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-4 safe-area-top">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-bangla">
            🕌 {language === 'bn' ? 'নামাজের সময়সূচী' : 'Prayer Times'}
          </h1>
          <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">
            {language === 'bn' ? 'লাইভ' : 'Live'} 🔴
          </span>
        </div>

        {/* Next prayer highlight */}
        {nextPrayer && prayerTimes && (
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 text-center">
            <p className="text-sm opacity-80 font-bangla mb-1">
              {language === 'bn' ? 'পরবর্তী নামাজ' : 'Next Prayer'}
            </p>
            <p className="text-3xl font-bold mb-1">
              {prayerNames[nextPrayer as keyof typeof prayerNames]?.emoji}{' '}
              {language === 'bn'
                ? prayerNames[nextPrayer as keyof typeof prayerNames]?.bn
                : prayerNames[nextPrayer as keyof typeof prayerNames]?.en}
            </p>
            <p className="text-2xl font-bold">
              {formatTime(prayerTimes[nextPrayer as keyof typeof prayerTimes] || '')}
            </p>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="px-4 -mt-3">
        <div className="card-elevated rounded-2xl p-1 flex gap-1">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold font-bangla transition-colors ${
              activeTab === 'general'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {language === 'bn' ? '⏰ সাধারণ সময়' : '⏰ General Times'}
          </button>
          <button
            onClick={() => setActiveTab('mosque')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold font-bangla transition-colors ${
              activeTab === 'mosque'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {language === 'bn' ? '🕌 মসজিদ ভিত্তিক' : '🕌 Mosque Wise'}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {activeTab === 'general' ? (
          <>
            {/* General Prayer Times List */}
            <div className="card-elevated rounded-2xl overflow-hidden">
              {prayerTimes &&
                (Object.keys(prayerNames) as Array<keyof typeof prayerNames>).map((key) => {
                  const isNext = nextPrayer === key;
                  const time = prayerTimes[key];
                  const prayerInfo = prayerNames[key];

                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between p-4 border-b last:border-b-0 ${
                        isNext ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{prayerInfo.emoji}</span>
                        <div>
                          <p className={`font-semibold font-bangla ${isNext ? 'text-primary' : ''}`}>
                            {language === 'bn' ? prayerInfo.bn : prayerInfo.en}
                          </p>
                          {isNext && (
                            <span className="text-xs text-primary font-bangla">
                              {language === 'bn' ? '← পরবর্তী' : '← Next'}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className={`text-lg font-bold ${isNext ? 'text-primary' : ''}`}>
                        {formatTime(time)}
                      </p>
                    </div>
                  );
                })}
            </div>

            {/* Location Info */}
            <div className="card-elevated p-4 text-center">
              <p className="text-sm font-bangla text-muted-foreground">
                📍 {language === 'bn' ? 'কুয়াকাটা, বাংলাদেশ' : 'Kuakata, Bangladesh'}
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Mosque-wise Prayer Times */}
            {mosquesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : mosques.length > 0 ? (
              <div className="space-y-4">
                {mosques.map((mosque) => (
                  <div key={mosque.id} className="card-elevated rounded-2xl overflow-hidden">
                    <div className="bg-primary/5 p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold font-bangla text-lg">
                            🕌 {language === 'bn' ? mosque.name_bn : mosque.name_en}
                          </h3>
                          {(mosque.address_bn || mosque.address_en) && (
                            <p className="text-sm text-muted-foreground font-bangla mt-0.5">
                              📍 {language === 'bn' ? mosque.address_bn : mosque.address_en}
                            </p>
                          )}
                        </div>
                        {mosque.latitude && mosque.longitude && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${mosque.latitude},${mosque.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                          >
                            <MapPin className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div>
                      {mosquePrayerKeys.map((key) => {
                        const info = prayerNames[key];
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between p-3 px-4 border-b last:border-b-0"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{info.emoji}</span>
                              <span className="font-medium font-bangla text-sm">
                                {language === 'bn' ? info.bn : info.en}
                              </span>
                            </div>
                            <span className="font-bold text-sm">
                              {formatTime(mosque[key])}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-elevated p-8 text-center">
                <p className="text-4xl mb-3">🕌</p>
                <p className="text-muted-foreground font-bangla">
                  {language === 'bn' ? 'মসজিদের তথ্য শীঘ্রই আসছে' : 'Mosque data coming soon'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default PrayerTimes;
