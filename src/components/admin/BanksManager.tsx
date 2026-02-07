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

interface Bank { id: string; name_bn: string; name_en: string; branch_bn: string | null; branch_en: string | null; address_bn: string | null; address_en: string | null; phone: string | null; has_atm: boolean | null; is_active: boolean | null; map_url: string | null; }

const BanksManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Bank | null>(null);
  const [formData, setFormData] = useState({ name_bn: '', name_en: '', branch_bn: '', branch_en: '', address_bn: '', address_en: '', phone: '', has_atm: true, is_active: true, map_url: '' });

  const fetch = async () => { const { data } = await supabase.from('banks').select('*').order('name_en'); setBanks(data || []); setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await supabase.from('banks').update(formData).eq('id', editing.id); }
      else { await supabase.from('banks').insert([formData]); }
      toast({ title: 'Success!' });
      setIsDialogOpen(false);
      fetch();
    } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
  };

  const handleDelete = async (id: string) => { if (!confirm('Are you sure?')) return; await supabase.from('banks').delete().eq('id', id); fetch(); };

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-bangla">{language === 'bn' ? 'ব্যাংক/এটিএম' : 'Banks/ATM'}</h1>
        <Button onClick={() => { setEditing(null); setFormData({ name_bn: '', name_en: '', branch_bn: '', branch_en: '', address_bn: '', address_en: '', phone: '', has_atm: true, is_active: true, map_url: '' }); setIsDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />Add</Button>
      </div>
      <div className="grid gap-4">
        {banks.map((bank) => (
          <div key={bank.id} className="card-elevated p-4 flex justify-between items-center">
            <div><h3 className="font-semibold font-bangla">{language === 'bn' ? bank.name_bn : bank.name_en}</h3><p className="text-sm text-muted-foreground">{language === 'bn' ? bank.branch_bn : bank.branch_en} {bank.has_atm && <span className="ml-2 text-xs bg-success/10 text-success px-2 py-0.5 rounded">ATM</span>}</p></div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(bank); setFormData({name_bn: bank.name_bn, name_en: bank.name_en, branch_bn: bank.branch_bn||'', branch_en: bank.branch_en||'', address_bn: bank.address_bn||'', address_en: bank.address_en||'', phone: bank.phone||'', has_atm: bank.has_atm??true, is_active: bank.is_active??true, map_url: bank.map_url||''}); setIsDialogOpen(true); }} className="p-2 hover:bg-muted rounded-lg"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(bank.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Bank</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4"><div><Label>Name (BN)</Label><Input value={formData.name_bn} onChange={(e) => setFormData({...formData, name_bn: e.target.value})} required /></div><div><Label>Name (EN)</Label><Input value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} required /></div></div>
            <div className="grid grid-cols-2 gap-4"><div><Label>Branch (BN)</Label><Input value={formData.branch_bn} onChange={(e) => setFormData({...formData, branch_bn: e.target.value})} /></div><div><Label>Branch (EN)</Label><Input value={formData.branch_en} onChange={(e) => setFormData({...formData, branch_en: e.target.value})} /></div></div>
            <div><Label>Phone</Label><Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
            <div><Label>Map URL (Optional)</Label><Input value={formData.map_url} onChange={(e) => setFormData({...formData, map_url: e.target.value})} placeholder="https://maps.google.com/..." /></div>
            <div className="flex items-center justify-between"><Label>Has ATM</Label><Switch checked={formData.has_atm} onCheckedChange={(c) => setFormData({...formData, has_atm: c})} /></div>
            <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({...formData, is_active: c})} /></div>
            <Button type="submit" className="w-full">{editing ? 'Update' : 'Add'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BanksManager;
