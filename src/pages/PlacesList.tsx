import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, MapPin, Star, Compass } from 'lucide-react';

interface Place {
  id: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  image_url: string | null;
  rating: number | null;
  category: string | null;
}

const PlacesList: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      const { data } = await supabase
        .from('places')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });
      
      if (data) setPlaces(data);
      setLoading(false);
    };

    fetchPlaces();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-header text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate('/')} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold font-bangla">
            {language === 'bn' ? 'দর্শনীয় স্থান' : 'Tourist Spots'}
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-elevated p-4 animate-pulse">
                <div className="h-32 bg-muted rounded-xl mb-3" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : places.length > 0 ? (
          <div className="space-y-4">
            {places.map((place) => (
              <button
                key={place.id}
                onClick={() => navigate(`/places/${place.id}`)}
                className="card-elevated overflow-hidden w-full text-left"
              >
                {place.image_url && (
                  <img 
                    src={place.image_url} 
                    alt={language === 'bn' ? place.name_bn : place.name_en}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold font-bangla text-lg">
                        {language === 'bn' ? place.name_bn : place.name_en}
                      </h3>
                      <p className="text-sm text-muted-foreground font-bangla line-clamp-2 mt-1">
                        {language === 'bn' ? place.description_bn : place.description_en}
                      </p>
                    </div>
                    {place.rating && (
                      <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-medium text-amber-700">{place.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="card-elevated p-8 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-bangla">
              {language === 'bn' ? 'কোন স্থান পাওয়া যায়নি' : 'No places found'}
            </p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default PlacesList;
