import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2, Image as ImageIcon, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface RoomImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface RoomImageUploadProps {
  roomId: string;
  onImagesUpdated?: () => void;
}

const RoomImageUpload: React.FC<RoomImageUploadProps> = ({ roomId, onImagesUpdated }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [images, setImages] = useState<RoomImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, [roomId]);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('room_images')
      .select('*')
      .eq('room_id', roomId)
      .order('display_order');

    if (data) setImages(data);
    setLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: language === 'bn' ? 'শুধুমাত্র ছবি আপলোড করুন' : 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: language === 'bn' ? 'ছবির আকার ৫MB এর বেশি হতে পারবে না' : 'Image size must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `rooms/${roomId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from('images').getPublicUrl(data.path);

      // Insert into room_images table
      const { error: insertError } = await supabase
        .from('room_images')
        .insert([{
          room_id: roomId,
          image_url: urlData.publicUrl,
          display_order: images.length,
        }]);

      if (insertError) throw insertError;

      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'ছবি আপলোড হয়েছে' : 'Image uploaded successfully',
      });

      fetchImages();
      onImagesUpdated?.();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase.from('room_images').delete().eq('id', imageId);
      if (error) throw error;

      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'ছবি মুছে ফেলা হয়েছে' : 'Image deleted',
      });

      fetchImages();
      onImagesUpdated?.();
    } catch (error: any) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium font-bangla text-sm">
          {language === 'bn' ? 'রুমের ছবি' : 'Room Images'} ({images.length})
        </h4>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-2">
        {images.map((img) => (
          <div key={img.id} className="relative aspect-square">
            <img
              src={img.image_url}
              alt="Room"
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => deleteImage(img.id)}
              className="absolute -top-1 -right-1 p-1 bg-destructive text-white rounded-full shadow-lg"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Upload Button */}
        <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Plus className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mt-1 font-bangla">
                {language === 'bn' ? 'যোগ করুন' : 'Add'}
              </span>
            </>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {images.length === 0 && (
        <p className="text-xs text-muted-foreground text-center font-bangla">
          {language === 'bn' ? 'রুমের ছবি যোগ করুন (গ্যালারি দেখাতে)' : 'Add room images for gallery view'}
        </p>
      )}
    </div>
  );
};

export default RoomImageUpload;
