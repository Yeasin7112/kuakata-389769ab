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
import { Plus, Pencil, Trash2, Loader2, Waves, Wifi, RefreshCw } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface TideAlert {
  id: string;
  date: string;
  high_tide_time: string | null;
  high_tide_level: string | null;
  low_tide_time: string | null;
  low_tide_level: string | null;
  notes_bn: string | null;
  notes_en: string | null;
  is_active: boolean | null;
}

const KUAKATA_LAT = 21.8167;
const KUAKATA_LON = 90.1167;

const TideAlertsManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<TideAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TideAlert | null>(null);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'), high_tide_time: '', high_tide_level: '',
    low_tide_time: '', low_tide_level: '', notes_bn: '', notes_en: '', is_active: true
  });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from('tide_alerts').select('*').order('date', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ date: format(new Date(), 'yyyy-MM-dd'), high_tide_time: '', high_tide_level: '', low_tide_time: '', low_tide_level: '', notes_bn: '', notes_en: '', is_active: true });
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await supabase.from('tide_alerts').update(formData).eq('id', editing.id);
      } else {
        await supabase.from('tide_alerts').insert([formData]);
      }
      toast({ title: language === 'bn' ? 'সফল!' : 'Success!' });
      setIsDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (item: TideAlert) => {
    setEditing(item);
    setFormData({
      date: item.date, high_tide_time: item.high_tide_time || '', high_tide_level: item.high_tide_level || '',
      low_tide_time: item.low_tide_time || '', low_tide_level: item.low_tide_level || '',
      notes_bn: item.notes_bn || '', notes_en: item.notes_en || '', is_active: item.is_active ?? true
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) return;
    await supabase.from('tide_alerts').delete().eq('id', id);
    fetchItems();
  };

  const syncFromAPI = async (days: number = 7) => {
    setSyncing(true);
    try {
      const today = new Date();
      const startDate = format(today, 'yyyy-MM-dd');
      const endDate = format(addDays(today, days - 1), 'yyyy-MM-dd');

      const response = await fetch(
        `https://marine-api.open-meteo.com/v1/marine?latitude=${KUAKATA_LAT}&longitude=${KUAKATA_LON}&hourly=sea_level_height_msl&timezone=Asia/Dhaka&start_date=${startDate}&end_date=${endDate}`
      );

      if (!response.ok) throw new Error('Failed to fetch marine data');

      const data = await response.json();
      const times: string[] = data.hourly.time;
      const levels: number[] = data.hourly.sea_level_height_msl;

      // Group by date
      const dayMap: Record<string, { time: string; level: number }[]> = {};
      for (let i = 0; i < times.length; i++) {
        const dateStr = times[i].split('T')[0];
        if (!dayMap[dateStr]) dayMap[dateStr] = [];
        dayMap[dateStr].push({ time: times[i].split('T')[1]?.substring(0, 5) || '', level: levels[i] });
      }

      let syncedCount = 0;
      for (const [dateStr, hourlyData] of Object.entries(dayMap)) {
        let maxLevel = -Infinity, minLevel = Infinity;
        let highTime = '', lowTime = '';

        for (const entry of hourlyData) {
          if (entry.level > maxLevel) { maxLevel = entry.level; highTime = entry.time; }
          if (entry.level < minLevel) { minLevel = entry.level; lowTime = entry.time; }
        }

        const tideRecord = {
          date: dateStr,
          high_tide_time: highTime,
          high_tide_level: `${maxLevel.toFixed(2)}m`,
          low_tide_time: lowTime,
          low_tide_level: `${minLevel.toFixed(2)}m`,
          notes_en: 'Auto-synced from Open-Meteo Marine API',
          notes_bn: 'Open-Meteo Marine API থেকে স্বয়ংক্রিয়',
          is_active: true,
        };

        const { data: existing } = await supabase
          .from('tide_alerts')
          .select('id')
          .eq('date', dateStr)
          .maybeSingle();

        if (existing) {
          await supabase.from('tide_alerts').update(tideRecord).eq('id', existing.id);
        } else {
          await supabase.from('tide_alerts').insert([tideRecord]);
        }
        syncedCount++;
      }

      toast({ title: language === 'bn' ? 'সিঙ্ক সম্পন্ন!' : 'Sync Complete!', description: `${syncedCount} ${language === 'bn' ? 'দিনের টাইড ডেটা আপডেট' : 'days tide data synced'}` });
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
        <h1 className="text-2xl font-bold font-bangla">{language === 'bn' ? 'জোয়ার-ভাটা' : 'Tide Alerts'}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => syncFromAPI(7)} disabled={syncing}>
            {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wifi className="w-4 h-4 mr-2" />}
            {language === 'bn' ? '৭ দিন সিঙ্ক' : 'Sync 7 Days'}
          </Button>
          <Button variant="outline" onClick={() => syncFromAPI(14)} disabled={syncing}>
            {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {language === 'bn' ? '১৪ দিন সিঙ্ক' : 'Sync 14 Days'}
          </Button>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />{language === 'bn' ? 'ম্যানুয়াল' : 'Manual'}
          </Button>
        </div>
      </div>

      <div className="bg-muted/50 border rounded-lg p-3 text-sm flex items-center gap-2">
        <Wifi className="w-4 h-4 text-primary" />
        <span className="font-bangla">
          {language === 'bn' 
            ? '📡 Open-Meteo Marine API থেকে স্বয়ংক্রিয় সিঙ্ক — কোনো API কী লাগবে না' 
            : '📡 Auto-sync from Open-Meteo Marine API — No API key needed'}
        </span>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="card-elevated p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Waves className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold">{item.date}</h3>
                <p className="text-sm text-muted-foreground">
                  🌊 High: {item.high_tide_time} ({item.high_tide_level}) | 🏖️ Low: {item.low_tide_time} ({item.low_tide_level})
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(item)} className="p-2 hover:bg-muted rounded-lg"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Tide Alert</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Date</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>High Tide Time</Label><Input type="time" value={formData.high_tide_time} onChange={(e) => setFormData({...formData, high_tide_time: e.target.value})} /></div>
              <div><Label>High Tide Level</Label><Input value={formData.high_tide_level} onChange={(e) => setFormData({...formData, high_tide_level: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Low Tide Time</Label><Input type="time" value={formData.low_tide_time} onChange={(e) => setFormData({...formData, low_tide_time: e.target.value})} /></div>
              <div><Label>Low Tide Level</Label><Input value={formData.low_tide_level} onChange={(e) => setFormData({...formData, low_tide_level: e.target.value})} /></div>
            </div>
            <div><Label>Notes (BN)</Label><Textarea value={formData.notes_bn} onChange={(e) => setFormData({...formData, notes_bn: e.target.value})} /></div>
            <div><Label>Notes (EN)</Label><Textarea value={formData.notes_en} onChange={(e) => setFormData({...formData, notes_en: e.target.value})} /></div>
            <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({...formData, is_active: c})} /></div>
            <Button type="submit" className="w-full">{editing ? 'Update' : 'Add'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TideAlertsManager;
