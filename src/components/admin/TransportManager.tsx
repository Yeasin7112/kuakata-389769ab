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

interface Transport { id: string; name_bn: string; name_en: string; type: string; route_bn: string | null; route_en: string | null; fare: string | null; phone: string | null; is_active: boolean | null; }

const TransportManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transport | null>(null);
  const [formData, setFormData] = useState({ name_bn: '', name_en: '', type: '', route_bn: '', route_en: '', fare: '', phone: '', is_active: true });

  const fetch = async () => { const { data } = await supabase.from('transport').select('*').order('name_en'); setItems(data || []); setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await supabase.from('transport').update(formData).eq('id', editing.id); }
      else { await supabase.from('transport').insert([formData]); }
      toast({ title: 'Success!' });
      setIsDialogOpen(false);
      fetch();
    } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
  };

  const handleDelete = async (id: string) => { if (!confirm('Are you sure?')) return; await supabase.from('transport').delete().eq('id', id); fetch(); };

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-bangla">{language === 'bn' ? 'যাতায়াত' : 'Transport'}</h1>
        <Button onClick={() => { setEditing(null); setFormData({ name_bn: '', name_en: '', type: '', route_bn: '', route_en: '', fare: '', phone: '', is_active: true }); setIsDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />Add</Button>
      </div>
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="card-elevated p-4 flex justify-between items-center">
            <div><span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{item.type}</span><h3 className="font-semibold mt-1 font-bangla">{language === 'bn' ? item.name_bn : item.name_en}</h3><p className="text-sm text-muted-foreground">{item.fare}</p></div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(item); setFormData({name_bn: item.name_bn, name_en: item.name_en, type: item.type, route_bn: item.route_bn||'', route_en: item.route_en||'', fare: item.fare||'', phone: item.phone||'', is_active: item.is_active??true}); setIsDialogOpen(true); }} className="p-2 hover:bg-muted rounded-lg"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Transport</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4"><div><Label>Name (BN)</Label><Input value={formData.name_bn} onChange={(e) => setFormData({...formData, name_bn: e.target.value})} required /></div><div><Label>Name (EN)</Label><Input value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} required /></div></div>
            <div><Label>Type</Label><Input value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} placeholder="e.g. bus, cng, van, bike, electric bike, cycle, truck" required /></div>
            <div><Label>Fare</Label><Input value={formData.fare} onChange={(e) => setFormData({...formData, fare: e.target.value})} /></div>
            <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({...formData, is_active: c})} /></div>
            <Button type="submit" className="w-full">{editing ? 'Update' : 'Add'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransportManager;
