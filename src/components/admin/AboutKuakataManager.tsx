import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import ImageUpload from '@/components/ImageUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2, History } from 'lucide-react';

interface AboutSection {
  id: string;
  section_key: string;
  title_bn: string;
  title_en: string;
  content_bn: string | null;
  content_en: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

const AboutKuakataManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AboutSection | null>(null);

  const [formData, setFormData] = useState({
    section_key: '',
    title_bn: '',
    title_en: '',
    content_bn: '',
    content_en: '',
    image_url: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    const { data } = await supabase
      .from('about_kuakata')
      .select('*')
      .order('display_order', { ascending: true });
    if (data) setSections(data);
    setLoading(false);
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      section_key: '',
      title_bn: '',
      title_en: '',
      content_bn: '',
      content_en: '',
      image_url: '',
      display_order: 0,
      is_active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        const { error } = await supabase
          .from('about_kuakata')
          .update(formData)
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('about_kuakata')
          .insert([formData]);
        if (error) throw error;
      }

      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'সংরক্ষিত হয়েছে' : 'Saved successfully',
      });
      setIsDialogOpen(false);
      resetForm();
      fetchSections();
    } catch (error: any) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (section: AboutSection) => {
    setEditing(section);
    setFormData({
      section_key: section.section_key,
      title_bn: section.title_bn,
      title_en: section.title_en,
      content_bn: section.content_bn || '',
      content_en: section.content_en || '',
      image_url: section.image_url || '',
      display_order: section.display_order,
      is_active: section.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bn' ? 'মুছে ফেলতে চান?' : 'Delete this section?')) return;
    
    try {
      const { error } = await supabase.from('about_kuakata').delete().eq('id', id);
      if (error) throw error;
      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'মুছে ফেলা হয়েছে' : 'Deleted successfully',
      });
      fetchSections();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-bangla flex items-center gap-2">
          <History className="w-5 h-5" />
          {language === 'bn' ? 'কুয়াকাটা সম্পর্কে' : 'About Kuakata'}
        </h2>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          {language === 'bn' ? 'নতুন যোগ করুন' : 'Add Section'}
        </Button>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.id} className="card-elevated p-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold font-bangla">
                  {language === 'bn' ? section.title_bn : section.title_en}
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  section.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                }`}>
                  {section.is_active 
                    ? (language === 'bn' ? 'সক্রিয়' : 'Active')
                    : (language === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive')
                  }
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Key: {section.section_key}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1 font-bangla">
                {language === 'bn' ? section.content_bn : section.content_en}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(section)}
                className="p-2 rounded bg-muted hover:bg-muted/80"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(section.id)}
                className="p-2 rounded bg-destructive/10 text-destructive hover:bg-destructive/20"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bangla">
              {editing 
                ? (language === 'bn' ? 'সেকশন সম্পাদনা' : 'Edit Section')
                : (language === 'bn' ? 'নতুন সেকশন' : 'New Section')
              }
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUpload
              currentImage={formData.image_url}
              onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
              folder="about"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Section Key *</Label>
                <Input
                  value={formData.section_key}
                  onChange={(e) => setFormData({ ...formData, section_key: e.target.value })}
                  placeholder="history, geography, etc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (Bangla)'} *</Label>
                <Input
                  value={formData.title_bn}
                  onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bangla">{language === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'} *</Label>
                <Input
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'বিষয়বস্তু (বাংলা)' : 'Content (Bangla)'}</Label>
              <Textarea
                value={formData.content_bn}
                onChange={(e) => setFormData({ ...formData, content_bn: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'বিষয়বস্তু (ইংরেজি)' : 'Content (English)'}</Label>
              <Textarea
                value={formData.content_en}
                onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
              />
              <Label className="font-bangla">{language === 'bn' ? 'সক্রিয়' : 'Active'}</Label>
            </div>

            <Button type="submit" className="w-full">
              {editing 
                ? (language === 'bn' ? 'আপডেট করুন' : 'Update')
                : (language === 'bn' ? 'যোগ করুন' : 'Add Section')
              }
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AboutKuakataManager;