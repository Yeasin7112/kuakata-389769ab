import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, XCircle, Camera, Search, DollarSign, Save } from 'lucide-react';
import { toast } from 'sonner';

const PhotographersManager: React.FC = () => {
  const { language } = useLanguage();
  const [photographers, setPhotographers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editRates, setEditRates] = useState<Record<string, number>>({});

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [pRes, bRes] = await Promise.all([
      supabase.from('photographers').select('*').order('created_at', { ascending: false }),
      supabase.from('photographer_bookings').select('*').order('created_at', { ascending: false }).limit(50),
    ]);
    if (pRes.data) {
      setPhotographers(pRes.data);
      const rates: Record<string, number> = {};
      pRes.data.forEach((p: any) => { rates[p.id] = p.commission_rate || 20; });
      setEditRates(rates);
    }
    if (bRes.data) setBookings(bRes.data);
    setLoading(false);
  };

  const toggleApproval = async (id: string, approved: boolean) => {
    const { error } = await supabase.from('photographers').update({ is_approved: !approved }).eq('id', id);
    if (error) toast.error(error.message);
    else toast.success(approved ? 'Unapproved' : 'Approved!');
    fetchData();
  };

  const saveRate = async (id: string) => {
    const { error } = await supabase.from('photographers').update({ commission_rate: editRates[id] || 20 }).eq('id', id);
    if (error) toast.error(error.message);
    else toast.success('Commission rate updated!');
  };

  const totalCommission = bookings.reduce((sum, b) => sum + Number(b.commission_amount || 0), 0);
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  const filtered = photographers.filter(p =>
    p.name_en.toLowerCase().includes(search.toLowerCase()) ||
    p.name_bn.includes(search)
  );

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-bangla">{language === 'bn' ? '📸 ফটোগ্রাফার ম্যানেজমেন্ট' : '📸 Photographer Management'}</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{photographers.length}</p>
          <p className="text-xs text-muted-foreground">{language === 'bn' ? 'মোট ফটোগ্রাফার' : 'Total'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{photographers.filter(p => p.is_approved).length}</p>
          <p className="text-xs text-muted-foreground">{language === 'bn' ? 'অনুমোদিত' : 'Approved'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{pendingBookings}</p>
          <p className="text-xs text-muted-foreground">{language === 'bn' ? 'পেন্ডিং বুকিং' : 'Pending Bookings'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">৳{totalCommission.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{language === 'bn' ? 'মোট কমিশন' : 'Total Commission'}</p>
        </CardContent></Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-10" placeholder={language === 'bn' ? 'অনুসন্ধান...' : 'Search...'}
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Photographers List */}
      <div className="space-y-3">
        {filtered.map(p => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {p.profile_image_url ? (
                  <img src={p.profile_image_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center"><Camera className="w-6 h-6 text-muted-foreground" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold font-bangla">{language === 'bn' ? p.name_bn : p.name_en}</h4>
                    <Badge variant={p.is_approved ? 'default' : 'secondary'}>
                      {p.is_approved ? (language === 'bn' ? 'অনুমোদিত' : 'Approved') : (language === 'bn' ? 'অপেক্ষমাণ' : 'Pending')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.phone} | {p.email}</p>
                  {p.specializations && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(p.specializations as string[]).map((s, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Commission Rate */}
                  <div className="flex items-center gap-2 mt-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <Input type="number" min="0" max="100" step="0.5"
                      value={editRates[p.id] || 0}
                      onChange={e => setEditRates({ ...editRates, [p.id]: parseFloat(e.target.value) || 0 })}
                      className="w-20 h-7 text-sm text-center" />
                    <span className="text-sm text-muted-foreground">%</span>
                    <Button size="sm" variant="outline" onClick={() => saveRate(p.id)} className="h-7">
                      <Save className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <Button size="sm" variant={p.is_approved ? 'destructive' : 'default'} onClick={() => toggleApproval(p.id, p.is_approved)}>
                  {p.is_approved ? <XCircle className="w-4 h-4 mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                  {p.is_approved ? (language === 'bn' ? 'বাতিল' : 'Revoke') : (language === 'bn' ? 'অনুমোদন' : 'Approve')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      {bookings.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">{language === 'bn' ? 'সাম্প্রতিক বুকিং' : 'Recent Bookings'}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {bookings.slice(0, 20).map(b => (
              <div key={b.id} className="flex items-center justify-between p-2 border-b border-border last:border-0 text-sm">
                <div>
                  <p className="font-medium">{b.guest_name || 'Guest'}</p>
                  <p className="text-xs text-muted-foreground">📅 {b.booking_date} | ৳{Number(b.total_price).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-primary">৳{Number(b.commission_amount || 0).toLocaleString()}</p>
                  <Badge variant={b.status === 'confirmed' ? 'default' : b.status === 'cancelled' ? 'destructive' : 'secondary'} className="text-xs">{b.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PhotographersManager;
