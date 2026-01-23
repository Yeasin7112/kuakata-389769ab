import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/ImageUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface Hotel {
  id: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  address_bn: string | null;
  address_en: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  price_range: string | null;
  image_url: string | null;
}

interface EditHotelFormProps {
  hotel: Hotel;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const EditHotelForm: React.FC<EditHotelFormProps> = ({ hotel, isOpen, onClose, onUpdated }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name_bn: hotel.name_bn,
    name_en: hotel.name_en,
    description_bn: hotel.description_bn || '',
    description_en: hotel.description_en || '',
    address_bn: hotel.address_bn || '',
    address_en: hotel.address_en || '',
    phone: hotel.phone || '',
    email: hotel.email || '',
    website: hotel.website || '',
    price_range: hotel.price_range || '',
    image_url: hotel.image_url || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('hotels')
        .update(formData)
        .eq('id', hotel.id);

      if (error) throw error;

      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'হোটেল আপডেট হয়েছে' : 'Hotel updated successfully',
      });
      onUpdated();
      onClose();
    } catch (error: any) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bangla">
            {language === 'bn' ? 'হোটেল সম্পাদনা' : 'Edit Hotel'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload
            currentImage={formData.image_url}
            onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
            folder="hotels"
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'নাম (বাংলা)' : 'Name (Bangla)'} *</Label>
              <Input
                value={formData.name_bn}
                onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'নাম (ইংরেজি)' : 'Name (English)'} *</Label>
              <Input
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bangla">{language === 'bn' ? 'বিবরণ (বাংলা)' : 'Description (Bangla)'}</Label>
            <Textarea
              value={formData.description_bn}
              onChange={(e) => setFormData({ ...formData, description_bn: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bangla">{language === 'bn' ? 'বিবরণ (ইংরেজি)' : 'Description (English)'}</Label>
            <Textarea
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'ঠিকানা (বাংলা)' : 'Address (Bangla)'}</Label>
              <Input
                value={formData.address_bn}
                onChange={(e) => setFormData({ ...formData, address_bn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'ঠিকানা (ইংরেজি)' : 'Address (English)'}</Label>
              <Input
                value={formData.address_en}
                onChange={(e) => setFormData({ ...formData, address_en: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'ফোন' : 'Phone'}</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                type="tel"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'ইমেইল' : 'Email'}</Label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                type="email"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'ওয়েবসাইট' : 'Website'}</Label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                type="url"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'মূল্য পরিসীমা' : 'Price Range'}</Label>
              <Input
                value={formData.price_range}
                onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {language === 'bn' ? 'আপডেট হচ্ছে...' : 'Updating...'}
              </>
            ) : (
              language === 'bn' ? 'আপডেট করুন' : 'Update Hotel'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditHotelForm;