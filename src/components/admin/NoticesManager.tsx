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

interface Notice {
  id: string;
  title_bn: string;
  title_en: string;
  content_bn: string | null;
  content_en: string | null;
  type: string | null;
  is_active: boolean | null;
}

const NoticesManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState({ title_bn: '', title_en: '', content_bn: '', content_en: '', type: 'info', is_active: true });

  const fetchNotices = async () => {
    const { data } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
    setNotices(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNotice) {
        await supabase.from('notices').update(formData).eq('id', editingNotice.id);
      } else {
        await supabase.from('notices').insert([formData]);
      }
      toast({ title: 'Success!' });
      setIsDialogOpen(false);
      setEditingNotice(null);
      setFormData({ title_bn: '', title_en: '', content_bn: '', content_en: '', type: 'info', is_active: true });
      fetchNotices();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await supabase.from('notices').delete().eq('id', id);
    fetchNotices();
  };

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-bangla">{language === 'bn' ? 'নোটিশ' : 'Notices'}</h1>
        <Button onClick={() => { setEditingNotice(null); setFormData({ title_bn: '', title_en: '', content_bn: '', content_en: '', type: 'info', is_active: true }); setIsDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />Add</Button>
      </div>
      <div className="grid gap-4">
        {notices.map((notice) => (
          <div key={notice.id} className={`card-elevated p-4 border-l-4 ${notice.type === 'warning' ? 'border-warning' : notice.type === 'alert' ? 'border-destructive' : 'border-primary'}`}>
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-xs px-2 py-1 rounded ${notice.type === 'warning' ? 'bg-warning/10 text-warning' : notice.type === 'alert' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>{notice.type}</span>
                <h3 className="font-semibold mt-2 font-bangla">{language === 'bn' ? notice.title_bn : notice.title_en}</h3>
                <p className="text-sm text-muted-foreground">{language === 'bn' ? notice.content_bn : notice.content_en}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingNotice(notice); setFormData({...notice, content_bn: notice.content_bn||'', content_en: notice.content_en||'', type: notice.type||'info', is_active: notice.is_active??true}); setIsDialogOpen(true); }} className="p-2 hover:bg-muted rounded-lg"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(notice.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editingNotice ? 'Edit' : 'Add'} Notice</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4"><div><Label>Title (BN)</Label><Input value={formData.title_bn} onChange={(e) => setFormData({...formData, title_bn: e.target.value})} required /></div><div><Label>Title (EN)</Label><Input value={formData.title_en} onChange={(e) => setFormData({...formData, title_en: e.target.value})} required /></div></div>
            <div><Label>Content (BN)</Label><Textarea value={formData.content_bn} onChange={(e) => setFormData({...formData, content_bn: e.target.value})} /></div>
            <div><Label>Content (EN)</Label><Textarea value={formData.content_en} onChange={(e) => setFormData({...formData, content_en: e.target.value})} /></div>
            <div><Label>Type</Label><select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full p-2 border rounded"><option value="info">Info</option><option value="warning">Warning</option><option value="alert">Alert</option></select></div>
            <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({...formData, is_active: c})} /></div>
            <Button type="submit" className="w-full">{editingNotice ? 'Update' : 'Add'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoticesManager;
