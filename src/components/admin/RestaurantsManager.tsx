import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2, Utensils } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

interface Restaurant {
  id: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  address_bn: string | null;
  address_en: string | null;
  phone: string | null;
  cuisine_type: string | null;
  price_range: string | null;
  rating: number | null;
  image_url: string | null;
  is_active: boolean | null;
}

const initialFormData = {
  name_bn: '', name_en: '', description_bn: '', description_en: '',
  address_bn: '', address_en: '', phone: '', cuisine_type: '',
  price_range: '', rating: 0, image_url: '', is_active: true,
};

const RestaurantsManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from('restaurants').select('*').order('name_en');
    if (data) setItems(data);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditing(null);
  };

  const handleEdit = (item: Restaurant) => {
    setEditing(item);
    setFormData({
      name_bn: item.name_bn, name_en: item.name_en,
      description_bn: item.description_bn || '', description_en: item.description_en || '',
      address_bn: item.address_bn || '', address_en: item.address_en || '',
      phone: item.phone || '', cuisine_type: item.cuisine_type || '',
      price_range: item.price_range || '', rating: item.rating || 0,
      image_url: item.image_url || '', is_active: item.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase.from('restaurants').update(formData).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('restaurants').insert([formData]);
        if (error) throw error;
      }
      toast({ title: language === 'bn' ? 'সফল!' : 'Success!' });
      setIsDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) return;
    await supabase.from('restaurants').delete().eq('id', id);
    fetchItems();
  };

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-bangla">{language === 'bn' ? 'রেস্টুরেন্ট' : 'Restaurants'}</h1>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />{language === 'bn' ? 'নতুন যোগ' : 'Add'}
        </Button>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="card-elevated p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {item.image_url ? (
                <img src={item.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <Utensils className="w-5 h-5 text-pink-500" />
              )}
              <div>
                <h3 className="font-semibold font-bangla">{language === 'bn' ? item.name_bn : item.name_en}</h3>
                <p className="text-sm text-muted-foreground">{item.cuisine_type} {item.price_range && `• ${item.price_range}`}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(item)} className="p-2 hover:bg-muted rounded-lg"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bangla">
              {editing
                ? (language === 'bn' ? 'রেস্টুরেন্ট সম্পাদনা' : 'Edit Restaurant')
                : (language === 'bn' ? 'নতুন রেস্টুরেন্ট যোগ করুন' : 'Add New Restaurant')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUpload
              currentImage={formData.image_url}
              onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
              folder="restaurants"
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
                <Label className="font-bangla">{language === 'bn' ? 'খাবারের ধরন' : 'Cuisine Type'}</Label>
                <Input value={formData.cuisine_type} onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })} placeholder="Seafood, Bengali, etc." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'মূল্য পরিসীমা' : 'Price Range'}</Label>
                <Input value={formData.price_range} onChange={(e) => setFormData({ ...formData, price_range: e.target.value })} placeholder="৳৳ - ৳৳৳" />
              </div>
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'রেটিং' : 'Rating'}</Label>
                <Input type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="font-bangla">{language === 'bn' ? 'সক্রিয়' : 'Active'}</Label>
              <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}
                </>
              ) : (
                editing
                  ? (language === 'bn' ? 'আপডেট করুন' : 'Update Restaurant')
                  : (language === 'bn' ? 'যোগ করুন' : 'Add Restaurant')
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RestaurantsManager;
