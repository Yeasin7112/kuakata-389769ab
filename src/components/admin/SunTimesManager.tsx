import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SunTime { id: string; date: string; sunrise: string; sunset: string; }

const SunTimesManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<SunTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SunTime | null>(null);
  const [formData, setFormData] = useState({ date: '', sunrise: '', sunset: '' });

  const fetch = async () => { const { data } = await supabase.from('sun_times').select('*').order('date', { ascending: false }).limit(30); setItems(data || []); setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await supabase.from('sun_times').update(formData).eq('id', editing.id); }
      else { await supabase.from('sun_times').insert([formData]); }
      toast({ title: 'Success!' });
      setIsDialogOpen(false);
      fetch();
    } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
  };

  const handleDelete = async (id: string) => { if (!confirm('Are you sure?')) return; await supabase.from('sun_times').delete().eq('id', id); fetch(); };

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-bangla">{language === 'bn' ? 'সূর্যোদয়/সূর্যাস্ত' : 'Sunrise/Sunset'}</h1>
        <Button onClick={() => { setEditing(null); setFormData({ date: new Date().toISOString().split('T')[0], sunrise: '05:42', sunset: '18:23' }); setIsDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />Add</Button>
      </div>
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="card-elevated p-4 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <span className="font-medium">{item.date}</span>
              <div className="flex items-center gap-4">
                <span className="text-amber-500">☀️ {item.sunrise}</span>
                <span className="text-orange-500">🌅 {item.sunset}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(item); setFormData(item); setIsDialogOpen(true); }} className="p-2 hover:bg-muted rounded-lg"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Sun Times</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Date</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Sunrise</Label><Input type="time" value={formData.sunrise} onChange={(e) => setFormData({...formData, sunrise: e.target.value})} required /></div>
              <div><Label>Sunset</Label><Input type="time" value={formData.sunset} onChange={(e) => setFormData({...formData, sunset: e.target.value})} required /></div>
            </div>
            <Button type="submit" className="w-full">{editing ? 'Update' : 'Add'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SunTimesManager;
