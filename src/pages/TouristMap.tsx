// TouristMap component - Interactive GPS tourist map for Kuakata
// Using OpenStreetMap iframe as a reliable cross-platform solution
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Navigation, Loader2, MapPin, Hotel, UtensilsCrossed, Building2, Phone, AlertTriangle, Locate, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import BottomNav from '@/components/BottomNav';

// Kuakata coordinates
const KUAKATA_CENTER = { lat: 21.8167, lng: 90.1167 };

interface LocationItem {
  id: string;
  name_bn: string;
  name_en: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  address_bn?: string | null;
  address_en?: string | null;
  has_atm?: boolean | null;
  type?: string | null;
  category?: string | null;
  description_bn?: string | null;
  description_en?: string | null;
}

const TouristMap: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isLocating, setIsLocating] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LocationItem | null>(null);

  // Fetch all location data
  const { data: hotels } = useQuery({
    queryKey: ['map-hotels'],
    queryFn: async () => {
      const { data } = await supabase
        .from('hotels')
        .select('id, name_bn, name_en, latitude, longitude, phone, address_en, address_bn')
        .eq('is_active', true)
        .not('latitude', 'is', null);
      return data || [];
    }
  });

  const { data: restaurants } = useQuery({
    queryKey: ['map-restaurants'],
    queryFn: async () => {
      const { data } = await supabase
        .from('restaurants')
        .select('id, name_bn, name_en, phone, address_en, address_bn')
        .eq('is_active', true);
      return data || [];
    }
  });

  const { data: banks } = useQuery({
    queryKey: ['map-banks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('banks')
        .select('id, name_bn, name_en, latitude, longitude, phone, has_atm, address_en, address_bn')
        .eq('is_active', true)
        .not('latitude', 'is', null);
      return data || [];
    }
  });

  const { data: emergencyServices } = useQuery({
    queryKey: ['map-emergency'],
    queryFn: async () => {
      const { data } = await supabase
        .from('emergency_services')
        .select('id, name_bn, name_en, latitude, longitude, phone, type, address_en, address_bn')
        .eq('is_active', true)
        .not('latitude', 'is', null);
      return data || [];
    }
  });

  const { data: places } = useQuery({
    queryKey: ['map-places'],
    queryFn: async () => {
      const { data } = await supabase
        .from('places')
        .select('id, name_bn, name_en, latitude, longitude, category, description_en, description_bn')
        .eq('is_active', true)
        .not('latitude', 'is', null);
      return data || [];
    }
  });

  const handleLocateMe = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const openNavigation = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const openInMaps = () => {
    const lat = userLocation?.lat || KUAKATA_CENTER.lat;
    const lng = userLocation?.lng || KUAKATA_CENTER.lng;
    window.open(`https://www.google.com/maps/@${lat},${lng},15z`, '_blank');
  };

  const filterOptions = [
    { id: 'all', label: language === 'bn' ? 'সব' : 'All', icon: MapPin, color: 'bg-primary' },
    { id: 'hotel', label: language === 'bn' ? 'হোটেল' : 'Hotels', icon: Hotel, color: 'bg-blue-500' },
    { id: 'restaurant', label: language === 'bn' ? 'রেস্তোরাঁ' : 'Food', icon: UtensilsCrossed, color: 'bg-orange-500' },
    { id: 'bank', label: language === 'bn' ? 'ব্যাংক' : 'Bank', icon: Building2, color: 'bg-green-500' },
    { id: 'emergency', label: language === 'bn' ? 'জরুরি' : 'Emergency', icon: AlertTriangle, color: 'bg-red-500' }
  ];

  // Combine all items based on filter
  const getAllItems = () => {
    const items: (LocationItem & { itemType: string })[] = [];
    
    if (activeFilter === 'all' || activeFilter === 'hotel') {
      hotels?.forEach(h => items.push({ ...h, itemType: 'hotel' }));
    }
    if (activeFilter === 'all' || activeFilter === 'restaurant') {
      restaurants?.forEach(r => items.push({ ...r, itemType: 'restaurant' }));
    }
    if (activeFilter === 'all' || activeFilter === 'bank') {
      banks?.forEach(b => items.push({ ...b, itemType: 'bank' }));
    }
    if (activeFilter === 'all' || activeFilter === 'emergency') {
      emergencyServices?.forEach(e => items.push({ ...e, itemType: 'emergency' }));
    }
    if (activeFilter === 'all' || activeFilter === 'place') {
      places?.forEach(p => items.push({ ...p, itemType: 'place' }));
    }
    
    return items;
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'hotel': return '🏨';
      case 'restaurant': return '🍽️';
      case 'bank': return '🏦';
      case 'emergency': return '🚨';
      case 'place': return '📍';
      default: return '📍';
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'hotel': return 'bg-blue-100 border-blue-300';
      case 'restaurant': return 'bg-orange-100 border-orange-300';
      case 'bank': return 'bg-green-100 border-green-300';
      case 'emergency': return 'bg-red-100 border-red-300';
      case 'place': return 'bg-purple-100 border-purple-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const allItems = getAllItems();

  // Generate OpenStreetMap iframe URL
  const mapCenter = userLocation || KUAKATA_CENTER;
  const osmIframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 0.05}%2C${mapCenter.lat - 0.03}%2C${mapCenter.lng + 0.05}%2C${mapCenter.lat + 0.03}&layer=mapnik&marker=${mapCenter.lat}%2C${mapCenter.lng}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-header text-primary-foreground p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">
            {language === 'bn' ? '🗺️ ট্যুরিস্ট ম্যাপ' : '🗺️ Tourist Map'}
          </h1>
          <p className="text-xs text-white/80">
            {language === 'bn' ? 'কুয়াকাটার সব কিছু এক জায়গায়' : 'Everything in Kuakata'}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={openInMaps}
          className="gap-1"
        >
          <ExternalLink className="w-4 h-4" />
          {language === 'bn' ? 'ম্যাপস' : 'Maps'}
        </Button>
      </header>

      {/* Filter Tabs */}
      <div className="p-2 bg-card border-b overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {filterOptions.map((option) => (
            <Button
              key={option.id}
              variant={activeFilter === option.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(option.id)}
              className="gap-1"
            >
              <option.icon className="w-4 h-4" />
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Map and List Section */}
      <div className="flex-1 flex flex-col">
        {/* Map Embed */}
        <div className="relative h-48 bg-muted">
          <iframe
            src={osmIframeUrl}
            className="w-full h-full border-0"
            title="Kuakata Map"
            loading="lazy"
          />
          
          {/* Locate Me Button */}
          <Button
            onClick={handleLocateMe}
            disabled={isLocating}
            size="sm"
            className="absolute bottom-2 right-2 shadow-lg rounded-full"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Locate className="w-4 h-4" />
            )}
          </Button>

          {userLocation && (
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs shadow">
              📍 {language === 'bn' ? 'আপনার অবস্থান পাওয়া গেছে' : 'Your location found'}
            </div>
          )}
        </div>

        {/* Location List */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">
              {language === 'bn' ? 'কাছের জায়গা' : 'Nearby Places'}
              <span className="text-muted-foreground text-sm ml-2">({allItems.length})</span>
            </h2>
          </div>

          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="space-y-3 pb-24">
              {allItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{language === 'bn' ? 'কোন স্থান পাওয়া যায়নি' : 'No places found'}</p>
                </div>
              ) : (
                allItems.map((item) => (
                  <Card
                    key={`${item.itemType}-${item.id}`}
                    className={`p-3 border-2 ${getItemColor(item.itemType)} cursor-pointer hover:shadow-md transition-all`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getItemIcon(item.itemType)}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {language === 'bn' ? item.name_bn : item.name_en}
                        </h3>
                        {(item.address_bn || item.address_en) && (
                          <p className="text-xs text-muted-foreground truncate">
                            {language === 'bn' ? item.address_bn : item.address_en}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {item.phone && (
                            <a
                              href={`tel:${item.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-xs bg-green-500 text-white px-2 py-1 rounded"
                            >
                              <Phone className="w-3 h-3" />
                              {language === 'bn' ? 'কল' : 'Call'}
                            </a>
                          )}
                          {item.latitude && item.longitude && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openNavigation(Number(item.latitude), Number(item.longitude));
                              }}
                              className="flex items-center gap-1 text-xs bg-blue-500 text-white px-2 py-1 rounded"
                            >
                              <Navigation className="w-3 h-3" />
                              {language === 'bn' ? 'নেভিগেট' : 'Navigate'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default TouristMap;
