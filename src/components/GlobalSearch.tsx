import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Search, X, MapPin, Hotel, Utensils, Bus, Loader2, Umbrella, Ship, ShoppingBag, Baby, UtensilsCrossed } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchResult {
  id: string;
  type: 'place' | 'hotel' | 'restaurant' | 'transport' | 'beach_chair' | 'tour_service' | 'popular_food' | 'children_ride' | 'shopping_market' | 'page';
  name_bn: string;
  name_en: string;
  description_bn?: string | null;
  description_en?: string | null;
  route?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

// Static pages for quick navigation
const staticPages = [
  { id: 'beach-chairs', name_bn: 'কিটকট চেয়ার', name_en: 'Beach Chairs', route: '/beach-chairs', type: 'page' as const },
  { id: 'tour-operators', name_bn: 'ট্যুর অপারেটর ও গাইড', name_en: 'Tour Operators & Guides', route: '/tour-operators', type: 'page' as const },
  { id: 'popular-foods', name_bn: 'জনপ্রিয় খাবার', name_en: 'Popular Foods', route: '/popular-foods', type: 'page' as const },
  { id: 'children-rides', name_bn: 'শিশুদের রাইড', name_en: 'Children Rides', route: '/children-rides', type: 'page' as const },
  { id: 'shopping-markets', name_bn: 'কেনাকাটা', name_en: 'Shopping Markets', route: '/shopping-markets', type: 'page' as const },
  { id: 'weather', name_bn: 'আবহাওয়া', name_en: 'Weather', route: '/weather', type: 'page' as const },
  { id: 'emergency', name_bn: 'জরুরি সেবা', name_en: 'Emergency Services', route: '/emergency', type: 'page' as const },
  { id: 'banks', name_bn: 'ব্যাংক', name_en: 'Banks', route: '/banks', type: 'page' as const },
  { id: 'beach-safety', name_bn: 'বিচ সেফটি', name_en: 'Beach Safety', route: '/beach-safety', type: 'page' as const },
  { id: 'warnings', name_bn: 'সতর্কতা এলাকা', name_en: 'Warning Zones', route: '/warnings', type: 'page' as const },
  { id: 'notices', name_bn: 'লাইভ নোটিশ', name_en: 'Live Notices', route: '/notices', type: 'page' as const },
  { id: 'about-kuakata', name_bn: 'কুয়াকাটা সম্পর্কে', name_en: 'About Kuakata', route: '/about-kuakata', type: 'page' as const },
  { id: 'bus-counters', name_bn: 'বাস কাউন্টার', name_en: 'Bus Counters', route: '/bus-counters', type: 'page' as const },
  { id: 'dc-initiatives', name_bn: 'ডিসি উদ্যোগ', name_en: 'DC Initiatives', route: '/dc-initiatives', type: 'page' as const },
  { id: 'complaints', name_bn: 'অভিযোগ ও পরামর্শ', name_en: 'Complaints', route: '/complaints', type: 'page' as const },
  { id: 'ai-planner', name_bn: 'এআই ট্যুর প্ল্যানার', name_en: 'AI Tour Planner', route: '/ai-planner', type: 'page' as const },
];

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const searchTerm = `%${query}%`;
        const lowerQuery = query.toLowerCase();
        
        // Search static pages first
        const matchedPages = staticPages.filter(page => 
          page.name_bn.toLowerCase().includes(lowerQuery) || 
          page.name_en.toLowerCase().includes(lowerQuery)
        ).map(p => ({ ...p, description_bn: null, description_en: null }));
        
        // Search database tables
        const [places, hotels, restaurants, transport, beachChairs, tourServices, popularFoods, childrenRides, shoppingMarkets] = await Promise.all([
          supabase.from('places').select('id, name_bn, name_en, description_bn, description_en').eq('is_active', true).or(`name_bn.ilike.${searchTerm},name_en.ilike.${searchTerm}`).limit(3),
          supabase.from('hotels').select('id, name_bn, name_en, description_bn, description_en').eq('is_active', true).or(`name_bn.ilike.${searchTerm},name_en.ilike.${searchTerm}`).limit(3),
          supabase.from('restaurants').select('id, name_bn, name_en, description_bn, description_en').eq('is_active', true).or(`name_bn.ilike.${searchTerm},name_en.ilike.${searchTerm}`).limit(3),
          supabase.from('transport').select('id, name_bn, name_en, route_bn, route_en').eq('is_active', true).or(`name_bn.ilike.${searchTerm},name_en.ilike.${searchTerm}`).limit(3),
          supabase.from('beach_chairs').select('id, name_bn, name_en, location_bn, location_en').eq('is_active', true).or(`name_bn.ilike.${searchTerm},name_en.ilike.${searchTerm}`).limit(3),
          supabase.from('tour_services').select('id, name_bn, name_en, description_bn, description_en').eq('is_active', true).or(`name_bn.ilike.${searchTerm},name_en.ilike.${searchTerm}`).limit(3),
          supabase.from('popular_foods').select('id, name_bn, name_en, description_bn, description_en').eq('is_active', true).or(`name_bn.ilike.${searchTerm},name_en.ilike.${searchTerm}`).limit(3),
          supabase.from('children_rides').select('id, name_bn, name_en, description_bn, description_en').eq('is_active', true).or(`name_bn.ilike.${searchTerm},name_en.ilike.${searchTerm}`).limit(3),
          supabase.from('shopping_markets').select('id, name_bn, name_en, description_bn, description_en').eq('is_active', true).or(`name_bn.ilike.${searchTerm},name_en.ilike.${searchTerm}`).limit(3),
        ]);

        const allResults: SearchResult[] = [
          ...matchedPages,
          ...(places.data || []).map(p => ({ ...p, type: 'place' as const })),
          ...(hotels.data || []).map(h => ({ ...h, type: 'hotel' as const })),
          ...(restaurants.data || []).map(r => ({ ...r, type: 'restaurant' as const })),
          ...(transport.data || []).map(t => ({ ...t, type: 'transport' as const, description_bn: t.route_bn, description_en: t.route_en })),
          ...(beachChairs.data || []).map(b => ({ ...b, type: 'beach_chair' as const, description_bn: b.location_bn, description_en: b.location_en })),
          ...(tourServices.data || []).map(t => ({ ...t, type: 'tour_service' as const })),
          ...(popularFoods.data || []).map(f => ({ ...f, type: 'popular_food' as const })),
          ...(childrenRides.data || []).map(r => ({ ...r, type: 'children_ride' as const })),
          ...(shoppingMarkets.data || []).map(m => ({ ...m, type: 'shopping_market' as const })),
        ];

        setResults(allResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    onClose();
    setQuery('');
    setResults([]);
    
    if (result.route) {
      navigate(result.route);
      return;
    }
    
    switch (result.type) {
      case 'place': navigate(`/places/${result.id}`); break;
      case 'hotel': navigate(`/hotels/${result.id}`); break;
      case 'restaurant': navigate(`/restaurants/${result.id}`); break;
      case 'transport': navigate('/transport'); break;
      case 'beach_chair': navigate('/beach-chairs'); break;
      case 'tour_service': navigate('/tour-operators'); break;
      case 'popular_food': navigate('/popular-foods'); break;
      case 'children_ride': navigate('/children-rides'); break;
      case 'shopping_market': navigate('/shopping-markets'); break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'place': return <MapPin className="w-4 h-4 text-primary" />;
      case 'hotel': return <Hotel className="w-4 h-4 text-blue-500" />;
      case 'restaurant': return <Utensils className="w-4 h-4 text-orange-500" />;
      case 'transport': return <Bus className="w-4 h-4 text-green-500" />;
      case 'beach_chair': return <Umbrella className="w-4 h-4 text-cyan-500" />;
      case 'tour_service': return <Ship className="w-4 h-4 text-indigo-500" />;
      case 'popular_food': return <UtensilsCrossed className="w-4 h-4 text-red-500" />;
      case 'children_ride': return <Baby className="w-4 h-4 text-pink-500" />;
      case 'shopping_market': return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
      case 'page': return <MapPin className="w-4 h-4 text-purple-500" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { bn: string; en: string }> = {
      place: { bn: 'দর্শনীয় স্থান', en: 'Place' },
      hotel: { bn: 'হোটেল', en: 'Hotel' },
      restaurant: { bn: 'রেস্টুরেন্ট', en: 'Restaurant' },
      transport: { bn: 'যাতায়াত', en: 'Transport' },
      beach_chair: { bn: 'কিটকট চেয়ার', en: 'Beach Chair' },
      tour_service: { bn: 'ট্যুর সার্ভিস', en: 'Tour Service' },
      popular_food: { bn: 'খাবার', en: 'Food' },
      children_ride: { bn: 'রাইড', en: 'Ride' },
      shopping_market: { bn: 'মার্কেট', en: 'Market' },
      page: { bn: 'পেজ', en: 'Page' },
    };
    return language === 'bn' ? labels[type]?.bn : labels[type]?.en;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/95 z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Search className="w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={language === 'bn' ? 'হোটেল, রেস্টুরেন্ট, কিটকট চেয়ার খুঁজুন...' : 'Search hotels, restaurants, beach chairs...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border-0 focus-visible:ring-0 text-lg text-foreground placeholder:text-muted-foreground"
        />
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {language === 'bn' ? 'কোন ফলাফল পাওয়া যায়নি' : 'No results found'}
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-2">
            {results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className="w-full flex items-start gap-3 p-3 hover:bg-muted rounded-lg text-left transition-colors"
              >
                <div className="mt-0.5">{getIcon(result.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {language === 'bn' ? result.name_bn : result.name_en}
                  </p>
                  {(result.description_bn || result.description_en) && (
                    <p className="text-sm text-muted-foreground truncate">
                      {language === 'bn' ? result.description_bn : result.description_en}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {getTypeLabel(result.type)}
                </span>
              </button>
            ))}
          </div>
        )}

        {!loading && query.length < 2 && (
          <div className="text-center py-8 text-muted-foreground">
            {language === 'bn' ? 'অনুসন্ধান করতে টাইপ করুন...' : 'Type to search...'}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch;
