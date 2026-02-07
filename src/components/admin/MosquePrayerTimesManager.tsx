import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MosquePrayerTime {
  id: string;
  name_bn: string;
  name_en: string;
  address_bn: string | null;
  address_en: string | null;
  latitude: number | null;
  longitude: number | null;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  is_active: boolean | null;
}

const defaultForm = {
  name_bn: '', name_en: '', address_bn: '', address_en: '',
  latitude: '', longitude: '',
  fajr: '05:00', dhuhr: '12:00', asr: '15:30', maghrib: '18:00', isha: '19:30',
  is_active: true,
};

const MosquePrayerTimesManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<MosquePrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MosquePrayerTime | null>(null);
  const [formData, setFormData] = useState(defaultForm);

  const fetchItems = async () => {
    const { data } = await supabase
      .from('mosque_prayer_times')
      .select('*')
      .order('name_en');
    setItems((data as MosquePrayerTime[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name_bn: formData.name_bn,
        name_en: formData.name_en,
        address_bn: formData.address_bn || null,
        address_en: formData.address_en || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        fajr: formData.fajr,
        dhuhr: formData.dhuhr,
        asr: formData.asr,
        maghrib: formData.maghrib,
        isha: formData.isha,
        is_active: formData.is_active,
      };

      if (editing) {
        await supabase.from('mosque_prayer_times').update(payload).eq('id', editing.id);
      } else {
        await supabase.from('mosque_prayer_times').insert([payload]);
      }
      toast({ title: language === 'bn' ? 'সফল!' : 'Success!' });
      setIsDialogOpen(false);
      fetchItems();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) return;
    await supabase.from('mosque_prayer_times').delete().eq('id', id);
    fetchItems();
  };

  const openAdd = () => {
    setEditing(null);
    setFormData(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (item: MosquePrayerTime) => {
    setEditing(item);
    setFormData({
      name_bn: item.name_bn,
      name_en: item.name_en,
      address_bn: item.address_bn || '',
      address_en: item.address_en || '',
      latitude: item.latitude?.toString() || '',
      longitude: item.longitude?.toString() || '',
      fajr: item.fajr,
      dhuhr: item.dhuhr,
      asr: item.asr,
      maghrib: item.maghrib,
      isha: item.isha,
      is_active: item.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-bangla">
          {language === 'bn' ? '🕌 মসজিদের নামাজের সময়' : '🕌 Mosque Prayer Times'}
        </h1>
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />{language === 'bn' ? 'মসজিদ যোগ করুন' : 'Add Mosque'}</Button>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="card-elevated p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold font-bangla text-lg">
                    🕌 {language === 'bn' ? item.name_bn : item.name_en}
                  </h3>
                  {!item.is_active && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">{language === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive'}</span>
                  )}
                </div>
                {(item.address_bn || item.address_en) && (
                  <p className="text-sm text-muted-foreground font-bangla mt-1">
                    📍 {language === 'bn' ? item.address_bn : item.address_en}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-2 text-sm">
                  <span>🌙 {item.fajr}</span>
                  <span>☀️ {item.dhuhr}</span>
                  <span>🌤️ {item.asr}</span>
                  <span>🌇 {item.maghrib}</span>
                  <span>🌑 {item.isha}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(item)} className="p-2 hover:bg-muted rounded-lg"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground font-bangla">
            {language === 'bn' ? 'কোনো মসজিদ যোগ করা হয়নি' : 'No mosques added yet'}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bangla">
              {editing
                ? (language === 'bn' ? 'মসজিদ সম্পাদনা' : 'Edit Mosque')
                : (language === 'bn' ? 'মসজিদ যোগ করুন' : 'Add Mosque')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{language === 'bn' ? 'নাম (বাংলা)' : 'Name (BN)'}</Label><Input value={formData.name_bn} onChange={(e) => setFormData({...formData, name_bn: e.target.value})} required /></div>
              <div><Label>{language === 'bn' ? 'নাম (ইংরেজি)' : 'Name (EN)'}</Label><Input value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{language === 'bn' ? 'ঠিকানা (বাংলা)' : 'Address (BN)'}</Label><Input value={formData.address_bn} onChange={(e) => setFormData({...formData, address_bn: e.target.value})} /></div>
              <div><Label>{language === 'bn' ? 'ঠিকানা (ইংরেজি)' : 'Address (EN)'}</Label><Input value={formData.address_en} onChange={(e) => setFormData({...formData, address_en: e.target.value})} /></div>
            </div>

            <p className="text-sm font-semibold text-muted-foreground">{language === 'bn' ? '🕐 নামাজের সময়' : '🕐 Prayer Times'}</p>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>{language === 'bn' ? 'ফজর' : 'Fajr'}</Label><Input type="time" value={formData.fajr} onChange={(e) => setFormData({...formData, fajr: e.target.value})} required /></div>
              <div><Label>{language === 'bn' ? 'যোহর' : 'Dhuhr'}</Label><Input type="time" value={formData.dhuhr} onChange={(e) => setFormData({...formData, dhuhr: e.target.value})} required /></div>
              <div><Label>{language === 'bn' ? 'আসর' : 'Asr'}</Label><Input type="time" value={formData.asr} onChange={(e) => setFormData({...formData, asr: e.target.value})} required /></div>
              <div><Label>{language === 'bn' ? 'মাগরিব' : 'Maghrib'}</Label><Input type="time" value={formData.maghrib} onChange={(e) => setFormData({...formData, maghrib: e.target.value})} required /></div>
              <div><Label>{language === 'bn' ? 'ইশা' : 'Isha'}</Label><Input type="time" value={formData.isha} onChange={(e) => setFormData({...formData, isha: e.target.value})} required /></div>
            </div>

            <p className="text-sm font-semibold text-muted-foreground">{language === 'bn' ? '📍 ম্যাপ লোকেশন (ঐচ্ছিক)' : '📍 Map Location (Optional)'}</p>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Latitude</Label><Input type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: e.target.value})} placeholder="21.8167" /></div>
              <div><Label>Longitude</Label><Input type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: e.target.value})} placeholder="90.1167" /></div>
            </div>

            <div className="flex items-center justify-between">
              <Label>{language === 'bn' ? 'সক্রিয়' : 'Active'}</Label>
              <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({...formData, is_active: c})} />
            </div>
            <Button type="submit" className="w-full">{editing ? (language === 'bn' ? 'আপডেট' : 'Update') : (language === 'bn' ? 'যোগ করুন' : 'Add')}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MosquePrayerTimesManager;
