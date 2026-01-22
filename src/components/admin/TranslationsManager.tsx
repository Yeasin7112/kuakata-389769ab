import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Translation { id: string; key: string; value_bn: string; value_en: string; category: string | null; }

const TranslationsManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Translation | null>(null);
  const [formData, setFormData] = useState({ key: '', value_bn: '', value_en: '', category: 'general' });

  const fetch = async () => { const { data } = await supabase.from('translations').select('*').order('key'); setTranslations(data || []); setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await supabase.from('translations').update(formData).eq('id', editing.id); }
      else { await supabase.from('translations').insert([formData]); }
      toast({ title: 'Success!' });
      setIsDialogOpen(false);
      setEditing(null);
      setFormData({ key: '', value_bn: '', value_en: '', category: 'general' });
      fetch();
    } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
  };

  const handleDelete = async (id: string) => { if (!confirm('Are you sure?')) return; await supabase.from('translations').delete().eq('id', id); fetch(); };

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-bangla">{language === 'bn' ? 'অনুবাদ' : 'Translations'}</h1>
        <Button onClick={() => { setEditing(null); setFormData({ key: '', value_bn: '', value_en: '', category: 'general' }); setIsDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />Add</Button>
      </div>
      <div className="grid gap-2">
        {translations.map((t) => (
          <div key={t.id} className="card-elevated p-3 flex justify-between items-center">
            <div><code className="text-xs bg-muted px-2 py-1 rounded">{t.key}</code><div className="mt-1 text-sm"><span className="text-muted-foreground">BN:</span> {t.value_bn} | <span className="text-muted-foreground">EN:</span> {t.value_en}</div></div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(t); setFormData({...t, category: t.category||'general'}); setIsDialogOpen(true); }} className="p-2 hover:bg-muted rounded-lg"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(t.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Translation</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Key</Label><Input value={formData.key} onChange={(e) => setFormData({...formData, key: e.target.value})} required /></div>
            <div><Label>Value (BN)</Label><Input value={formData.value_bn} onChange={(e) => setFormData({...formData, value_bn: e.target.value})} required /></div>
            <div><Label>Value (EN)</Label><Input value={formData.value_en} onChange={(e) => setFormData({...formData, value_en: e.target.value})} required /></div>
            <Button type="submit" className="w-full">{editing ? 'Update' : 'Add'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TranslationsManager;
