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

interface Banner {
  id: string;
  title_bn: string;
  title_en: string;
  subtitle_bn: string | null;
  subtitle_en: string | null;
  image_url: string | null;
  is_active: boolean | null;
  display_order: number | null;
}

const BannersManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({ title_bn: '', title_en: '', subtitle_bn: '', subtitle_en: '', image_url: '', is_active: true, display_order: 0 });

  const fetchBanners = async () => {
    const { data } = await supabase.from('banners').select('*').order('display_order');
    setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await supabase.from('banners').update(formData).eq('id', editingBanner.id);
      } else {
        await supabase.from('banners').insert([formData]);
      }
      toast({ title: 'Success!' });
      setIsDialogOpen(false);
      fetchBanners();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await supabase.from('banners').delete().eq('id', id);
    fetchBanners();
  };

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-bangla">{language === 'bn' ? 'ব্যানার' : 'Banners'}</h1>
        <Button onClick={() => { setEditingBanner(null); setFormData({ title_bn: '', title_en: '', subtitle_bn: '', subtitle_en: '', image_url: '', is_active: true, display_order: 0 }); setIsDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />Add</Button>
      </div>
      <div className="grid gap-4">
        {banners.map((banner) => (
          <div key={banner.id} className="card-elevated p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              {banner.image_url && <img src={banner.image_url} className="w-16 h-10 object-cover rounded" />}
              <div>
                <h3 className="font-semibold font-bangla">{language === 'bn' ? banner.title_bn : banner.title_en}</h3>
                <p className="text-sm text-muted-foreground">{language === 'bn' ? banner.subtitle_bn : banner.subtitle_en}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditingBanner(banner); setFormData({...banner, subtitle_bn: banner.subtitle_bn||'', subtitle_en: banner.subtitle_en||'', image_url: banner.image_url||'', is_active: banner.is_active??true, display_order: banner.display_order||0}); setIsDialogOpen(true); }} className="p-2 hover:bg-muted rounded-lg"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(banner.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editingBanner ? 'Edit' : 'Add'} Banner</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4"><div><Label>Title (BN)</Label><Input value={formData.title_bn} onChange={(e) => setFormData({...formData, title_bn: e.target.value})} required /></div><div><Label>Title (EN)</Label><Input value={formData.title_en} onChange={(e) => setFormData({...formData, title_en: e.target.value})} required /></div></div>
            <div><Label>Image URL</Label><Input value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} /></div>
            <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({...formData, is_active: c})} /></div>
            <Button type="submit" className="w-full">{editingBanner ? 'Update' : 'Add'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BannersManager;
