import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, MapPin, Loader2, UtensilsCrossed } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import EntityImageGallery from '@/components/EntityImageGallery';

const PopularFoods: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const { data: foods, isLoading } = useQuery({
    queryKey: ['popular-foods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('popular_foods')
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
            {language === 'bn' ? '🍽️ জনপ্রিয় খাবার' : '🍽️ Popular Foods'}
          </h1>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="w-12 h-12" />
            <div>
              <h2 className="font-bold font-bangla">
                {language === 'bn' ? 'কুয়াকাটার স্বাদ' : 'Taste of Kuakata'}
              </h2>
              <p className="text-sm opacity-90 font-bangla">
                {language === 'bn' 
                  ? 'সমুদ্রের তাজা মাছ ও স্থানীয় রেসিপি' 
                  : 'Fresh seafood and local recipes'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Food List */}
      <div className="px-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : foods && foods.length > 0 ? (
          foods.map((food) => (
            <div key={food.id} className="card-elevated overflow-hidden">
              <EntityImageGallery 
                entityId={food.id} 
                entityType="popular_food" 
                mainImage={food.image_url} 
              />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-lg font-bangla">
                    {language === 'bn' ? food.name_bn : food.name_en}
                  </h4>
                  {food.price_range && (
                    <span className="text-sm font-medium text-green-600">
                      {food.price_range}
                    </span>
                  )}
                </div>

                {(food.description_bn || food.description_en) && (
                  <p className="text-sm text-muted-foreground mb-3 font-bangla">
                    {language === 'bn' ? food.description_bn : food.description_en}
                  </p>
                )}

                {(food.location_bn || food.location_en) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-bangla">{language === 'bn' ? food.location_bn : food.location_en}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="font-bangla">{language === 'bn' ? 'কোনো খাবার পাওয়া যায়নি' : 'No foods available'}</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default PopularFoods;
