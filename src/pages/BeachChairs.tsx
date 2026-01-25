import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Phone, Clock, DollarSign, Umbrella, Loader2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const BeachChairs: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const { data: beachChairs, isLoading } = useQuery({
    queryKey: ['beach-chairs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beach_chairs')
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
            {language === 'bn' ? '🏖️ কিটকট চেয়ার' : '🏖️ Beach Chairs'}
          </h1>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <Umbrella className="w-12 h-12" />
            <div>
              <h2 className="font-bold font-bangla">
                {language === 'bn' ? 'বিচে আরাম করুন' : 'Relax at the Beach'}
              </h2>
              <p className="text-sm opacity-90 font-bangla">
                {language === 'bn' 
                  ? 'চেয়ার ও ছাতা ভাড়া নিন সাশ্রয়ী মূল্যে' 
                  : 'Rent chairs and umbrellas at affordable prices'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rental Spots */}
      <div className="px-4 space-y-4">
        <h3 className="font-bold font-bangla">
          📍 {language === 'bn' ? 'ভাড়ার স্থানসমূহ' : 'Rental Locations'}
        </h3>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : beachChairs && beachChairs.length > 0 ? (
          beachChairs.map((spot) => (
            <div key={spot.id} className="card-elevated p-4">
              {spot.image_url && (
                <img 
                  src={spot.image_url} 
                  alt={language === 'bn' ? spot.name_bn : spot.name_en}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-bold font-bangla">
                  {language === 'bn' ? spot.name_bn : spot.name_en}
                </h4>
                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  🏖️
                </span>
              </div>
              
              {(spot.location_bn || spot.location_en) && (
                <p className="text-sm text-muted-foreground mb-2 font-bangla">
                  📍 {language === 'bn' ? spot.location_bn : spot.location_en}
                </p>
              )}
              
              <div className="space-y-2 text-sm">
                {(spot.price_bn || spot.price_en) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="font-bangla">{language === 'bn' ? spot.price_bn : spot.price_en}</span>
                  </div>
                )}
                {(spot.timing_bn || spot.timing_en) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="font-bangla">{language === 'bn' ? spot.timing_bn : spot.timing_en}</span>
                  </div>
                )}
              </div>

              {((spot.features_bn && spot.features_bn.length > 0) || (spot.features_en && spot.features_en.length > 0)) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {(language === 'bn' ? spot.features_bn : spot.features_en)?.map((feature: string, idx: number) => (
                    <span key={idx} className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full font-bangla">
                      {feature}
                    </span>
                  ))}
                </div>
              )}

              {spot.phone && (
                <a
                  href={`tel:${spot.phone}`}
                  className="mt-4 w-full bg-primary text-primary-foreground py-2 rounded-lg text-center text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" /> {language === 'bn' ? 'বুকিং করুন' : 'Book Now'}
                </a>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="font-bangla">{language === 'bn' ? 'কোনো তথ্য পাওয়া যায়নি' : 'No data available'}</p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="p-4 mt-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-bold text-yellow-800 font-bangla mb-2">
            💡 {language === 'bn' ? 'টিপস' : 'Tips'}
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1 font-bangla">
            <li>• {language === 'bn' ? 'সকালে বা বিকালে যাওয়া ভালো' : 'Best to visit morning or evening'}</li>
            <li>• {language === 'bn' ? 'দর-কষাকষি করতে পারবেন' : 'You can negotiate prices'}</li>
            <li>• {language === 'bn' ? 'সানস্ক্রিন সাথে রাখুন' : 'Bring sunscreen'}</li>
          </ul>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default BeachChairs;
