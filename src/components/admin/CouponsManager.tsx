import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Ticket, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  hotel_id: string | null;
  min_booking_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface Hotel {
  id: string;
  name_en: string;
  name_bn: string;
}

const initialForm = {
  code: '',
  discount_type: 'percentage',
  discount_value: 0,
  hotel_id: '',
  min_booking_amount: 0,
  max_discount: '',
  usage_limit: '',
  is_active: true,
  expires_at: '',
};

const CouponsManager: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(initialForm);

  const fetchData = async () => {
    const [couponsRes, hotelsRes] = await Promise.all([
      supabase.from('coupons').select('*').order('created_at', { ascending: false }),
      supabase.from('hotels').select('id, name_en, name_bn'),
    ]);
    if (couponsRes.data) setCoupons(couponsRes.data);
    if (hotelsRes.data) setHotels(hotelsRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'KUA';
    for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setForm({ ...form, code });
  };

  const handleEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      hotel_id: c.hotel_id || '',
      min_booking_amount: c.min_booking_amount,
      max_discount: c.max_discount?.toString() || '',
      usage_limit: c.usage_limit?.toString() || '',
      is_active: c.is_active,
      expires_at: c.expires_at ? c.expires_at.split('T')[0] : '',
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        hotel_id: form.hotel_id && form.hotel_id !== 'all' ? form.hotel_id : null,
        min_booking_amount: form.min_booking_amount,
        max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        is_active: form.is_active,
        expires_at: form.expires_at || null,
        created_by: user.id,
      };

      if (editing) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('coupons').insert([payload]);
        if (error) throw error;
      }

      toast({ title: language === 'bn' ? 'সফল!' : 'Success!' });
      setIsOpen(false);
      setEditing(null);
      setForm(initialForm);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await supabase.from('coupons').delete().eq('id', id);
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-bangla">{language === 'bn' ? '🎟️ কুপন ম্যানেজমেন্ট' : '🎟️ Coupon Management'}</h2>
        <Button onClick={() => { setEditing(null); setForm(initialForm); setIsOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />{language === 'bn' ? 'নতুন কুপন' : 'New Coupon'}
        </Button>
      </div>

      <div className="grid gap-3">
        {coupons.map(c => {
          const hotel = hotels.find(h => h.id === c.hotel_id);
          return (
            <Card key={c.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground">{c.code}</span>
                      <Badge variant={c.is_active ? 'default' : 'secondary'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {c.discount_type === 'flat' ? `৳${c.discount_value} off` : `${c.discount_value}% off`}
                      {c.max_discount ? ` (max ৳${c.max_discount})` : ''}
                      {hotel ? ` • ${language === 'bn' ? hotel.name_bn : hotel.name_en}` : ' • All Hotels'}
                      {` • Used: ${c.used_count}${c.usage_limit ? `/${c.usage_limit}` : ''}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(c)} className="p-2 hover:bg-muted rounded-lg"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {coupons.length === 0 && <p className="text-center text-muted-foreground py-8">No coupons yet</p>}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Coupon Code *</Label>
              <div className="flex gap-2">
                <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required className="font-mono" />
                <Button type="button" variant="outline" size="sm" onClick={generateCode}>Generate</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select value={form.discount_type} onValueChange={v => setForm({ ...form, discount_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="flat">Flat (৳)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Discount Value *</Label>
                <Input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Apply to Hotel</Label>
              <Select value={form.hotel_id} onValueChange={v => setForm({ ...form, hotel_id: v })}>
                <SelectTrigger><SelectValue placeholder="All Hotels" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hotels</SelectItem>
                  {hotels.map(h => <SelectItem key={h.id} value={h.id}>{h.name_en}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Min Booking (৳)</Label>
                <Input type="number" value={form.min_booking_amount} onChange={e => setForm({ ...form, min_booking_amount: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Max Discount (৳)</Label>
                <Input type="number" value={form.max_discount} onChange={e => setForm({ ...form, max_discount: e.target.value })} placeholder="No limit" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Usage Limit</Label>
                <Input type="number" value={form.usage_limit} onChange={e => setForm({ ...form, usage_limit: e.target.value })} placeholder="Unlimited" />
              </div>
              <div className="space-y-2">
                <Label>Expires At</Label>
                <Input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
              <Label>Active</Label>
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : (editing ? 'Update Coupon' : 'Create Coupon')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponsManager;
