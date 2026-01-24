import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import ReviewSection from '@/components/ReviewSection';
import PlaceImageGallery from '@/components/PlaceImageGallery';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Navigation, 
  Clock,
  Share2,
  Heart
} from 'lucide-react';

interface Place {
  id: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  image_url: string | null;
  rating: number | null;
  category: string | null;
  distance_from_beach: string | null;
  latitude: number | null;
  longitude: number | null;
}

const PlaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlace = async () => {
      if (!id) {
        setError('No place ID provided');
        setLoading(false);
        return;
      }
      
      try {
        const { data, error: fetchError } = await supabase
          .from('places')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (fetchError) {
          setError(fetchError.message);
          setLoading(false);
          return;
        }
        
        if (data) {
          setPlace(data);
        } else {
          setError('Place not found');
        }
      } catch (err) {
        setError('Failed to load place');
      } finally {
        setLoading(false);
      }
    };

    const checkSavedStatus = async () => {
      if (!user || !id) return;
      const { data } = await supabase
        .from('saved_places')
        .select('id')
        .eq('user_id', user.id)
        .eq('place_id', id)
        .maybeSingle();
      setIsSaved(!!data);
    };

    fetchPlace();
    checkSavedStatus();
  }, [id, user]);

  const toggleSaved = async () => {
    if (!user) {
      toast({
        title: language === 'bn' ? 'লগইন করুন' : 'Login Required',
        description: language === 'bn' ? 'স্থান সংরক্ষণ করতে লগইন করুন' : 'Please login to save places',
      });
      return;
    }

    setSavingStatus(true);
    try {
      if (isSaved) {
        await supabase.from('saved_places').delete().eq('user_id', user.id).eq('place_id', id!);
        setIsSaved(false);
        toast({ title: language === 'bn' ? 'সরানো হয়েছে' : 'Removed from saved' });
      } else {
        await supabase.from('saved_places').insert([{ user_id: user.id, place_id: id }]);
        setIsSaved(true);
        toast({ title: language === 'bn' ? 'সংরক্ষিত!' : 'Saved!' });
      }
    } catch (err) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setSavingStatus(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && place) {
      try {
        await navigator.share({
          title: language === 'bn' ? place.name_bn : place.name_en,
          text: language === 'bn' ? place.description_bn || '' : place.description_en || '',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  const openInMaps = () => {
    if (place?.latitude && place?.longitude) {
      window.open(`https://www.google.com/maps?q=${place.latitude},${place.longitude}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-background pb-20 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground font-bangla mb-4">
              {language === 'bn' ? 'স্থান পাওয়া যায়নি' : 'Place not found'}
            </p>
            <Button onClick={() => navigate('/places')}>
              {language === 'bn' ? 'সব স্থান দেখুন' : 'View All Places'}
            </Button>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      {/* Image Gallery */}
      <div className="relative">
        <PlaceImageGallery placeId={id!} mainImage={place.image_url} />
        
        {/* Overlay buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={toggleSaved}
              disabled={savingStatus}
              className={`p-2 rounded-full backdrop-blur-sm ${isSaved ? 'bg-red-500 text-white' : 'bg-black/30 text-white'}`}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-4 -mt-6 relative z-10 max-w-lg mx-auto w-full">
        <div className="card-elevated p-4 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold font-bangla">
                {language === 'bn' ? place.name_bn : place.name_en}
              </h1>
              {place.category && (
                <span className="text-xs text-muted-foreground capitalize">
                  {place.category.replace('_', ' ')}
                </span>
              )}
            </div>
            {place.rating && (
              <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-full">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-medium text-amber-700">{place.rating}</span>
              </div>
            )}
          </div>

          {place.distance_from_beach && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <MapPin className="w-4 h-4" />
              <span className="font-bangla">
                {language === 'bn' ? 'সমুদ্র সৈকত থেকে' : 'From beach'}: {place.distance_from_beach}
              </span>
            </div>
          )}

          <p className="text-sm text-foreground font-bangla leading-relaxed">
            {language === 'bn' ? place.description_bn : place.description_en}
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          {place.latitude && place.longitude && (
            <Button onClick={openInMaps} className="gap-2">
              <Navigation className="w-4 h-4" />
              {language === 'bn' ? 'দিকনির্দেশনা' : 'Directions'}
            </Button>
          )}
          <Button variant="outline" className="gap-2">
            <Clock className="w-4 h-4" />
            {language === 'bn' ? 'সময়সূচী' : 'Timing'}
          </Button>
        </div>

        {/* Reviews Section */}
        <ReviewSection entityType="place" entityId={id!} />
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default PlaceDetail;
