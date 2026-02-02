import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';

interface EntityImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface EntityImageGalleryProps {
  entityId: string;
  entityType: 'place' | 'tour_service' | 'popular_food';
  mainImage?: string | null;
}

const EntityImageGallery: React.FC<EntityImageGalleryProps> = ({ entityId, entityType, mainImage }) => {
  const [images, setImages] = useState<EntityImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
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
        const allImages: EntityImage[] = [];
        if (mainImage) {
          allImages.push({ id: 'main', image_url: mainImage, display_order: -1 });
        }
        allImages.push(...data);
        setImages(allImages);
      } else if (mainImage) {
        setImages([{ id: 'main', image_url: mainImage, display_order: 0 }]);
      }
      setLoading(false);
    };

    fetchImages();
  }, [entityId, mainImage, entityType]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="w-full h-64 bg-muted flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
        <span className="text-4xl">🏝️</span>
      </div>
    );
  }

  return (
    <>
      {/* Gallery */}
      <div className="relative w-full h-64 overflow-hidden">
        <img
          src={images[currentIndex]?.image_url}
          alt="Gallery"
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setIsFullscreen(true)}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>

            {/* Image counter */}
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 p-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentIndex ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img
                src={image.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30"
          >
            <X className="w-6 h-6" />
          </button>

          <img
            src={images[currentIndex]?.image_url}
            alt="Gallery"
            className="max-w-full max-h-full object-contain"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/20 text-white text-sm rounded-full">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default EntityImageGallery;
