import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ImageUpload from '@/components/ImageUpload';
import { Plus, Edit2, Trash2, Bus, Loader2 } from 'lucide-react';

interface BusCounter {
  id: string;
  name_bn: string;
  name_en: string;
  counter_number: string | null;
  location_bn: string | null;
  location_en: string | null;
  phone: string | null;
  image_url: string | null;
  is_active: boolean | null;
}

const BusCountersManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<BusCounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BusCounter | null>(null);
  const [formData, setFormData] = useState({
    name_bn: '',
    name_en: '',
    counter_number: '',
    location_bn: '',
    location_en: '',
    phone: '',
    image_url: '',
    is_active: true,
  });

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('bus_counters')
      .select('*')
      .order('name_en');

    if (!error && data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setFormData({
      name_bn: '',
      name_en: '',
      counter_number: '',
      location_bn: '',
      location_en: '',
      phone: '',
      image_url: '',
      is_active: true,
    });
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name_bn: formData.name_bn,
      name_en: formData.name_en,
      counter_number: formData.counter_number || null,
      location_bn: formData.location_bn || null,
      location_en: formData.location_en || null,
      phone: formData.phone || null,
      image_url: formData.image_url || null,
      is_active: formData.is_active,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from('bus_counters').update(payload).eq('id', editing.id));
    } else {
      ({ error } = await supabase.from('bus_counters').insert([payload]));
    }

    if (error) {
      toast({ title: language === 'bn' ? 'ত্রুটি' : 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Success' });
      fetchItems();
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const handleEdit = (item: BusCounter) => {
    setEditing(item);
    setFormData({
      name_bn: item.name_bn,
      name_en: item.name_en,
      counter_number: item.counter_number || '',
      location_bn: item.location_bn || '',
      location_en: item.location_en || '',
      phone: item.phone || '',
      image_url: item.image_url || '',
      is_active: item.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bn' ? 'মুছে ফেলতে চান?' : 'Delete this item?')) return;
    
    const { error } = await supabase.from('bus_counters').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      fetchItems();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-bangla">
          {language === 'bn' ? 'বাস কাউন্টার' : 'Bus Counters'}
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {language === 'bn' ? 'যোগ করুন' : 'Add New'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-bangla">
                {editing 
                  ? (language === 'bn' ? 'সম্পাদনা' : 'Edit') 
                  : (language === 'bn' ? 'নতুন যোগ করুন' : 'Add New')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name (BN)</label>
                  <Input
                    value={formData.name_bn}
                    onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Name (EN)</label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Counter Number</label>
                <Input
                  value={formData.counter_number}
                  onChange={(e) => setFormData({ ...formData, counter_number: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Location (BN)</label>
                  <Input
                    value={formData.location_bn}
                    onChange={(e) => setFormData({ ...formData, location_bn: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location (EN)</label>
                  <Input
                    value={formData.location_en}
                    onChange={(e) => setFormData({ ...formData, location_en: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Image</label>
                <ImageUpload
                  onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                  currentImage={formData.image_url}
                  folder="bus-counters"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <label className="text-sm">{language === 'bn' ? 'সক্রিয়' : 'Active'}</label>
              </div>

              <Button type="submit" className="w-full">
                {editing ? (language === 'bn' ? 'আপডেট' : 'Update') : (language === 'bn' ? 'যোগ করুন' : 'Add')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="card-elevated p-4 flex items-center gap-4">
            {item.image_url ? (
              <img src={item.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                <Bus className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{language === 'bn' ? item.name_bn : item.name_en}</h3>
              {item.counter_number && (
                <p className="text-sm text-muted-foreground">#{item.counter_number}</p>
              )}
              {!item.is_active && (
                <span className="text-xs text-destructive">Inactive</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusCountersManager;
