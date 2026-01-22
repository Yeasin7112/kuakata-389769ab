import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Phone, MapPin, Loader2, Ambulance, Shield, Flame, Building2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

interface EmergencyService {
  id: string;
  name_bn: string;
  name_en: string;
  type: string;
  phone: string;
  address_bn: string | null;
  address_en: string | null;
  is_active: boolean | null;
}

const EmergencyServices: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data } = await supabase
      .from('emergency_services')
      .select('*')
      .eq('is_active', true)
      .order('type');
    if (data) setServices(data);
    setLoading(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'police': return <Shield className="w-6 h-6" />;
      case 'ambulance': case 'hospital': return <Ambulance className="w-6 h-6" />;
      case 'fire': return <Flame className="w-6 h-6" />;
      default: return <Building2 className="w-6 h-6" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'police': return 'bg-blue-500';
      case 'ambulance': case 'hospital': return 'bg-red-500';
      case 'fire': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const quickDial = [
    { type: 'police', number: '999', labelBn: 'পুলিশ', labelEn: 'Police', icon: <Shield className="w-8 h-8" />, color: 'bg-blue-500' },
    { type: 'ambulance', number: '199', labelBn: 'অ্যাম্বুলেন্স', labelEn: 'Ambulance', icon: <Ambulance className="w-8 h-8" />, color: 'bg-red-500' },
    { type: 'fire', number: '199', labelBn: 'ফায়ার সার্ভিস', labelEn: 'Fire Service', icon: <Flame className="w-8 h-8" />, color: 'bg-orange-500' },
  ];

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
            {language === 'bn' ? '🏥 জরুরি সেবা' : '🏥 Emergency Services'}
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Dial Section */}
        <div className="card-elevated p-4">
          <h2 className="text-lg font-bold font-bangla mb-4">
            {language === 'bn' ? '⚡ দ্রুত কল করুন' : '⚡ Quick Dial'}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {quickDial.map((item) => (
              <button
                key={item.type}
                onClick={() => handleCall(item.number)}
                className={`${item.color} text-white rounded-2xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform shadow-lg`}
              >
                {item.icon}
                <span className="text-sm font-bold font-bangla">
                  {language === 'bn' ? item.labelBn : item.labelEn}
                </span>
                <span className="text-lg font-bold">{item.number}</span>
              </button>
            ))}
          </div>
        </div>

        {/* All Services List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold font-bangla">
            {language === 'bn' ? '📋 সকল সেবা' : '📋 All Services'}
          </h2>
          {services.map((service) => (
            <div key={service.id} className="card-elevated p-4">
              <div className="flex items-start gap-4">
                <div className={`${getTypeColor(service.type)} text-white p-3 rounded-xl`}>
                  {getTypeIcon(service.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold font-bangla">
                    {language === 'bn' ? service.name_bn : service.name_en}
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize">{service.type}</p>
                  {(service.address_bn || service.address_en) && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {language === 'bn' ? service.address_bn : service.address_en}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleCall(service.phone)}
                  className="bg-primary text-primary-foreground p-3 rounded-full"
                >
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {language === 'bn' ? 'কোনো সেবা পাওয়া যায়নি' : 'No services found'}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default EmergencyServices;
