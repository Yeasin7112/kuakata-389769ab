import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Star, ChevronRight } from 'lucide-react';

interface Place {
  id: string;
  name_bn: string;
  name_en: string;
  rating: number | null;
  distance_from_beach: string | null;
  image_url: string | null;
}

const PopularPlaces: React.FC = () => {
  const { t, language } = useLanguage();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      const { data, error } = await supabase
        .from('places')
        .select('id, name_bn, name_en, rating, distance_from_beach, image_url')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(5);
      
      if (data) {
        setPlaces(data);
      }
      setLoading(false);
    };
    
    fetchPlaces();
  }, []);

  if (loading) {
    return (
      <div className="py-4 px-4">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-elevated flex-shrink-0 w-48 h-44 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (places.length === 0) return null;

  return (
    <div className="py-4">
      <div className="px-4 flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground font-bangla">
          {t('popular')}
        </h3>
        <button className="text-sm text-primary font-medium flex items-center gap-1">
          {t('seeAll')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
        {places.map((place) => (
          <div
            key={place.id}
            className="card-elevated flex-shrink-0 w-48 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="relative h-28">
              <img
                src={place.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400'}
                alt={language === 'bn' ? place.name_bn : place.name_en}
                className="w-full h-full object-cover"
              />
              {place.rating && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] text-white font-medium">{place.rating}</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <h4 className="font-medium text-sm text-foreground font-bangla line-clamp-1">
                {language === 'bn' ? place.name_bn : place.name_en}
              </h4>
              {place.distance_from_beach && (
                <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs">{place.distance_from_beach}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularPlaces;
