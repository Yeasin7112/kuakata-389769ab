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

interface Restaurant {
  id: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  address_bn: string | null;
  address_en: string | null;
  phone: string | null;
  cuisine_type: string | null;
  price_range: string | null;
  image_url: string | null;
}

interface EditRestaurantFormProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const EditRestaurantForm: React.FC<EditRestaurantFormProps> = ({ restaurant, isOpen, onClose, onUpdated }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name_bn: restaurant.name_bn,
    name_en: restaurant.name_en,
    description_bn: restaurant.description_bn || '',
    description_en: restaurant.description_en || '',
    address_bn: restaurant.address_bn || '',
    address_en: restaurant.address_en || '',
    phone: restaurant.phone || '',
    cuisine_type: restaurant.cuisine_type || '',
    price_range: restaurant.price_range || '',
    image_url: restaurant.image_url || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('restaurants')
        .update(formData)
        .eq('id', restaurant.id);

      if (error) throw error;

      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'রেস্টুরেন্ট আপডেট হয়েছে' : 'Restaurant updated successfully',
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
            {language === 'bn' ? 'রেস্টুরেন্ট সম্পাদনা' : 'Edit Restaurant'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload
            currentImage={formData.image_url}
            onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
            folder="restaurants"
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
              <Label className="font-bangla">{language === 'bn' ? 'খাবারের ধরন' : 'Cuisine Type'}</Label>
              <Input
                value={formData.cuisine_type}
                onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
                placeholder="Seafood, Bengali, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bangla">{language === 'bn' ? 'মূল্য পরিসীমা' : 'Price Range'}</Label>
            <Input
              value={formData.price_range}
              onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
              placeholder="৳৳ - ৳৳৳"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {language === 'bn' ? 'আপডেট হচ্ছে...' : 'Updating...'}
              </>
            ) : (
              language === 'bn' ? 'আপডেট করুন' : 'Update Restaurant'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRestaurantForm;