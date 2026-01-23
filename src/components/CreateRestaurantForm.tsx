import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/ImageUpload';
import { Loader2, Utensils } from 'lucide-react';

interface CreateRestaurantFormProps {
  onRestaurantCreated: () => void;
}

const CreateRestaurantForm: React.FC<CreateRestaurantFormProps> = ({ onRestaurantCreated }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name_bn: '',
    name_en: '',
    description_bn: '',
    description_en: '',
    address_bn: '',
    address_en: '',
    phone: '',
    cuisine_type: '',
    price_range: '',
    image_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('restaurants').insert([{
        ...formData,
        owner_id: user.id,
        is_active: true,
        rating: 0,
      }]);

      if (error) throw error;

      // Assign restaurant_owner role to the user
      await supabase.from('user_roles').upsert([{
        user_id: user.id,
        role: 'restaurant_owner',
      }], { onConflict: 'user_id,role' });

      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'রেস্টুরেন্ট তৈরি হয়েছে' : 'Restaurant created successfully',
      });

      // Reload the page to refresh auth context with new role
      window.location.reload();
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
    <div className="p-6 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-category-restaurant/20 flex items-center justify-center mx-auto mb-4">
          <Utensils className="w-8 h-8 text-category-restaurant" />
        </div>
        <h2 className="text-xl font-bold font-bangla">
          {language === 'bn' ? 'আপনার রেস্টুরেন্ট তৈরি করুন' : 'Create Your Restaurant'}
        </h2>
        <p className="text-sm text-muted-foreground font-bangla mt-1">
          {language === 'bn' 
            ? 'আপনার রেস্টুরেন্টের তথ্য দিয়ে শুরু করুন' 
            : 'Start by entering your restaurant details'}
        </p>
      </div>

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
              placeholder={language === 'bn' ? 'রেস্টুরেন্টের নাম' : 'Restaurant name'}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bangla">{language === 'bn' ? 'নাম (ইংরেজি)' : 'Name (English)'} *</Label>
            <Input
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              placeholder="Restaurant name"
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
            <Label className="font-bangla">{language === 'bn' ? 'কুইজিন টাইপ' : 'Cuisine Type'}</Label>
            <Input
              value={formData.cuisine_type}
              onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
              placeholder={language === 'bn' ? 'বাংলাদেশী, সীফুড...' : 'Bengali, Seafood...'}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-bangla">{language === 'bn' ? 'মূল্য পরিসীমা' : 'Price Range'}</Label>
          <Input
            value={formData.price_range}
            onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
            placeholder="৳ - ৳৳৳"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {language === 'bn' ? 'তৈরি হচ্ছে...' : 'Creating...'}
            </>
          ) : (
            language === 'bn' ? 'রেস্টুরেন্ট তৈরি করুন' : 'Create Restaurant'
          )}
        </Button>
      </form>
    </div>
  );
};

export default CreateRestaurantForm;
