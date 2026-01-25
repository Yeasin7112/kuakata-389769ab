import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Clock, MapPin, Phone, Loader2, ShoppingBag } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const ShoppingMarkets: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const { data: markets, isLoading } = useQuery({
    queryKey: ['shopping-markets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopping_markets')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { bn: string; en: string }> = {
      'rakhine': { bn: 'রাখাইন মার্কেট', en: 'Rakhine Market' },
      'dried_fish': { bn: 'শুটকি মার্কেট', en: 'Dried Fish Market' },
      'pickles': { bn: 'আচার', en: 'Pickles' },
      'seafood': { bn: 'সামুদ্রিক পণ্য', en: 'Seafood' },
      'general': { bn: 'সাধারণ', en: 'General' },
    };
    return labels[category] || { bn: category, en: category };
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      'rakhine': '🧵',
      'dried_fish': '🐟',
      'pickles': '🥒',
      'seafood': '🦐',
      'general': '🛒',
    };
    return emojis[category] || '🛍️';
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-header text-white p-4 safe-area-top">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-bangla">
            {language === 'bn' ? '🛍️ কেনাকাটা' : '🛍️ Shopping Markets'}
          </h1>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-12 h-12" />
            <div>
              <h2 className="font-bold font-bangla">
                {language === 'bn' ? 'স্থানীয় পণ্য' : 'Local Products'}
              </h2>
              <p className="text-sm opacity-90 font-bangla">
                {language === 'bn' 
                  ? 'রাখাইন পোশাক, শুটকি, আচার ও সামুদ্রিক পণ্য' 
                  : 'Rakhine clothes, dried fish, pickles & seafood'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Markets List */}
      <div className="px-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : markets && markets.length > 0 ? (
          markets.map((market) => (
            <div key={market.id} className="card-elevated overflow-hidden">
              {market.image_url && (
                <img 
                  src={market.image_url} 
                  alt={language === 'bn' ? market.name_bn : market.name_en}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    {market.category && (
                      <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full mb-2">
                        {getCategoryEmoji(market.category)}
                        <span className="font-bangla">
                          {language === 'bn' 
                            ? getCategoryLabel(market.category).bn 
                            : getCategoryLabel(market.category).en}
                        </span>
                      </span>
                    )}
                    <h4 className="font-bold text-lg font-bangla">
                      {language === 'bn' ? market.name_bn : market.name_en}
                    </h4>
                  </div>
                </div>

                {(market.description_bn || market.description_en) && (
                  <p className="text-sm text-muted-foreground mb-3 font-bangla">
                    {language === 'bn' ? market.description_bn : market.description_en}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  {(market.timing_bn || market.timing_en) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="font-bangla">{language === 'bn' ? market.timing_bn : market.timing_en}</span>
                    </div>
                  )}

                  {(market.location_bn || market.location_en) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-bangla">{language === 'bn' ? market.location_bn : market.location_en}</span>
                    </div>
                  )}
                </div>

                {market.phone && (
                  <a
                    href={`tel:${market.phone}`}
                    className="mt-4 w-full bg-primary text-primary-foreground py-2 rounded-lg text-center text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" /> {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact'}
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="font-bangla">{language === 'bn' ? 'কোনো মার্কেট পাওয়া যায়নি' : 'No markets available'}</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ShoppingMarkets;
