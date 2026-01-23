import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  folder?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageUploaded, 
  currentImage,
  folder = 'general'
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: language === 'bn' ? 'শুধুমাত্র ছবি আপলোড করুন' : 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
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
      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);

      setPreview(urlData.publicUrl);
      onImageUploaded(urlData.publicUrl);

      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'ছবি আপলোড হয়েছে' : 'Image uploaded successfully',
      });
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

  const clearImage = () => {
    setPreview(null);
    onImageUploaded('');
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full max-w-xs h-32 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -top-2 -right-2 p-1 bg-destructive text-white rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <>
                <ImageIcon className="w-8 h-8" />
                <span className="text-sm font-bangla">
                  {language === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Image'}
                </span>
              </>
            )}
          </div>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
};

export default ImageUpload;
