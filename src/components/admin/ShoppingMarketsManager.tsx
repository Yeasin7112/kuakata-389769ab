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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

const ShoppingMarketsManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name_bn: '', name_en: '', description_bn: '', description_en: '', category: 'general', location_bn: '', location_en: '', timing_bn: '', timing_en: '', phone: '', image_url: '', is_active: true,
  });

  const categories = [
    { value: 'rakhine', labelBn: 'রাখাইন মার্কেট', labelEn: 'Rakhine Market' },
    { value: 'dried_fish', labelBn: 'শুটকি মার্কেট', labelEn: 'Dried Fish Market' },
    { value: 'pickles', labelBn: 'আচার', labelEn: 'Pickles' },
    { value: 'seafood', labelBn: 'সামুদ্রিক পণ্য', labelEn: 'Seafood' },
    { value: 'general', labelBn: 'সাধারণ', labelEn: 'General' },
  ];

  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-shopping-markets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('shopping_markets').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => { const { error } = await supabase.from('shopping_markets').insert([data]); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-shopping-markets'] }); toast({ title: language === 'bn' ? 'সফলভাবে যোগ করা হয়েছে' : 'Added successfully' }); resetForm(); },
    onError: () => toast({ title: language === 'bn' ? 'ত্রুটি হয়েছে' : 'Error occurred', variant: 'destructive' })
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => { const { error } = await supabase.from('shopping_markets').update(data).eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-shopping-markets'] }); toast({ title: language === 'bn' ? 'সফলভাবে আপডেট হয়েছে' : 'Updated successfully' }); resetForm(); },
    onError: () => toast({ title: language === 'bn' ? 'ত্রুটি হয়েছে' : 'Error occurred', variant: 'destructive' })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('shopping_markets').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-shopping-markets'] }); toast({ title: language === 'bn' ? 'সফলভাবে মুছে ফেলা হয়েছে' : 'Deleted successfully' }); },
    onError: () => toast({ title: language === 'bn' ? 'ত্রুটি হয়েছে' : 'Error occurred', variant: 'destructive' })
  });

  const resetForm = () => { setFormData({ name_bn: '', name_en: '', description_bn: '', description_en: '', category: 'general', location_bn: '', location_en: '', timing_bn: '', timing_en: '', phone: '', image_url: '', is_active: true }); setEditingItem(null); setIsDialogOpen(false); };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ name_bn: item.name_bn, name_en: item.name_en, description_bn: item.description_bn || '', description_en: item.description_en || '', category: item.category || 'general', location_bn: item.location_bn || '', location_en: item.location_en || '', timing_bn: item.timing_bn || '', timing_en: item.timing_en || '', phone: item.phone || '', image_url: item.image_url || '', is_active: item.is_active ?? true });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, description_bn: formData.description_bn || null, description_en: formData.description_en || null, location_bn: formData.location_bn || null, location_en: formData.location_en || null, timing_bn: formData.timing_bn || null, timing_en: formData.timing_en || null, phone: formData.phone || null, image_url: formData.image_url || null };
    if (editingItem) { updateMutation.mutate({ id: editingItem.id, data }); } else { createMutation.mutate(data); }
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-bangla">{language === 'bn' ? 'কেনাকাটার মার্কেট ম্যানেজমেন্ট' : 'Shopping Markets Management'}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={() => resetForm()}><Plus className="w-4 h-4 mr-2" /> {language === 'bn' ? 'নতুন যোগ করুন' : 'Add New'}</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-bangla">{editingItem ? (language === 'bn' ? 'সম্পাদনা করুন' : 'Edit') : (language === 'bn' ? 'নতুন যোগ করুন' : 'Add New')}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>নাম (বাংলা)</Label><Input value={formData.name_bn} onChange={(e) => setFormData({...formData, name_bn: e.target.value})} required /></div>
                <div><Label>Name (English)</Label><Input value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} required /></div>
              </div>
              <div>
                <Label>ক্যাটাগরি</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{language === 'bn' ? c.labelBn : c.labelEn}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>বিবরণ (বাংলা)</Label><Textarea value={formData.description_bn} onChange={(e) => setFormData({...formData, description_bn: e.target.value})} /></div>
                <div><Label>Description (English)</Label><Textarea value={formData.description_en} onChange={(e) => setFormData({...formData, description_en: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>অবস্থান (বাংলা)</Label><Input value={formData.location_bn} onChange={(e) => setFormData({...formData, location_bn: e.target.value})} /></div>
                <div><Label>Location (English)</Label><Input value={formData.location_en} onChange={(e) => setFormData({...formData, location_en: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>সময় (বাংলা)</Label><Input value={formData.timing_bn} onChange={(e) => setFormData({...formData, timing_bn: e.target.value})} /></div>
                <div><Label>Timing (English)</Label><Input value={formData.timing_en} onChange={(e) => setFormData({...formData, timing_en: e.target.value})} /></div>
              </div>
              <div><Label>ফোন</Label><Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
              <div><Label>ছবি</Label><ImageUpload currentImage={formData.image_url} onImageUploaded={(url) => setFormData({...formData, image_url: url})} folder="markets" /></div>
              <div className="flex items-center gap-2"><Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({...formData, is_active: checked})} /><Label>{language === 'bn' ? 'সক্রিয়' : 'Active'}</Label></div>
              <Button type="submit" className="w-full">{editingItem ? (language === 'bn' ? 'আপডেট করুন' : 'Update') : (language === 'bn' ? 'যোগ করুন' : 'Add')}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4">
        {items?.map((item) => (
          <div key={item.id} className="card-elevated p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {item.image_url && <img src={item.image_url} alt="" className="w-16 h-16 object-cover rounded-lg" />}
              <div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{categories.find(c => c.value === item.category)?.[language === 'bn' ? 'labelBn' : 'labelEn']}</span>
                <h3 className="font-bold font-bangla">{language === 'bn' ? item.name_bn : item.name_en}</h3>
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

export default ShoppingMarketsManager;
