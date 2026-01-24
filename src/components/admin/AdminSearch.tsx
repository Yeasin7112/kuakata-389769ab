import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Search, X, Hotel, UtensilsCrossed, MapPin, Bus, Megaphone, FileText, Users, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SearchResult {
  id: string;
  type: 'hotel' | 'restaurant' | 'place' | 'bus_counter' | 'dc_initiative' | 'notice' | 'complaint' | 'bank';
  name_bn: string;
  name_en: string;
  description?: string;
}

interface AdminSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (section: string, itemId?: string) => void;
}

const AdminSearch: React.FC<AdminSearchProps> = ({ isOpen, onClose, onSelectSection }) => {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'hotel': return Hotel;
      case 'restaurant': return UtensilsCrossed;
      case 'place': return MapPin;
      case 'bus_counter': return Bus;
      case 'dc_initiative': return Megaphone;
      case 'notice': return FileText;
      case 'complaint': return Users;
      case 'bank': return Building2;
      default: return MapPin;
    }
  };

  const getSection = (type: string) => {
    switch (type) {
      case 'hotel': return 'hotels';
      case 'restaurant': return 'restaurants';
      case 'place': return 'places';
      case 'bus_counter': return 'bus-counters';
      case 'dc_initiative': return 'dc-initiatives';
      case 'notice': return 'notices';
      case 'complaint': return 'complaints';
      case 'bank': return 'banks';
      default: return 'dashboard';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { bn: string; en: string }> = {
      hotel: { bn: 'হোটেল', en: 'Hotel' },
      restaurant: { bn: 'রেস্তোরাঁ', en: 'Restaurant' },
      place: { bn: 'স্থান', en: 'Place' },
      bus_counter: { bn: 'বাস কাউন্টার', en: 'Bus Counter' },
      dc_initiative: { bn: 'ডিসি উদ্যোগ', en: 'DC Initiative' },
      notice: { bn: 'নোটিশ', en: 'Notice' },
      complaint: { bn: 'অভিযোগ', en: 'Complaint' },
      bank: { bn: 'ব্যাংক', en: 'Bank' },
    };
    return language === 'bn' ? labels[type]?.bn : labels[type]?.en;
  };

  const searchAll = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const searchTerm = `%${searchQuery}%`;
    const allResults: SearchResult[] = [];

    try {
      // Search hotels
      const { data: hotels } = await supabase
        .from('hotels')
        .select('id, name_bn, name_en, description_bn, description_en')
        .or(`name_bn.ilike.${searchTerm},name_en.ilike.${searchTerm}`)
        .limit(5);
      
      hotels?.forEach(h => allResults.push({
        id: h.id,
        type: 'hotel',
        name_bn: h.name_bn,
        name_en: h.name_en,
        description: language === 'bn' ? h.description_bn || '' : h.description_en || '',
      }));

      // Search restaurants
      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('id, name_bn, name_en, description_bn, description_en')
        .or(`name_bn.ilike.${searchTerm},name_en.ilike.${searchTerm}`)
        .limit(5);
      
      restaurants?.forEach(r => allResults.push({
        id: r.id,
        type: 'restaurant',
        name_bn: r.name_bn,
        name_en: r.name_en,
        description: language === 'bn' ? r.description_bn || '' : r.description_en || '',
      }));

      // Search places
      const { data: places } = await supabase
        .from('places')
        .select('id, name_bn, name_en, description_bn, description_en')
        .or(`name_bn.ilike.${searchTerm},name_en.ilike.${searchTerm}`)
        .limit(5);
      
      places?.forEach(p => allResults.push({
        id: p.id,
        type: 'place',
        name_bn: p.name_bn,
        name_en: p.name_en,
        description: language === 'bn' ? p.description_bn || '' : p.description_en || '',
      }));

      // Search bus counters
      const { data: busCounters } = await supabase
        .from('bus_counters')
        .select('id, name_bn, name_en, location_bn, location_en')
        .or(`name_bn.ilike.${searchTerm},name_en.ilike.${searchTerm}`)
        .limit(5);
      
      busCounters?.forEach(b => allResults.push({
        id: b.id,
        type: 'bus_counter',
        name_bn: b.name_bn,
        name_en: b.name_en,
        description: language === 'bn' ? b.location_bn || '' : b.location_en || '',
      }));

      // Search DC initiatives
      const { data: initiatives } = await supabase
        .from('dc_initiatives')
        .select('id, title_bn, title_en, description_bn, description_en')
        .or(`title_bn.ilike.${searchTerm},title_en.ilike.${searchTerm}`)
        .limit(5);
      
      initiatives?.forEach(i => allResults.push({
        id: i.id,
        type: 'dc_initiative',
        name_bn: i.title_bn,
        name_en: i.title_en,
        description: language === 'bn' ? i.description_bn || '' : i.description_en || '',
      }));

      // Search notices
      const { data: notices } = await supabase
        .from('notices')
        .select('id, title_bn, title_en, content_bn, content_en')
        .or(`title_bn.ilike.${searchTerm},title_en.ilike.${searchTerm}`)
        .limit(5);
      
      notices?.forEach(n => allResults.push({
        id: n.id,
        type: 'notice',
        name_bn: n.title_bn,
        name_en: n.title_en,
        description: language === 'bn' ? n.content_bn || '' : n.content_en || '',
      }));

      // Search banks
      const { data: banks } = await supabase
        .from('banks')
        .select('id, name_bn, name_en, branch_bn, branch_en')
        .or(`name_bn.ilike.${searchTerm},name_en.ilike.${searchTerm}`)
        .limit(5);
      
      banks?.forEach(b => allResults.push({
        id: b.id,
        type: 'bank',
        name_bn: b.name_bn,
        name_en: b.name_en,
        description: language === 'bn' ? b.branch_bn || '' : b.branch_en || '',
      }));

      setResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchAll(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, searchAll]);

  const handleResultClick = (result: SearchResult) => {
    onSelectSection(getSection(result.type));
    onClose();
    setQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-bangla">
            {language === 'bn' ? 'অ্যাডমিন সার্চ' : 'Admin Search'}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            autoFocus
            placeholder={language === 'bn' ? 'হোটেল, রেস্তোরাঁ, নোটিশ খুঁজুন...' : 'Search hotels, restaurants, notices...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-lg bg-card text-foreground placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((result) => {
                const Icon = getIcon(result.type);
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium font-bangla truncate">
                          {language === 'bn' ? result.name_bn : result.name_en}
                        </p>
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      {result.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : query ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No results found'}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground font-bangla">
              {language === 'bn' ? 'খোঁজা শুরু করতে টাইপ করুন' : 'Start typing to search'}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminSearch;
