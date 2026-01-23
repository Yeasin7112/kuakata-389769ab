import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ReviewSection from '@/components/ReviewSection';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Star, 
  Phone,
  Globe,
  Mail,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Share2,
  Heart,
  Navigation,
  BedDouble
} from 'lucide-react';

interface Hotel {
  id: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  image_url: string | null;
  rating: number | null;
  price_range: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address_bn: string | null;
  address_en: string | null;
  amenities: string[] | null;
  latitude: number | null;
  longitude: number | null;
}

const HotelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchHotel = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data && !error) {
        setHotel(data);
      }
      setLoading(false);
    };

    fetchHotel();
  }, [id]);

  const handleCall = () => {
    if (hotel?.phone) {
      window.open(`tel:${hotel.phone}`, '_self');
    }
  };

  const openInMaps = () => {
    if (hotel?.latitude && hotel?.longitude) {
      window.open(`https://www.google.com/maps?q=${hotel.latitude},${hotel.longitude}`, '_blank');
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="w-4 h-4" />;
    if (lower.includes('parking') || lower.includes('car')) return <Car className="w-4 h-4" />;
    if (lower.includes('breakfast') || lower.includes('restaurant')) return <Coffee className="w-4 h-4" />;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="animate-pulse p-4 max-w-lg mx-auto">
          <div className="h-64 bg-muted rounded-2xl mb-4" />
          <div className="h-8 bg-muted rounded w-3/4 mb-2" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="p-8 text-center">
          <p className="text-muted-foreground font-bangla">
            {language === 'bn' ? 'হোটেল পাওয়া যায়নি' : 'Hotel not found'}
          </p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            {language === 'bn' ? 'ফিরে যান' : 'Go Back'}
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Image */}
      <div className="relative">
        {hotel.image_url ? (
          <img 
            src={hotel.image_url} 
            alt={language === 'bn' ? hotel.name_bn : hotel.name_en}
            className="w-full h-72 object-cover"
          />
        ) : (
          <div className="w-full h-72 bg-gradient-header" />
        )}
        
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2 rounded-full backdrop-blur-sm ${isSaved ? 'bg-red-500 text-white' : 'bg-black/30 text-white'}`}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
            </button>
            <button className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {hotel.price_range && (
          <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
            {hotel.price_range}
          </div>
        )}
      </div>

      {/* Content */}
      <main className="px-4 -mt-6 relative z-10 max-w-lg mx-auto">
        <div className="card-elevated p-4 mb-4">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-xl font-bold font-bangla">
              {language === 'bn' ? hotel.name_bn : hotel.name_en}
            </h1>
            {hotel.rating && (
              <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-full">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-medium text-amber-700">{hotel.rating}</span>
              </div>
            )}
          </div>

          {(hotel.address_bn || hotel.address_en) && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="font-bangla">
                {language === 'bn' ? hotel.address_bn : hotel.address_en}
              </span>
            </div>
          )}

          <p className="text-sm text-foreground font-bangla leading-relaxed mb-4">
            {language === 'bn' ? hotel.description_bn : hotel.description_en}
          </p>

          {/* Amenities */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {hotel.amenities.map((amenity, index) => (
                <span 
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-xs"
                >
                  {getAmenityIcon(amenity)}
                  {amenity}
                </span>
              ))}
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-2 pt-3 border-t border-border">
            {hotel.phone && (
              <button 
                onClick={handleCall}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Phone className="w-4 h-4" />
                {hotel.phone}
              </button>
            )}
            {hotel.email && (
              <a 
                href={`mailto:${hotel.email}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Mail className="w-4 h-4" />
                {hotel.email}
              </a>
            )}
            {hotel.website && (
              <a 
                href={hotel.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Globe className="w-4 h-4" />
                {language === 'bn' ? 'ওয়েবসাইট' : 'Website'}
              </a>
            )}
          </div>
        </div>

        {/* Book Room CTA */}
        <Button 
          onClick={() => navigate(`/hotels/${id}/book`)}
          className="w-full mb-4 gap-2"
          size="lg"
        >
          <BedDouble className="w-5 h-5" />
          {language === 'bn' ? 'রুম বুক করুন' : 'Book a Room'}
        </Button>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleCall} variant="outline" className="gap-2" disabled={!hotel.phone}>
            <Phone className="w-4 h-4" />
            {language === 'bn' ? 'কল করুন' : 'Call Now'}
          </Button>
          <Button 
            variant="outline" 
            onClick={openInMaps}
            className="gap-2"
            disabled={!hotel.latitude || !hotel.longitude}
          >
            <Navigation className="w-4 h-4" />
            {language === 'bn' ? 'দিকনির্দেশনা' : 'Directions'}
          </Button>
        </div>

        {/* Reviews Section */}
        <ReviewSection entityType="hotel" entityId={id!} />
      </main>

      <BottomNav />
    </div>
  );
};

export default HotelDetail;
