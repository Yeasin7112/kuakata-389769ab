import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface HotelCommission {
  id: string;
  name_en: string;
  name_bn: string;
  commission_rate: number;
}

interface CommissionEarning {
  id: string;
  booking_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  created_at: string;
  hotel_id: string;
}

const CommissionManager: React.FC = () => {
  const { language } = useLanguage();
  const [hotels, setHotels] = useState<HotelCommission[]>([]);
  const [earnings, setEarnings] = useState<CommissionEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRates, setEditRates] = useState<Record<string, number>>({});

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [hotelsRes, earningsRes] = await Promise.all([
      supabase.from('hotels').select('id, name_en, name_bn, commission_rate').order('name_en'),
      supabase.from('commission_earnings').select('*').order('created_at', { ascending: false }).limit(50),
    ]);
    if (hotelsRes.data) {
      setHotels(hotelsRes.data as HotelCommission[]);
      const rates: Record<string, number> = {};
      hotelsRes.data.forEach((h: any) => { rates[h.id] = h.commission_rate || 0; });
      setEditRates(rates);
    }
    if (earningsRes.data) setEarnings(earningsRes.data as CommissionEarning[]);
    setLoading(false);
  };

  const saveRate = async (hotelId: string) => {
    const rate = editRates[hotelId] || 0;
    const { error } = await supabase.from('hotels').update({ commission_rate: rate }).eq('id', hotelId);
    if (error) toast.error(error.message);
    else toast.success('Commission rate updated!');
    fetchData();
  };

  const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.commission_amount), 0);
  const pendingEarnings = earnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + Number(e.commission_amount), 0);

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-bangla">{language === 'bn' ? '💰 কমিশন ম্যানেজমেন্ট' : '💰 Commission Management'}</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">৳{totalEarnings.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{language === 'bn' ? 'মোট কমিশন' : 'Total Commission'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">৳{pendingEarnings.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{language === 'bn' ? 'পেন্ডিং' : 'Pending'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{earnings.length}</p>
          <p className="text-xs text-muted-foreground">{language === 'bn' ? 'মোট ট্র্যাকিং' : 'Total Records'}</p>
        </CardContent></Card>
      </div>

      {/* Hotel Commission Rates */}
      <Card>
        <CardHeader><CardTitle className="text-base">{language === 'bn' ? 'হোটেল কমিশন রেট' : 'Hotel Commission Rates'}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {hotels.map(h => (
            <div key={h.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{language === 'bn' ? h.name_bn : h.name_en}</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={editRates[h.id] || 0}
                  onChange={e => setEditRates({ ...editRates, [h.id]: parseFloat(e.target.value) || 0 })}
                  className="w-20 h-8 text-sm text-center"
                />
                <span className="text-sm text-muted-foreground">%</span>
                <Button size="sm" variant="outline" onClick={() => saveRate(h.id)} className="h-8">
                  <Save className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          {hotels.length === 0 && <p className="text-center text-muted-foreground py-4">No hotels found</p>}
        </CardContent>
      </Card>

      {/* Recent Earnings */}
      {earnings.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">{language === 'bn' ? 'সাম্প্রতিক কমিশন' : 'Recent Earnings'}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {earnings.map(e => {
              const hotel = hotels.find(h => h.id === e.hotel_id);
              return (
                <div key={e.id} className="flex items-center justify-between p-2 border-b border-border last:border-0 text-sm">
                  <div>
                    <p className="font-medium">{hotel ? (language === 'bn' ? hotel.name_bn : hotel.name_en) : 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">
                      Booking: ৳{Number(e.booking_amount).toLocaleString()} × {e.commission_rate}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">৳{Number(e.commission_amount).toLocaleString()}</p>
                    <Badge variant={e.status === 'collected' ? 'default' : 'secondary'} className="text-xs">{e.status}</Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommissionManager;
