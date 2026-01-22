import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2, Flag } from 'lucide-react';
import { format } from 'date-fns';

interface BeachSafety {
  id: string;
  date: string;
  status: string | null;
  flag_color: string | null;
  notes_bn: string | null;
  notes_en: string | null;
}

const BeachSafetyManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<BeachSafety[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BeachSafety | null>(null);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'), status: 'safe', flag_color: 'green', notes_bn: '', notes_en: ''
  });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from('beach_safety').select('*').order('date', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ date: format(new Date(), 'yyyy-MM-dd'), status: 'safe', flag_color: 'green', notes_bn: '', notes_en: '' });
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await supabase.from('beach_safety').update(formData).eq('id', editing.id);
      } else {
        await supabase.from('beach_safety').insert([formData]);
      }
      toast({ title: language === 'bn' ? 'সফল!' : 'Success!' });
      setIsDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (item: BeachSafety) => {
    setEditing(item);
    setFormData({
      date: item.date, status: item.status || 'safe', flag_color: item.flag_color || 'green',
      notes_bn: item.notes_bn || '', notes_en: item.notes_en || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) return;
    await supabase.from('beach_safety').delete().eq('id', id);
    fetchItems();
  };

  const getFlagColor = (color: string | null) => {
    switch (color) {
      case 'green': return 'text-green-500';
      case 'yellow': return 'text-yellow-500';
      case 'red': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-bangla">{language === 'bn' ? 'বিচ সেফটি' : 'Beach Safety'}</h1>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />{language === 'bn' ? 'নতুন যোগ' : 'Add'}</Button>
      </div>
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="card-elevated p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Flag className={`w-5 h-5 ${getFlagColor(item.flag_color)}`} />
              <div>
                <h3 className="font-semibold">{item.date}</h3>
                <p className="text-sm text-muted-foreground capitalize">{item.status} - {item.flag_color} flag</p>
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
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Beach Safety</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Date</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required /></div>
            <div><Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="safe">Safe</SelectItem>
                  <SelectItem value="caution">Caution</SelectItem>
                  <SelectItem value="dangerous">Dangerous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Flag Color</Label>
              <Select value={formData.flag_color} onValueChange={(v) => setFormData({...formData, flag_color: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="green">🟢 Green (Safe)</SelectItem>
                  <SelectItem value="yellow">🟡 Yellow (Caution)</SelectItem>
                  <SelectItem value="red">🔴 Red (Dangerous)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Notes (BN)</Label><Textarea value={formData.notes_bn} onChange={(e) => setFormData({...formData, notes_bn: e.target.value})} /></div>
            <div><Label>Notes (EN)</Label><Textarea value={formData.notes_en} onChange={(e) => setFormData({...formData, notes_en: e.target.value})} /></div>
            <Button type="submit" className="w-full">{editing ? 'Update' : 'Add'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BeachSafetyManager;
