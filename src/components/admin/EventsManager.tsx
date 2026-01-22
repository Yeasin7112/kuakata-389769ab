import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Event { id: string; name_bn: string; name_en: string; description_bn: string | null; description_en: string | null; event_date: string | null; location_bn: string | null; location_en: string | null; is_active: boolean | null; }

const EventsManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [formData, setFormData] = useState({ name_bn: '', name_en: '', description_bn: '', description_en: '', event_date: '', location_bn: '', location_en: '', is_active: true });

  const fetch = async () => { const { data } = await supabase.from('events').select('*').order('event_date', { ascending: false }); setItems(data || []); setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {...formData, event_date: formData.event_date || null};
      if (editing) { await supabase.from('events').update(submitData).eq('id', editing.id); }
      else { await supabase.from('events').insert([submitData]); }
      toast({ title: 'Success!' });
      setIsDialogOpen(false);
      fetch();
    } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
  };

  const handleDelete = async (id: string) => { if (!confirm('Are you sure?')) return; await supabase.from('events').delete().eq('id', id); fetch(); };

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-bangla">{language === 'bn' ? 'ইভেন্ট' : 'Events'}</h1>
        <Button onClick={() => { setEditing(null); setFormData({ name_bn: '', name_en: '', description_bn: '', description_en: '', event_date: '', location_bn: '', location_en: '', is_active: true }); setIsDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />Add</Button>
      </div>
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="card-elevated p-4 flex justify-between items-center">
            <div><h3 className="font-semibold font-bangla">{language === 'bn' ? item.name_bn : item.name_en}</h3><p className="text-sm text-muted-foreground">{item.event_date} • {language === 'bn' ? item.location_bn : item.location_en}</p></div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(item); setFormData({name_bn: item.name_bn, name_en: item.name_en, description_bn: item.description_bn||'', description_en: item.description_en||'', event_date: item.event_date||'', location_bn: item.location_bn||'', location_en: item.location_en||'', is_active: item.is_active??true}); setIsDialogOpen(true); }} className="p-2 hover:bg-muted rounded-lg"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Event</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4"><div><Label>Name (BN)</Label><Input value={formData.name_bn} onChange={(e) => setFormData({...formData, name_bn: e.target.value})} required /></div><div><Label>Name (EN)</Label><Input value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} required /></div></div>
            <div><Label>Event Date</Label><Input type="date" value={formData.event_date} onChange={(e) => setFormData({...formData, event_date: e.target.value})} /></div>
            <div><Label>Description (BN)</Label><Textarea value={formData.description_bn} onChange={(e) => setFormData({...formData, description_bn: e.target.value})} /></div>
            <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({...formData, is_active: c})} /></div>
            <Button type="submit" className="w-full">{editing ? 'Update' : 'Add'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsManager;
