import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, MapPin, Loader2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

interface WarningZone {
  id: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  severity: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number | null;
}

const WarningZones: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [zones, setZones] = useState<WarningZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    const { data } = await supabase
      .from('warning_zones')
      .select('*')
      .eq('is_active', true)
      .order('severity');
    if (data) setZones(data);
    setLoading(false);
  };

  const getSeverityConfig = (severity: string | null) => {
    switch (severity?.toLowerCase()) {
      case 'high': return { icon: <AlertTriangle className="w-6 h-6" />, bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-300', label: language === 'bn' ? 'উচ্চ ঝুঁকি' : 'High Risk' };
      case 'medium': return { icon: <AlertCircle className="w-6 h-6" />, bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-300', label: language === 'bn' ? 'মাঝারি ঝুঁকি' : 'Medium Risk' };
      default: return { icon: <Info className="w-6 h-6" />, bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-300', label: language === 'bn' ? 'সতর্কতা' : 'Caution' };
    }
  };

  const openMap = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
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
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 safe-area-top">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-bangla">
            {language === 'bn' ? '⚠️ সতর্কতা এলাকা' : '⚠️ Warning Zones'}
          </h1>
        </div>
      </div>

      {/* Safety Tips */}
      <div className="p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
          <h3 className="font-bold text-yellow-800 font-bangla flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {language === 'bn' ? 'নিরাপত্তা টিপস' : 'Safety Tips'}
          </h3>
          <ul className="text-sm text-yellow-700 mt-2 space-y-1 font-bangla">
            <li>• {language === 'bn' ? 'সতর্কতা এলাকায় সাঁতার কাটবেন না' : "Don't swim in warning zones"}</li>
            <li>• {language === 'bn' ? 'লাইফগার্ডের নির্দেশনা মানুন' : 'Follow lifeguard instructions'}</li>
            <li>• {language === 'bn' ? 'লাল পতাকা দেখলে পানিতে নামবেন না' : "Don't enter water when red flag is up"}</li>
          </ul>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {zones.map((zone) => {
          const config = getSeverityConfig(zone.severity);
          return (
            <div key={zone.id} className={`card-elevated p-4 border-l-4 ${config.border}`}>
              <div className="flex items-start gap-4">
                <div className={`${config.bg} ${config.text} p-3 rounded-xl`}>
                  {config.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold font-bangla">
                      {language === 'bn' ? zone.name_bn : zone.name_en}
                    </h3>
                    <span className={`text-xs ${config.bg} ${config.text} px-2 py-1 rounded-full font-medium`}>
                      {config.label}
                    </span>
                  </div>
                  {(zone.description_bn || zone.description_en) && (
                    <p className="text-sm text-muted-foreground mt-1 font-bangla">
                      {language === 'bn' ? zone.description_bn : zone.description_en}
                    </p>
                  )}
                  {zone.radius_meters && (
                    <p className="text-xs text-muted-foreground mt-2">
                      📏 {language === 'bn' ? `ব্যাসার্ধ: ${zone.radius_meters} মিটার` : `Radius: ${zone.radius_meters}m`}
                    </p>
                  )}
                </div>
              </div>
              {zone.latitude && zone.longitude && (
                <button
                  onClick={() => openMap(zone.latitude!, zone.longitude!)}
                  className="mt-3 w-full bg-muted text-foreground py-2 rounded-lg text-center text-sm font-medium flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" /> {language === 'bn' ? 'ম্যাপে দেখুন' : 'View on Map'}
                </button>
              )}
            </div>
          );
        })}
        {zones.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-muted-foreground font-bangla">
              {language === 'bn' ? 'বর্তমানে কোনো সতর্কতা নেই' : 'No active warnings'}
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default WarningZones;
