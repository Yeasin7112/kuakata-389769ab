import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Hotel } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HotelItem {
  id: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  image_url: string | null;
  address_bn: string | null;
  address_en: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  price_range: string | null;
  rating: number | null;
  is_active: boolean | null;
}

const initialFormData = {
  name_bn: '',
  name_en: '',
  description_bn: '',
  description_en: '',
  image_url: '',
  address_bn: '',
  address_en: '',
  phone: '',
  email: '',
  website: '',
  price_range: '',
  rating: 0,
  is_active: true,
};

const HotelsManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelItem | null>(null);
  const [formData, setFormData] = useState(initialFormData);

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

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingHotel(null);
  };

  const handleEdit = (hotel: HotelItem) => {
    setEditingHotel(hotel);
    setFormData({
      name_bn: hotel.name_bn,
      name_en: hotel.name_en,
      description_bn: hotel.description_bn || '',
      description_en: hotel.description_en || '',
      image_url: hotel.image_url || '',
      address_bn: hotel.address_bn || '',
      address_en: hotel.address_en || '',
      phone: hotel.phone || '',
      email: hotel.email || '',
      website: hotel.website || '',
      price_range: hotel.price_range || '',
      rating: hotel.rating || 0,
      is_active: hotel.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
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
      resetForm();
      fetchHotels();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
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
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />{language === 'bn' ? 'নতুন যোগ' : 'Add'}
        </Button>
      </div>

      <div className="grid gap-4">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="card-elevated p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {hotel.image_url ? (
                <img src={hotel.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <Hotel className="w-5 h-5 text-primary" />
              )}
              <div>
                <h3 className="font-semibold font-bangla">{language === 'bn' ? hotel.name_bn : hotel.name_en}</h3>
                <p className="text-sm text-muted-foreground">{hotel.phone} {hotel.price_range && `• ${hotel.price_range}`}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(hotel)} className="p-2 hover:bg-muted rounded-lg"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(hotel.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bangla">
              {editingHotel
                ? (language === 'bn' ? 'হোটেল সম্পাদনা' : 'Edit Hotel')
                : (language === 'bn' ? 'নতুন হোটেল যোগ করুন' : 'Add New Hotel')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUpload
              currentImage={formData.image_url}
              onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
              folder="hotels"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'নাম (বাংলা)' : 'Name (Bangla)'} *</Label>
                <Input value={formData.name_bn} onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'নাম (ইংরেজি)' : 'Name (English)'} *</Label>
                <Input value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'বিবরণ (বাংলা)' : 'Description (Bangla)'}</Label>
              <Textarea value={formData.description_bn} onChange={(e) => setFormData({ ...formData, description_bn: e.target.value })} rows={2} />
            </div>

            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'বিবরণ (ইংরেজি)' : 'Description (English)'}</Label>
              <Textarea value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'ঠিকানা (বাংলা)' : 'Address (Bangla)'}</Label>
                <Input value={formData.address_bn} onChange={(e) => setFormData({ ...formData, address_bn: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'ঠিকানা (ইংরেজি)' : 'Address (English)'}</Label>
                <Input value={formData.address_en} onChange={(e) => setFormData({ ...formData, address_en: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'ফোন' : 'Phone'}</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} type="tel" />
              </div>
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'ইমেইল' : 'Email'}</Label>
                <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} type="email" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'ওয়েবসাইট' : 'Website'}</Label>
                <Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} type="url" />
              </div>
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'মূল্য পরিসীমা' : 'Price Range'}</Label>
                <Input value={formData.price_range} onChange={(e) => setFormData({ ...formData, price_range: e.target.value })} placeholder="৳৳ - ৳৳৳" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'রেটিং' : 'Rating'}</Label>
                <Input type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center justify-between pt-6">
                <Label className="font-bangla">{language === 'bn' ? 'সক্রিয়' : 'Active'}</Label>
                <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}
                </>
              ) : (
                editingHotel
                  ? (language === 'bn' ? 'আপডেট করুন' : 'Update Hotel')
                  : (language === 'bn' ? 'যোগ করুন' : 'Add Hotel')
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HotelsManager;
