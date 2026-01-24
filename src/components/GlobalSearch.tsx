import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Search, X, MapPin, Hotel, Utensils, Bus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchResult {
  id: string;
  type: 'place' | 'hotel' | 'restaurant' | 'transport';
  name_bn: string;
  name_en: string;
  description_bn?: string | null;
  description_en?: string | null;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

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
        
        const [places, hotels, restaurants, transport] = await Promise.all([
          supabase
            .from('places')
            .select('id, name_bn, name_en, description_bn, description_en')
            .eq('is_active', true)
            .or(`name_bn.ilike.${searchTerm},name_en.ilike.${searchTerm}`)
            .limit(5),
          supabase
            .from('hotels')
            .select('id, name_bn, name_en, description_bn, description_en')
            .eq('is_active', true)
            .or(`name_bn.ilike.${searchTerm},name_en.ilike.${searchTerm}`)
            .limit(5),
          supabase
            .from('restaurants')
            .select('id, name_bn, name_en, description_bn, description_en')
            .eq('is_active', true)
            .or(`name_bn.ilike.${searchTerm},name_en.ilike.${searchTerm}`)
            .limit(5),
          supabase
            .from('transport')
            .select('id, name_bn, name_en, route_bn, route_en')
            .eq('is_active', true)
            .or(`name_bn.ilike.${searchTerm},name_en.ilike.${searchTerm}`)
            .limit(5),
        ]);

        const allResults: SearchResult[] = [
          ...(places.data || []).map(p => ({ ...p, type: 'place' as const })),
          ...(hotels.data || []).map(h => ({ ...h, type: 'hotel' as const })),
          ...(restaurants.data || []).map(r => ({ ...r, type: 'restaurant' as const })),
          ...(transport.data || []).map(t => ({ 
            ...t, 
            type: 'transport' as const,
            description_bn: t.route_bn,
            description_en: t.route_en
          })),
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
    
    switch (result.type) {
      case 'place':
        navigate(`/places/${result.id}`);
        break;
      case 'hotel':
        navigate(`/hotels/${result.id}`);
        break;
      case 'restaurant':
        navigate(`/restaurants/${result.id}`);
        break;
      case 'transport':
        navigate('/transport');
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'place': return <MapPin className="w-4 h-4 text-primary" />;
      case 'hotel': return <Hotel className="w-4 h-4 text-blue-500" />;
      case 'restaurant': return <Utensils className="w-4 h-4 text-orange-500" />;
      case 'transport': return <Bus className="w-4 h-4 text-green-500" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { bn: string; en: string }> = {
      place: { bn: 'দর্শনীয় স্থান', en: 'Place' },
      hotel: { bn: 'হোটেল', en: 'Hotel' },
      restaurant: { bn: 'রেস্টুরেন্ট', en: 'Restaurant' },
      transport: { bn: 'যাতায়াত', en: 'Transport' },
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
          placeholder={language === 'bn' ? 'হোটেল, রেস্টুরেন্ট, স্থান খুঁজুন...' : 'Search hotels, restaurants, places...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border-0 focus-visible:ring-0 text-lg"
        />
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
          <X className="w-5 h-5" />
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
