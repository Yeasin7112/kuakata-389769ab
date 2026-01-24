import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, Bus, Phone, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BusCounter {
  id: string;
  name_bn: string;
  name_en: string;
  counter_number: string | null;
  location_bn: string | null;
  location_en: string | null;
  phone: string | null;
  image_url: string | null;
}

const BusCounters: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [counters, setCounters] = useState<BusCounter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounters = async () => {
      const { data, error } = await supabase
        .from('bus_counters')
        .select('*')
        .eq('is_active', true)
        .order('name_en');

      if (!error && data) {
        setCounters(data);
      }
      setLoading(false);
    };

    fetchCounters();
  }, []);

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold font-bangla">
            {language === 'bn' ? 'বাস কাউন্টার' : 'Bus Counters'}
          </h1>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : counters.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <Bus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-bangla">
              {language === 'bn' ? 'কোন বাস কাউন্টার পাওয়া যায়নি' : 'No bus counters found'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {counters.map((counter) => (
              <div key={counter.id} className="card-elevated overflow-hidden">
                {counter.image_url && (
                  <img
                    src={counter.image_url}
                    alt={language === 'bn' ? counter.name_bn : counter.name_en}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bus className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold font-bangla">
                        {language === 'bn' ? counter.name_bn : counter.name_en}
                      </h3>
                      {counter.counter_number && (
                        <p className="text-sm text-muted-foreground">
                          {language === 'bn' ? 'কাউন্টার নং: ' : 'Counter #: '}{counter.counter_number}
                        </p>
                      )}
                    </div>
                  </div>

                  {(counter.location_bn || counter.location_en) && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="font-bangla">
                        {language === 'bn' ? counter.location_bn : counter.location_en}
                      </span>
                    </div>
                  )}

                  {counter.phone && (
                    <Button
                      onClick={() => handleCall(counter.phone!)}
                      variant="outline"
                      className="w-full mt-4 gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      {counter.phone}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default BusCounters;
