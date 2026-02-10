import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, Hotel, Star, Crown } from 'lucide-react';
import SupportKuakataBanner from '@/components/SupportKuakataBanner';

interface HotelItem {
  id: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  image_url: string | null;
  rating: number | null;
  price_range: string | null;
  is_featured: boolean | null;
  featured_until: string | null;
}

const HotelsList: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      const { data } = await supabase
        .from('hotels')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });
      
      if (data) {
        // Sort: featured first, then by rating
        const sorted = [...data].sort((a: any, b: any) => {
          const aFeatured = a.is_featured && (!a.featured_until || new Date(a.featured_until) > new Date());
          const bFeatured = b.is_featured && (!b.featured_until || new Date(b.featured_until) > new Date());
          if (aFeatured && !bFeatured) return -1;
          if (!aFeatured && bFeatured) return 1;
          return 0;
        });
        setHotels(sorted);
      }
      setLoading(false);
    };

    fetchHotels();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-header text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate('/')} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold font-bangla">
            {language === 'bn' ? 'হোটেল ও রিসোর্ট' : 'Hotels & Resorts'}
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
        ) : hotels.length > 0 ? (
          <div className="space-y-4">
            {hotels.map((hotel) => {
              const isFeatured = hotel.is_featured && (!hotel.featured_until || new Date(hotel.featured_until) > new Date());
              return (
              <button
                key={hotel.id}
                onClick={() => navigate(`/hotels/${hotel.id}`)}
                className={`card-elevated overflow-hidden w-full text-left ${isFeatured ? 'ring-2 ring-amber-400' : ''}`}
              >
                <div className="relative">
                  {isFeatured && (
                    <span className="absolute top-2 left-2 z-10 bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Sponsored
                    </span>
                  )}
                  {hotel.image_url ? (
                    <img 
                      src={hotel.image_url} 
                      alt={language === 'bn' ? hotel.name_bn : hotel.name_en}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-muted flex items-center justify-center">
                      <Hotel className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  {hotel.price_range && (
                    <span className="absolute bottom-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                      {hotel.price_range}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold font-bangla text-lg">
                        {language === 'bn' ? hotel.name_bn : hotel.name_en}
                      </h3>
                      <p className="text-sm text-muted-foreground font-bangla line-clamp-2 mt-1">
                        {language === 'bn' ? hotel.description_bn : hotel.description_en}
                      </p>
                    </div>
                    {hotel.rating && (
                      <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-medium text-amber-700">{hotel.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
              );
            })}
            <SupportKuakataBanner variant="soft" className="mt-2" />
          </div>
        ) : (
          <div className="card-elevated p-8 text-center">
            <Hotel className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-bangla">
              {language === 'bn' ? 'কোন হোটেল পাওয়া যায়নি' : 'No hotels found'}
            </p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default HotelsList;
