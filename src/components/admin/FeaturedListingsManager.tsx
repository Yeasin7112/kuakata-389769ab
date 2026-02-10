import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Crown, Hotel, Utensils } from 'lucide-react';
import { toast } from 'sonner';

interface FeaturedItem {
  id: string;
  name_en: string;
  name_bn: string;
  is_featured: boolean;
  featured_until: string | null;
  type: 'hotel' | 'restaurant';
}

const FeaturedListingsManager: React.FC = () => {
  const { language } = useLanguage();
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [hotelsRes, restaurantsRes] = await Promise.all([
      supabase.from('hotels').select('id, name_en, name_bn, is_featured, featured_until'),
      supabase.from('restaurants').select('id, name_en, name_bn, is_featured, featured_until'),
    ]);
    const all: FeaturedItem[] = [];
    if (hotelsRes.data) all.push(...hotelsRes.data.map((h: any) => ({ ...h, type: 'hotel' as const })));
    if (restaurantsRes.data) all.push(...restaurantsRes.data.map((r: any) => ({ ...r, type: 'restaurant' as const })));
    // Sort featured first
    all.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    setItems(all);
    setLoading(false);
  };

  const toggleFeatured = async (item: FeaturedItem) => {
    const table = item.type === 'hotel' ? 'hotels' : 'restaurants';
    const newValue = !item.is_featured;
    const { error } = await supabase.from(table).update({
      is_featured: newValue,
      featured_until: newValue ? null : null,
    }).eq('id', item.id);
    if (error) toast.error(error.message);
    else toast.success(newValue ? 'Featured!' : 'Unfeatured');
    fetchData();
  };

  const setFeaturedUntil = async (item: FeaturedItem, date: string) => {
    const table = item.type === 'hotel' ? 'hotels' : 'restaurants';
    await supabase.from(table).update({ featured_until: date || null }).eq('id', item.id);
    toast.success('Updated');
    fetchData();
  };

  const featuredCount = items.filter(i => i.is_featured).length;

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-bangla">{language === 'bn' ? '⭐ ফিচার্ড লিস্টিং' : '⭐ Featured Listings'}</h2>
        <Badge variant="outline">{featuredCount} Featured</Badge>
      </div>

      <p className="text-sm text-muted-foreground font-bangla">
        {language === 'bn'
          ? 'ফিচার্ড হোটেল ও রেস্টুরেন্ট তালিকার শীর্ষে "Sponsored" ট্যাগসহ দেখানো হবে। এটি একটি আয়ের উৎস — ব্যবসায়ীরা টাকা দিয়ে ফিচার্ড হতে পারেন।'
          : 'Featured hotels & restaurants appear at the top of listings with a "Sponsored" tag. This is a revenue source — businesses can pay to be featured.'}
      </p>

      <div className="space-y-3">
        {items.map(item => (
          <Card key={`${item.type}-${item.id}`} className={item.is_featured ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/10' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {item.is_featured && <Crown className="w-5 h-5 text-amber-500 shrink-0" />}
                  {item.type === 'hotel' ? <Hotel className="w-4 h-4 text-muted-foreground shrink-0" /> : <Utensils className="w-4 h-4 text-muted-foreground shrink-0" />}
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{language === 'bn' ? item.name_bn : item.name_en}</p>
                    <Badge variant="outline" className="text-xs">{item.type === 'hotel' ? 'Hotel' : 'Restaurant'}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {item.is_featured && (
                    <Input
                      type="date"
                      value={item.featured_until?.split('T')[0] || ''}
                      onChange={e => setFeaturedUntil(item, e.target.value)}
                      className="w-36 h-8 text-xs"
                      placeholder="No expiry"
                    />
                  )}
                  <Switch checked={item.is_featured} onCheckedChange={() => toggleFeatured(item)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturedListingsManager;
