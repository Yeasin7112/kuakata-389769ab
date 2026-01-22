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
import { Plus, Pencil, Trash2, Loader2, Waves } from 'lucide-react';
import { format } from 'date-fns';

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

const TideAlertsManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<TideAlert[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-bangla">{language === 'bn' ? 'জোয়ার-ভাটা' : 'Tide Alerts'}</h1>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />{language === 'bn' ? 'নতুন যোগ' : 'Add'}</Button>
      </div>
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="card-elevated p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Waves className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">{item.date}</h3>
                <p className="text-sm text-muted-foreground">High: {item.high_tide_time} | Low: {item.low_tide_time}</p>
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
