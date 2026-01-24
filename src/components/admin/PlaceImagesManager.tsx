import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import ImageUpload from '@/components/ImageUpload';
import { Trash2, GripVertical, Loader2 } from 'lucide-react';

interface PlaceImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface PlaceImagesManagerProps {
  placeId: string;
}

const PlaceImagesManager: React.FC<PlaceImagesManagerProps> = ({ placeId }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [images, setImages] = useState<PlaceImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('place_images')
      .select('*')
      .eq('place_id', placeId)
      .order('display_order');

    if (!error && data) {
      setImages(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, [placeId]);

  const handleImageUploaded = async (url: string) => {
    if (!url) return;

    const newOrder = images.length > 0 ? Math.max(...images.map(i => i.display_order)) + 1 : 0;

    const { error } = await supabase.from('place_images').insert([{
      place_id: placeId,
      image_url: url,
      display_order: newOrder,
    }]);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'ছবি যোগ হয়েছে' : 'Image added' });
      fetchImages();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bn' ? 'ছবি মুছে ফেলতে চান?' : 'Delete this image?')) return;

    const { error } = await supabase.from('place_images').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      fetchImages();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">
          {language === 'bn' ? 'অতিরিক্ত ছবি' : 'Additional Images'}
        </h4>
        <span className="text-xs text-muted-foreground">
          {images.length} {language === 'bn' ? 'টি ছবি' : 'images'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {images.map((image) => (
          <div key={image.id} className="relative group aspect-square">
            <img
              src={image.image_url}
              alt=""
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              onClick={() => handleDelete(image.id)}
              className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <ImageUpload
        onImageUploaded={handleImageUploaded}
        folder="places"
      />
    </div>
  );
};

export default PlaceImagesManager;
