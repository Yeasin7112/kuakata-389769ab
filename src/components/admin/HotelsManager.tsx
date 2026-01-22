import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Hotel {
  id: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  image_url: string | null;
  address_bn: string | null;
  address_en: string | null;
  phone: string | null;
  price_range: string | null;
  rating: number | null;
  is_active: boolean | null;
}

const HotelsManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState({
    name_bn: '',
    name_en: '',
    description_bn: '',
    description_en: '',
    image_url: '',
    address_bn: '',
    address_en: '',
    phone: '',
    price_range: '',
    rating: 0,
    is_active: true,
  });

  const fetchHotels = async () => {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setHotels(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHotels(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHotel) {
        const { error } = await supabase.from('hotels').update(formData).eq('id', editingHotel.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('hotels').insert([formData]);
        if (error) throw error;
      }
      toast({ title: language === 'bn' ? 'সফল!' : 'Success!' });
      setIsDialogOpen(false);
      fetchHotels();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) return;
    const { error } = await supabase.from('hotels').delete().eq('id', id);
    if (!error) fetchHotels();
  };

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-bangla">{language === 'bn' ? 'হোটেল' : 'Hotels'}</h1>
        <Button onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />{language === 'bn' ? 'নতুন যোগ' : 'Add'}</Button>
      </div>
      <div className="grid gap-4">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="card-elevated p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold font-bangla">{language === 'bn' ? hotel.name_bn : hotel.name_en}</h3>
              <p className="text-sm text-muted-foreground">{hotel.phone}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditingHotel(hotel); setFormData({...hotel, description_bn: hotel.description_bn||'', description_en: hotel.description_en||'', image_url: hotel.image_url||'', address_bn: hotel.address_bn||'', address_en: hotel.address_en||'', phone: hotel.phone||'', price_range: hotel.price_range||'', rating: hotel.rating||0, is_active: hotel.is_active??true}); setIsDialogOpen(true); }} className="p-2 hover:bg-muted rounded-lg"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(hotel.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingHotel ? 'Edit' : 'Add'} Hotel</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name (BN)</Label><Input value={formData.name_bn} onChange={(e) => setFormData({...formData, name_bn: e.target.value})} required /></div>
              <div><Label>Name (EN)</Label><Input value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} required /></div>
            </div>
            <div><Label>Phone</Label><Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
            <div><Label>Price Range</Label><Input value={formData.price_range} onChange={(e) => setFormData({...formData, price_range: e.target.value})} /></div>
            <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({...formData, is_active: c})} /></div>
            <Button type="submit" className="w-full">{editingHotel ? 'Update' : 'Add'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HotelsManager;
