import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Phone, Loader2, Car, Bus, Bike, Ship } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

interface Transport {
  id: string;
  name_bn: string;
  name_en: string;
  type: string;
  route_bn: string | null;
  route_en: string | null;
  fare: string | null;
  phone: string | null;
}

const TransportList: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [transports, setTransports] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchTransports();
  }, []);

  const fetchTransports = async () => {
    const { data } = await supabase
      .from('transport')
      .select('*')
      .eq('is_active', true)
      .order('type');
    if (data) setTransports(data);
    setLoading(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bus': return <Bus className="w-5 h-5" />;
      case 'cng': case 'auto': return <Car className="w-5 h-5" />;
      case 'bike': case 'motorcycle': return <Bike className="w-5 h-5" />;
      case 'boat': case 'ship': return <Ship className="w-5 h-5" />;
      default: return <Car className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bus': return 'bg-blue-100 text-blue-600';
      case 'cng': case 'auto': return 'bg-green-100 text-green-600';
      case 'bike': case 'motorcycle': return 'bg-orange-100 text-orange-600';
      case 'boat': case 'ship': return 'bg-cyan-100 text-cyan-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const types = ['all', ...new Set(transports.map(t => t.type))];
  const filtered = filter === 'all' ? transports : transports.filter(t => t.type === filter);

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
            {language === 'bn' ? '🛵 স্থানীয় যাতায়াত' : '🛵 Local Transport'}
          </h1>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="p-4 flex gap-2 overflow-x-auto hide-scrollbar">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === type
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {type === 'all' ? (language === 'bn' ? 'সব' : 'All') : type}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3">
        {filtered.map((transport) => (
          <div key={transport.id} className="card-elevated p-4">
            <div className="flex items-start gap-4">
              <div className={`${getTypeColor(transport.type)} p-3 rounded-xl`}>
                {getTypeIcon(transport.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold font-bangla">
                    {language === 'bn' ? transport.name_bn : transport.name_en}
                  </h3>
                  <span className="text-xs bg-muted px-2 py-1 rounded-full capitalize">
                    {transport.type}
                  </span>
                </div>
                {(transport.route_bn || transport.route_en) && (
                  <p className="text-sm text-muted-foreground mt-1 font-bangla">
                    📍 {language === 'bn' ? transport.route_bn : transport.route_en}
                  </p>
                )}
                {transport.fare && (
                  <p className="text-sm font-medium text-primary mt-1">
                    💰 {transport.fare}
                  </p>
                )}
              </div>
            </div>
            {transport.phone && (
              <a
                href={`tel:${transport.phone}`}
                className="mt-3 w-full bg-primary text-primary-foreground py-2 rounded-lg text-center text-sm font-medium flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" /> {language === 'bn' ? 'কল করুন' : 'Call Now'}
              </a>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {language === 'bn' ? 'কোনো যানবাহন পাওয়া যায়নি' : 'No transport found'}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default TransportList;
