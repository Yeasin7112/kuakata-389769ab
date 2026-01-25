import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Clock, MapPin, Loader2, Ticket } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const ChildrenRides: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const { data: rides, isLoading } = useQuery({
    queryKey: ['children-rides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children_rides')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-header text-white p-4 safe-area-top">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-bangla">
            {language === 'bn' ? '🎡 শিশুদের রাইড' : '🎡 Children\'s Rides'}
          </h1>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎢</span>
            <div>
              <h2 className="font-bold font-bangla">
                {language === 'bn' ? 'শিশুদের আনন্দ' : 'Fun for Kids'}
              </h2>
              <p className="text-sm opacity-90 font-bangla">
                {language === 'bn' 
                  ? 'বিভিন্ন রাইড ও বিনোদন' 
                  : 'Various rides and entertainment'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rides List */}
      <div className="px-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : rides && rides.length > 0 ? (
          rides.map((ride) => (
            <div key={ride.id} className="card-elevated overflow-hidden">
              {ride.image_url && (
                <img 
                  src={ride.image_url} 
                  alt={language === 'bn' ? ride.name_bn : ride.name_en}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-lg font-bangla">
                    🎡 {language === 'bn' ? ride.name_bn : ride.name_en}
                  </h4>
                </div>

                {(ride.description_bn || ride.description_en) && (
                  <p className="text-sm text-muted-foreground mb-3 font-bangla">
                    {language === 'bn' ? ride.description_bn : ride.description_en}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  {(ride.price_bn || ride.price_en) && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Ticket className="w-4 h-4" />
                      <span className="font-bangla">{language === 'bn' ? ride.price_bn : ride.price_en}</span>
                    </div>
                  )}

                  {(ride.timing_bn || ride.timing_en) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="font-bangla">{language === 'bn' ? ride.timing_bn : ride.timing_en}</span>
                    </div>
                  )}

                  {(ride.location_bn || ride.location_en) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-bangla">{language === 'bn' ? ride.location_bn : ride.location_en}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <span className="text-4xl mb-2 block">🎢</span>
            <p className="font-bangla">{language === 'bn' ? 'কোনো রাইড পাওয়া যায়নি' : 'No rides available'}</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ChildrenRides;
