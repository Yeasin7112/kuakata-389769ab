import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, Flag, Info, Waves, Wind, Clock } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { format } from 'date-fns';

interface BeachSafetyData {
  id: string;
  date: string;
  status: string | null;
  flag_color: string | null;
  notes_bn: string | null;
  notes_en: string | null;
}

interface TideAlert {
  id: string;
  date: string;
  high_tide_time: string | null;
  high_tide_level: string | null;
  low_tide_time: string | null;
  low_tide_level: string | null;
  notes_bn: string | null;
  notes_en: string | null;
}

const BeachSafety: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [safetyData, setSafetyData] = useState<BeachSafetyData | null>(null);
  const [tideData, setTideData] = useState<TideAlert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const [safetyRes, tideRes] = await Promise.all([
      supabase.from('beach_safety').select('*').eq('date', today).maybeSingle(),
      supabase.from('tide_alerts').select('*').eq('date', today).eq('is_active', true).maybeSingle()
    ]);

    if (safetyRes.data) setSafetyData(safetyRes.data);
    if (tideRes.data) setTideData(tideRes.data);
    setLoading(false);
  };

  const getFlagConfig = (color: string | null) => {
    switch (color?.toLowerCase()) {
      case 'green': return { bg: 'bg-green-500', label: language === 'bn' ? 'নিরাপদ' : 'Safe', emoji: '🟢' };
      case 'yellow': return { bg: 'bg-yellow-500', label: language === 'bn' ? 'সতর্কতা' : 'Caution', emoji: '🟡' };
      case 'red': return { bg: 'bg-red-500', label: language === 'bn' ? 'বিপজ্জনক' : 'Dangerous', emoji: '🔴' };
      default: return { bg: 'bg-gray-500', label: language === 'bn' ? 'তথ্য নেই' : 'No Data', emoji: '⚪' };
    }
  };

  const flagConfig = getFlagConfig(safetyData?.flag_color);

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
      <div className="bg-gradient-header text-white p-4 safe-area-top">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-bangla">
            {language === 'bn' ? '🏄 বিচ সেফটি' : '🏄 Beach Safety'}
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Current Flag Status */}
        <div className="card-elevated p-6 text-center">
          <div className={`${flagConfig.bg} w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4`}>
            <Flag className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-bangla mb-2">
            {flagConfig.emoji} {flagConfig.label}
          </h2>
          <p className="text-muted-foreground font-bangla">
            {language === 'bn' ? 'আজকের বিচ স্ট্যাটাস' : "Today's Beach Status"}
          </p>
          {safetyData?.notes_bn && (
            <p className="mt-4 text-sm bg-muted p-3 rounded-lg font-bangla">
              <Info className="w-4 h-4 inline mr-2" />
              {language === 'bn' ? safetyData.notes_bn : safetyData.notes_en}
            </p>
          )}
        </div>

        {/* Tide Information */}
        {tideData && (
          <div className="card-elevated p-4">
            <h3 className="font-bold font-bangla flex items-center gap-2 mb-4">
              <Waves className="w-5 h-5 text-primary" />
              {language === 'bn' ? 'জোয়ার-ভাটার তথ্য' : 'Tide Information'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <div className="text-2xl mb-2">🌊</div>
                <p className="text-xs text-muted-foreground font-bangla">
                  {language === 'bn' ? 'জোয়ার' : 'High Tide'}
                </p>
                <p className="text-lg font-bold">{tideData.high_tide_time || '--:--'}</p>
                {tideData.high_tide_level && (
                  <p className="text-xs text-muted-foreground">{tideData.high_tide_level}</p>
                )}
              </div>
              <div className="bg-cyan-50 p-4 rounded-xl text-center">
                <div className="text-2xl mb-2">🏖️</div>
                <p className="text-xs text-muted-foreground font-bangla">
                  {language === 'bn' ? 'ভাটা' : 'Low Tide'}
                </p>
                <p className="text-lg font-bold">{tideData.low_tide_time || '--:--'}</p>
                {tideData.low_tide_level && (
                  <p className="text-xs text-muted-foreground">{tideData.low_tide_level}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Safety Guidelines */}
        <div className="card-elevated p-4">
          <h3 className="font-bold font-bangla mb-4">
            📋 {language === 'bn' ? 'নিরাপত্তা নির্দেশিকা' : 'Safety Guidelines'}
          </h3>
          <div className="space-y-3">
            {[
              { emoji: '🟢', bn: 'সবুজ পতাকা = নিরাপদ সাঁতার', en: 'Green flag = Safe swimming' },
              { emoji: '🟡', bn: 'হলুদ পতাকা = সতর্কতার সাথে সাঁতার', en: 'Yellow flag = Swim with caution' },
              { emoji: '🔴', bn: 'লাল পতাকা = সাঁতার নিষেধ', en: 'Red flag = No swimming' },
              { emoji: '👀', bn: 'সবসময় লাইফগার্ড এলাকায় থাকুন', en: 'Always stay in lifeguard zones' },
              { emoji: '🚫', bn: 'একা সাঁতার কাটবেন না', en: 'Never swim alone' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm font-bangla">
                <span className="text-xl">{item.emoji}</span>
                <span>{language === 'bn' ? item.bn : item.en}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-bold text-red-700 font-bangla mb-2">
            🆘 {language === 'bn' ? 'জরুরি প্রয়োজনে' : 'Emergency'}
          </h3>
          <a href="tel:999" className="block bg-red-500 text-white py-3 rounded-lg text-center font-bold">
            📞 999 - {language === 'bn' ? 'জাতীয় জরুরি সেবা' : 'National Emergency'}
          </a>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default BeachSafety;
