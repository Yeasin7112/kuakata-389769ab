import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, RefreshCw, Wifi } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';

interface PrayerTime { id: string; date: string; fajr: string; sunrise: string; dhuhr: string; asr: string; maghrib: string; isha: string; }

const KUAKATA_LAT = 21.8167;
const KUAKATA_LON = 90.1167;

const PrayerTimesManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PrayerTime | null>(null);
  const [formData, setFormData] = useState({ date: '', fajr: '', sunrise: '', dhuhr: '', asr: '', maghrib: '', isha: '' });

  const fetchItems = async () => { 
    const { data } = await supabase.from('prayer_times').select('*').order('date', { ascending: false }).limit(30); 
    setItems(data || []); 
    setLoading(false); 
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await supabase.from('prayer_times').update(formData).eq('id', editing.id); }
      else { await supabase.from('prayer_times').insert([formData]); }
      toast({ title: 'Success!' });
      setIsDialogOpen(false);
      fetchItems();
    } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
  };

  const handleDelete = async (id: string) => { 
    if (!confirm('Are you sure?')) return; 
    await supabase.from('prayer_times').delete().eq('id', id); 
    fetchItems(); 
  };

  const syncFromAPI = async (days: number = 7) => {
    setSyncing(true);
    try {
      const today = new Date();
      let syncedCount = 0;

      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const timestamp = Math.floor(date.getTime() / 1000);

        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${KUAKATA_LAT}&longitude=${KUAKATA_LON}&method=1`
        );
        
        if (!response.ok) continue;
        
        const data = await response.json();
        const timings = data.data.timings;
        const cleanTime = (t: string) => t.replace(/\s*\(.*\)/, '');

        const prayerData = {
          date: dateStr,
          fajr: cleanTime(timings.Fajr),
          sunrise: cleanTime(timings.Sunrise),
          dhuhr: cleanTime(timings.Dhuhr),
          asr: cleanTime(timings.Asr),
          maghrib: cleanTime(timings.Maghrib),
          isha: cleanTime(timings.Isha),
        };

        // Upsert — update if exists, insert if not
        const { data: existing } = await supabase
          .from('prayer_times')
          .select('id')
          .eq('date', dateStr)
          .maybeSingle();

        if (existing) {
          await supabase.from('prayer_times').update(prayerData).eq('id', existing.id);
        } else {
          await supabase.from('prayer_times').insert([prayerData]);
        }
        syncedCount++;
      }

      toast({ title: language === 'bn' ? 'সিঙ্ক সম্পন্ন!' : 'Sync Complete!', description: `${syncedCount} ${language === 'bn' ? 'দিনের ডেটা আপডেট হয়েছে' : 'days synced from Aladhan API'}` });
      fetchItems();
    } catch (error: any) {
      toast({ title: 'Sync Error', description: error.message, variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold font-bangla">{language === 'bn' ? 'নামাজের সময়' : 'Prayer Times'}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => syncFromAPI(7)} disabled={syncing}>
            {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wifi className="w-4 h-4 mr-2" />}
            {language === 'bn' ? '৭ দিন সিঙ্ক' : 'Sync 7 Days'}
          </Button>
          <Button variant="outline" onClick={() => syncFromAPI(30)} disabled={syncing}>
            {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {language === 'bn' ? '৩০ দিন সিঙ্ক' : 'Sync 30 Days'}
          </Button>
          <Button onClick={() => { setEditing(null); setFormData({ date: new Date().toISOString().split('T')[0], fajr: '05:00', sunrise: '06:00', dhuhr: '12:00', asr: '15:30', maghrib: '18:00', isha: '19:30' }); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />{language === 'bn' ? 'ম্যানুয়াল যোগ' : 'Manual Add'}
          </Button>
        </div>
      </div>

      <div className="bg-muted/50 border rounded-lg p-3 text-sm flex items-center gap-2">
        <Wifi className="w-4 h-4 text-primary" />
        <span className="font-bangla">
          {language === 'bn' 
            ? '📡 Aladhan API থেকে স্বয়ংক্রিয় সিঙ্ক করুন — কোনো API কী লাগবে না' 
            : '📡 Auto-sync from Aladhan API — No API key needed'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead><tr className="bg-muted"><th className="p-2 text-left">Date</th><th className="p-2">Fajr</th><th className="p-2">Sunrise</th><th className="p-2">Dhuhr</th><th className="p-2">Asr</th><th className="p-2">Maghrib</th><th className="p-2">Isha</th><th className="p-2"></th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-2">{item.date}</td><td className="p-2 text-center">{item.fajr}</td><td className="p-2 text-center">{item.sunrise}</td><td className="p-2 text-center">{item.dhuhr}</td><td className="p-2 text-center">{item.asr}</td><td className="p-2 text-center">{item.maghrib}</td><td className="p-2 text-center">{item.isha}</td>
                <td className="p-2 flex gap-1"><button onClick={() => { setEditing(item); setFormData(item); setIsDialogOpen(true); }} className="p-1 hover:bg-muted rounded"><Pencil className="w-4 h-4" /></button><button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Prayer Times</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Date</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>Fajr</Label><Input type="time" value={formData.fajr} onChange={(e) => setFormData({...formData, fajr: e.target.value})} required /></div>
              <div><Label>Sunrise</Label><Input type="time" value={formData.sunrise} onChange={(e) => setFormData({...formData, sunrise: e.target.value})} required /></div>
              <div><Label>Dhuhr</Label><Input type="time" value={formData.dhuhr} onChange={(e) => setFormData({...formData, dhuhr: e.target.value})} required /></div>
              <div><Label>Asr</Label><Input type="time" value={formData.asr} onChange={(e) => setFormData({...formData, asr: e.target.value})} required /></div>
              <div><Label>Maghrib</Label><Input type="time" value={formData.maghrib} onChange={(e) => setFormData({...formData, maghrib: e.target.value})} required /></div>
              <div><Label>Isha</Label><Input type="time" value={formData.isha} onChange={(e) => setFormData({...formData, isha: e.target.value})} required /></div>
            </div>
            <Button type="submit" className="w-full">{editing ? 'Update' : 'Add'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrayerTimesManager;
