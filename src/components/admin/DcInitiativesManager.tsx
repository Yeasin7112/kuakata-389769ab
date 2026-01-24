import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ImageUpload from '@/components/ImageUpload';
import { Plus, Edit2, Trash2, Landmark, Loader2 } from 'lucide-react';

interface DcInitiative {
  id: string;
  title_bn: string;
  title_en: string;
  description_bn: string | null;
  description_en: string | null;
  image_url: string | null;
  status: string | null;
  target_date: string | null;
  is_active: boolean | null;
}

const DcInitiativesManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<DcInitiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DcInitiative | null>(null);
  const [formData, setFormData] = useState({
    title_bn: '',
    title_en: '',
    description_bn: '',
    description_en: '',
    image_url: '',
    status: 'planned',
    target_date: '',
    is_active: true,
  });

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('dc_initiatives')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setFormData({
      title_bn: '',
      title_en: '',
      description_bn: '',
      description_en: '',
      image_url: '',
      status: 'planned',
      target_date: '',
      is_active: true,
    });
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      title_bn: formData.title_bn,
      title_en: formData.title_en,
      description_bn: formData.description_bn || null,
      description_en: formData.description_en || null,
      image_url: formData.image_url || null,
      status: formData.status,
      target_date: formData.target_date || null,
      is_active: formData.is_active,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from('dc_initiatives').update(payload).eq('id', editing.id));
    } else {
      ({ error } = await supabase.from('dc_initiatives').insert([payload]));
    }

    if (error) {
      toast({ title: language === 'bn' ? 'ত্রুটি' : 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'সফল' : 'Success' });
      fetchItems();
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const handleEdit = (item: DcInitiative) => {
    setEditing(item);
    setFormData({
      title_bn: item.title_bn,
      title_en: item.title_en,
      description_bn: item.description_bn || '',
      description_en: item.description_en || '',
      image_url: item.image_url || '',
      status: item.status || 'planned',
      target_date: item.target_date || '',
      is_active: item.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bn' ? 'মুছে ফেলতে চান?' : 'Delete this item?')) return;
    
    const { error } = await supabase.from('dc_initiatives').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      fetchItems();
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { bn: string; en: string }> = {
      planned: { bn: 'পরিকল্পিত', en: 'Planned' },
      ongoing: { bn: 'চলমান', en: 'Ongoing' },
      completed: { bn: 'সম্পন্ন', en: 'Completed' },
    };
    return language === 'bn' ? labels[status]?.bn : labels[status]?.en;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-bangla">
          {language === 'bn' ? 'ডিসি উদ্যোগ' : 'DC Initiatives'}
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {language === 'bn' ? 'যোগ করুন' : 'Add New'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-bangla">
                {editing 
                  ? (language === 'bn' ? 'সম্পাদনা' : 'Edit') 
                  : (language === 'bn' ? 'নতুন যোগ করুন' : 'Add New')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title (BN)</label>
                  <Input
                    value={formData.title_bn}
                    onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Title (EN)</label>
                  <Input
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description (BN)</label>
                <Textarea
                  value={formData.description_bn}
                  onChange={(e) => setFormData({ ...formData, description_bn: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description (EN)</label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Image</label>
                <ImageUpload
                  onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                  currentImage={formData.image_url}
                  folder="dc-initiatives"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">{language === 'bn' ? 'পরিকল্পিত' : 'Planned'}</SelectItem>
                      <SelectItem value="ongoing">{language === 'bn' ? 'চলমান' : 'Ongoing'}</SelectItem>
                      <SelectItem value="completed">{language === 'bn' ? 'সম্পন্ন' : 'Completed'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Target Date</label>
                  <Input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <label className="text-sm">{language === 'bn' ? 'সক্রিয়' : 'Active'}</label>
              </div>

              <Button type="submit" className="w-full">
                {editing ? (language === 'bn' ? 'আপডেট' : 'Update') : (language === 'bn' ? 'যোগ করুন' : 'Add')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="card-elevated p-4 flex items-center gap-4">
            {item.image_url ? (
              <img src={item.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                <Landmark className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{language === 'bn' ? item.title_bn : item.title_en}</h3>
              <p className="text-sm text-muted-foreground">{getStatusLabel(item.status || 'planned')}</p>
              {!item.is_active && (
                <span className="text-xs text-destructive">Inactive</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DcInitiativesManager;
