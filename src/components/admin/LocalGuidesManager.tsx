import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

const LocalGuidesManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name_bn: '', name_en: '', specialization_bn: '', specialization_en: '',
    phone: '', price_per_day: '', languages: '', image_url: '', is_active: true, is_verified: false,
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-local-guides'],
    queryFn: async () => {
      const { data, error } = await supabase.from('local_guides').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('local_guides').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-local-guides'] });
      toast({ title: language === 'bn' ? 'সফলভাবে যোগ করা হয়েছে' : 'Added successfully' });
      resetForm();
    },
    onError: () => toast({ title: language === 'bn' ? 'ত্রুটি হয়েছে' : 'Error occurred', variant: 'destructive' })
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('local_guides').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-local-guides'] });
      toast({ title: language === 'bn' ? 'সফলভাবে আপডেট হয়েছে' : 'Updated successfully' });
      resetForm();
    },
    onError: () => toast({ title: language === 'bn' ? 'ত্রুটি হয়েছে' : 'Error occurred', variant: 'destructive' })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('local_guides').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-local-guides'] });
      toast({ title: language === 'bn' ? 'সফলভাবে মুছে ফেলা হয়েছে' : 'Deleted successfully' });
    },
    onError: () => toast({ title: language === 'bn' ? 'ত্রুটি হয়েছে' : 'Error occurred', variant: 'destructive' })
  });

  const resetForm = () => {
    setFormData({ name_bn: '', name_en: '', specialization_bn: '', specialization_en: '', phone: '', price_per_day: '', languages: '', image_url: '', is_active: true, is_verified: false });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name_bn: item.name_bn, name_en: item.name_en, specialization_bn: item.specialization_bn || '', specialization_en: item.specialization_en || '',
      phone: item.phone || '', price_per_day: item.price_per_day || '', languages: item.languages?.join(', ') || '', image_url: item.image_url || '', is_active: item.is_active ?? true, is_verified: item.is_verified ?? false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name_bn: formData.name_bn, name_en: formData.name_en, specialization_bn: formData.specialization_bn || null, specialization_en: formData.specialization_en || null,
      phone: formData.phone, price_per_day: formData.price_per_day || null, languages: formData.languages ? formData.languages.split(',').map(l => l.trim()) : null,
      image_url: formData.image_url || null, is_active: formData.is_active, is_verified: formData.is_verified,
    };
    if (editingItem) { updateMutation.mutate({ id: editingItem.id, data }); } else { createMutation.mutate(data); }
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-bangla">{language === 'bn' ? 'ট্যুর গাইড ম্যানেজমেন্ট' : 'Tour Guides Management'}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={() => resetForm()}><Plus className="w-4 h-4 mr-2" /> {language === 'bn' ? 'নতুন যোগ করুন' : 'Add New'}</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-bangla">{editingItem ? (language === 'bn' ? 'সম্পাদনা করুন' : 'Edit') : (language === 'bn' ? 'নতুন যোগ করুন' : 'Add New')}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>নাম (বাংলা)</Label><Input value={formData.name_bn} onChange={(e) => setFormData({...formData, name_bn: e.target.value})} required /></div>
                <div><Label>Name (English)</Label><Input value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>বিশেষত্ব (বাংলা)</Label><Input value={formData.specialization_bn} onChange={(e) => setFormData({...formData, specialization_bn: e.target.value})} /></div>
                <div><Label>Specialization (English)</Label><Input value={formData.specialization_en} onChange={(e) => setFormData({...formData, specialization_en: e.target.value})} /></div>
              </div>
              <div><Label>ফোন নম্বর</Label><Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required /></div>
              <div><Label>দৈনিক ফি</Label><Input value={formData.price_per_day} onChange={(e) => setFormData({...formData, price_per_day: e.target.value})} placeholder="৫০০-১০০০ টাকা" /></div>
              <div><Label>ভাষা (কমা দিয়ে)</Label><Input value={formData.languages} onChange={(e) => setFormData({...formData, languages: e.target.value})} placeholder="বাংলা, English" /></div>
              <div><Label>ছবি</Label><ImageUpload currentImage={formData.image_url} onImageUploaded={(url) => setFormData({...formData, image_url: url})} folder="guides" /></div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({...formData, is_active: checked})} /><Label>{language === 'bn' ? 'সক্রিয়' : 'Active'}</Label></div>
                <div className="flex items-center gap-2"><Switch checked={formData.is_verified} onCheckedChange={(checked) => setFormData({...formData, is_verified: checked})} /><Label>{language === 'bn' ? 'যাচাইকৃত' : 'Verified'}</Label></div>
              </div>
              <Button type="submit" className="w-full">{editingItem ? (language === 'bn' ? 'আপডেট করুন' : 'Update') : (language === 'bn' ? 'যোগ করুন' : 'Add')}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4">
        {items?.map((item) => (
          <div key={item.id} className="card-elevated p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {item.image_url ? <img src={item.image_url} alt="" className="w-16 h-16 object-cover rounded-full" /> : <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-2xl">👤</div>}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold font-bangla">{language === 'bn' ? item.name_bn : item.name_en}</h3>
                  {item.is_verified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓</span>}
                </div>
                <p className="text-sm text-muted-foreground">{item.phone}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.is_active ? (language === 'bn' ? 'সক্রিয়' : 'Active') : (language === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive')}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(item)}><Edit className="w-4 h-4" /></Button>
              <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocalGuidesManager;
