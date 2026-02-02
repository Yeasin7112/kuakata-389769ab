import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { ArrowLeft, Navigation, Loader2, MapPin, Hotel, UtensilsCrossed, Building2, Phone, AlertTriangle, Locate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BottomNav from '@/components/BottomNav';
import 'leaflet/dist/leaflet.css';

// Custom marker icons
const createIcon = (color: string, emoji: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 2px solid white;
    ">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

const icons = {
  hotel: createIcon('#3b82f6', '🏨'),
  restaurant: createIcon('#f97316', '🍽️'),
  bank: createIcon('#22c55e', '🏦'),
  emergency: createIcon('#ef4444', '🚨'),
  place: createIcon('#8b5cf6', '📍'),
  user: createIcon('#06b6d4', '📍')
};

// Kuakata coordinates
const KUAKATA_CENTER: [number, number] = [21.8167, 90.1167];

// Location tracker component
const LocationTracker: React.FC<{ onLocationFound: (pos: [number, number]) => void }> = ({ onLocationFound }) => {
  const map = useMap();
  
  useEffect(() => {
    map.locate({ setView: false, enableHighAccuracy: true });
    
    map.on('locationfound', (e) => {
      onLocationFound([e.latlng.lat, e.latlng.lng]);
    });
  }, [map, onLocationFound]);
  
  return null;
};

const TouristMap: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isLocating, setIsLocating] = useState(false);

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
      // Restaurants don't have lat/lng yet, we'll simulate near center
      return (data || []).map((r, i) => ({
        ...r,
        latitude: KUAKATA_CENTER[0] + (Math.random() - 0.5) * 0.02,
        longitude: KUAKATA_CENTER[1] + (Math.random() - 0.5) * 0.02
      }));
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
        setUserLocation([position.coords.latitude, position.coords.longitude]);
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

  const filterOptions = [
    { id: 'all', label: language === 'bn' ? 'সব' : 'All', icon: MapPin },
    { id: 'hotel', label: language === 'bn' ? 'হোটেল' : 'Hotels', icon: Hotel },
    { id: 'restaurant', label: language === 'bn' ? 'রেস্তোরাঁ' : 'Food', icon: UtensilsCrossed },
    { id: 'bank', label: language === 'bn' ? 'ব্যাংক' : 'Bank', icon: Building2 },
    { id: 'emergency', label: language === 'bn' ? 'জরুরি' : 'Emergency', icon: AlertTriangle }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-header text-primary-foreground p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold">
            {language === 'bn' ? '🗺️ ট্যুরিস্ট ম্যাপ' : '🗺️ Tourist Map'}
          </h1>
          <p className="text-xs text-white/80">
            {language === 'bn' ? 'কুয়াকাটার সব কিছু এক জায়গায়' : 'Everything in Kuakata'}
          </p>
        </div>
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

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={KUAKATA_CENTER}
          zoom={14}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <LocationTracker onLocationFound={setUserLocation} />

          {/* User location marker */}
          {userLocation && (
            <>
              <Circle
                center={userLocation}
                radius={100}
                pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.2 }}
              />
              <Marker position={userLocation} icon={icons.user}>
                <Popup>{language === 'bn' ? 'আপনি এখানে' : 'You are here'}</Popup>
              </Marker>
            </>
          )}

          {/* Hotels */}
          {(activeFilter === 'all' || activeFilter === 'hotel') && hotels?.map((hotel) => (
            hotel.latitude && hotel.longitude && (
              <Marker
                key={`hotel-${hotel.id}`}
                position={[Number(hotel.latitude), Number(hotel.longitude)]}
                icon={icons.hotel}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold mb-1">{language === 'bn' ? hotel.name_bn : hotel.name_en}</h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {language === 'bn' ? hotel.address_bn : hotel.address_en}
                    </p>
                    <div className="flex gap-2">
                      {hotel.phone && (
                        <a href={`tel:${hotel.phone}`} className="flex-1 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center justify-center gap-1">
                          <Phone className="w-3 h-3" /> {language === 'bn' ? 'কল' : 'Call'}
                        </a>
                      )}
                      <button
                        onClick={() => openNavigation(Number(hotel.latitude), Number(hotel.longitude))}
                        className="flex-1 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center justify-center gap-1"
                      >
                        <Navigation className="w-3 h-3" /> {language === 'bn' ? 'নেভিগেট' : 'Navigate'}
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          ))}

          {/* Restaurants */}
          {(activeFilter === 'all' || activeFilter === 'restaurant') && restaurants?.map((restaurant) => (
            <Marker
              key={`restaurant-${restaurant.id}`}
              position={[restaurant.latitude, restaurant.longitude]}
              icon={icons.restaurant}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold mb-1">{language === 'bn' ? restaurant.name_bn : restaurant.name_en}</h3>
                  <div className="flex gap-2 mt-2">
                    {restaurant.phone && (
                      <a href={`tel:${restaurant.phone}`} className="flex-1 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center justify-center gap-1">
                        <Phone className="w-3 h-3" /> {language === 'bn' ? 'কল' : 'Call'}
                      </a>
                    )}
                    <button
                      onClick={() => openNavigation(restaurant.latitude, restaurant.longitude)}
                      className="flex-1 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center justify-center gap-1"
                    >
                      <Navigation className="w-3 h-3" /> {language === 'bn' ? 'নেভিগেট' : 'Navigate'}
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Banks */}
          {(activeFilter === 'all' || activeFilter === 'bank') && banks?.map((bank) => (
            bank.latitude && bank.longitude && (
              <Marker
                key={`bank-${bank.id}`}
                position={[Number(bank.latitude), Number(bank.longitude)]}
                icon={icons.bank}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold mb-1">{language === 'bn' ? bank.name_bn : bank.name_en}</h3>
                    {bank.has_atm && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">ATM</span>}
                    <div className="flex gap-2 mt-2">
                      {bank.phone && (
                        <a href={`tel:${bank.phone}`} className="flex-1 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center justify-center gap-1">
                          <Phone className="w-3 h-3" /> {language === 'bn' ? 'কল' : 'Call'}
                        </a>
                      )}
                      <button
                        onClick={() => openNavigation(Number(bank.latitude), Number(bank.longitude))}
                        className="flex-1 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center justify-center gap-1"
                      >
                        <Navigation className="w-3 h-3" /> {language === 'bn' ? 'নেভিগেট' : 'Navigate'}
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          ))}

          {/* Emergency Services */}
          {(activeFilter === 'all' || activeFilter === 'emergency') && emergencyServices?.map((service) => (
            service.latitude && service.longitude && (
              <Marker
                key={`emergency-${service.id}`}
                position={[Number(service.latitude), Number(service.longitude)]}
                icon={icons.emergency}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold mb-1 text-red-600">{language === 'bn' ? service.name_bn : service.name_en}</h3>
                    <p className="text-xs text-gray-600 mb-2">{service.type}</p>
                    <div className="flex gap-2">
                      <a href={`tel:${service.phone}`} className="flex-1 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center justify-center gap-1">
                        <Phone className="w-3 h-3" /> {service.phone}
                      </a>
                      <button
                        onClick={() => openNavigation(Number(service.latitude), Number(service.longitude))}
                        className="flex-1 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center justify-center gap-1"
                      >
                        <Navigation className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          ))}

          {/* Tourist Places */}
          {(activeFilter === 'all' || activeFilter === 'place') && places?.map((place) => (
            place.latitude && place.longitude && (
              <Marker
                key={`place-${place.id}`}
                position={[Number(place.latitude), Number(place.longitude)]}
                icon={icons.place}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold mb-1">{language === 'bn' ? place.name_bn : place.name_en}</h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {(language === 'bn' ? place.description_bn : place.description_en)?.slice(0, 100)}...
                    </p>
                    <button
                      onClick={() => openNavigation(Number(place.latitude), Number(place.longitude))}
                      className="w-full bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center justify-center gap-1"
                    >
                      <Navigation className="w-3 h-3" /> {language === 'bn' ? 'নেভিগেট করুন' : 'Navigate'}
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>

        {/* Locate Me Button */}
        <Button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="absolute bottom-24 right-4 z-[1000] shadow-lg rounded-full w-12 h-12"
        >
          {isLocating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Locate className="w-5 h-5" />
          )}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default TouristMap;
