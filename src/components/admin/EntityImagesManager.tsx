import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';
import { Trash2, Loader2 } from 'lucide-react';

interface EntityImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface EntityImagesManagerProps {
  entityId: string;
  entityType: 'place' | 'tour_service' | 'popular_food';
  folder: string;
}

const EntityImagesManager: React.FC<EntityImagesManagerProps> = ({ entityId, entityType, folder }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [images, setImages] = useState<EntityImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    let query;
    
    switch (entityType) {
      case 'place':
        query = supabase.from('place_images').select('*').eq('place_id', entityId);
        break;
      case 'tour_service':
        query = supabase.from('tour_service_images').select('*').eq('tour_service_id', entityId);
        break;
      case 'popular_food':
        query = supabase.from('popular_food_images').select('*').eq('popular_food_id', entityId);
        break;
    }

    const { data, error } = await query.order('display_order');

    if (!error && data) {
      setImages(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, [entityId]);

  const handleImageUploaded = async (url: string) => {
    if (!url) return;

    const newOrder = images.length > 0 ? Math.max(...images.map(i => i.display_order)) + 1 : 0;
    let error;

    switch (entityType) {
      case 'place':
        ({ error } = await supabase.from('place_images').insert([{ place_id: entityId, image_url: url, display_order: newOrder }]));
        break;
      case 'tour_service':
        ({ error } = await supabase.from('tour_service_images').insert([{ tour_service_id: entityId, image_url: url, display_order: newOrder }]));
        break;
      case 'popular_food':
        ({ error } = await supabase.from('popular_food_images').insert([{ popular_food_id: entityId, image_url: url, display_order: newOrder }]));
        break;
    }

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'bn' ? 'ছবি যোগ হয়েছে' : 'Image added' });
      fetchImages();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bn' ? 'ছবি মুছে ফেলতে চান?' : 'Delete this image?')) return;

    let error;
    
    switch (entityType) {
      case 'place':
        ({ error } = await supabase.from('place_images').delete().eq('id', id));
        break;
      case 'tour_service':
        ({ error } = await supabase.from('tour_service_images').delete().eq('id', id));
        break;
      case 'popular_food':
        ({ error } = await supabase.from('popular_food_images').delete().eq('id', id));
        break;
    }
    
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
        folder={folder}
      />
    </div>
  );
};

export default EntityImagesManager;
