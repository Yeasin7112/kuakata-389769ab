import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Camera, MapPin, Loader2, X, Navigation, Info, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NearbyPlace {
  id: string;
  name_bn: string;
  name_en: string;
  description_bn?: string | null;
  description_en?: string | null;
  latitude: number;
  longitude: number;
  distance: number;
  bearing: number;
  category?: string | null;
  type: 'place' | 'hotel' | 'restaurant' | 'emergency';
}

const ARCamera: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [deviceOrientation, setDeviceOrientation] = useState<number>(0);
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);

  // Fetch places with coordinates
  const { data: places } = useQuery({
    queryKey: ['ar-places'],
    queryFn: async () => {
      const { data } = await supabase
        .from('places')
        .select('id, name_bn, name_en, description_bn, description_en, latitude, longitude, category')
        .eq('is_active', true)
        .not('latitude', 'is', null);
      return data || [];
    }
  });

  const { data: hotels } = useQuery({
    queryKey: ['ar-hotels'],
    queryFn: async () => {
      const { data } = await supabase
        .from('hotels')
        .select('id, name_bn, name_en, description_bn, description_en, latitude, longitude')
        .eq('is_active', true)
        .not('latitude', 'is', null);
      return data || [];
    }
  });

  // Calculate distance and bearing between two points
  const calculateDistanceAndBearing = useCallback((lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;

    return { distance, bearing };
  }, []);

  // Update nearby places when user location changes
  useEffect(() => {
    if (!userLocation || (!places && !hotels)) return;

    const allPlaces: NearbyPlace[] = [];

    places?.forEach(place => {
      if (place.latitude && place.longitude) {
        const { distance, bearing } = calculateDistanceAndBearing(
          userLocation.lat, userLocation.lng,
          Number(place.latitude), Number(place.longitude)
        );
        if (distance < 5000) { // Within 5km
          allPlaces.push({
            ...place,
            latitude: Number(place.latitude),
            longitude: Number(place.longitude),
            distance,
            bearing,
            type: 'place'
          });
        }
      }
    });

    hotels?.forEach(hotel => {
      if (hotel.latitude && hotel.longitude) {
        const { distance, bearing } = calculateDistanceAndBearing(
          userLocation.lat, userLocation.lng,
          Number(hotel.latitude), Number(hotel.longitude)
        );
        if (distance < 5000) {
          allPlaces.push({
            ...hotel,
            latitude: Number(hotel.latitude),
            longitude: Number(hotel.longitude),
            distance,
            bearing,
            type: 'hotel'
          });
        }
      }
    });

    // Sort by distance
    allPlaces.sort((a, b) => a.distance - b.distance);
    setNearbyPlaces(allPlaces.slice(0, 10)); // Show top 10 nearest
  }, [userLocation, places, hotels, calculateDistanceAndBearing]);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setCameraError(null);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError(language === 'bn' ? 'ক্যামেরা অ্যাক্সেস দিন' : 'Please allow camera access');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  // Get user location
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => console.error('Location error:', error),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Device orientation for compass
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setDeviceOrientation(event.alpha);
      }
    };

    // Request permission on iOS
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // Calculate if a place is in the camera's field of view
  const isInView = (bearing: number) => {
    const fov = 60; // Field of view in degrees
    const compassBearing = (360 - deviceOrientation + bearing) % 360;
    return compassBearing >= 180 - fov / 2 && compassBearing <= 180 + fov / 2;
  };

  // Get position on screen based on bearing
  const getScreenPosition = (bearing: number) => {
    const fov = 60;
    const compassBearing = (360 - deviceOrientation + bearing) % 360;
    const normalizedBearing = ((compassBearing - 180 + fov / 2) / fov) * 100;
    return Math.min(Math.max(normalizedBearing, 5), 95);
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const openNavigation = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-4 flex items-center gap-3 safe-area-top">
        <button 
          onClick={() => {
            stopCamera();
            navigate(-1);
          }} 
          className="p-2 bg-black/50 rounded-full text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-white">
          <h1 className="text-lg font-bold">
            {language === 'bn' ? '📷 AR ক্যামেরা' : '📷 AR Camera'}
          </h1>
          <p className="text-xs text-white/80">
            {language === 'bn' ? 'ক্যামেরা দিয়ে জায়গা চিনুন' : 'Point camera to discover places'}
          </p>
        </div>

        {/* Compass indicator */}
        <div className="ml-auto flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full">
          <Compass className="w-4 h-4 text-cyan-400" style={{ transform: `rotate(${-deviceOrientation}deg)` }} />
          <span className="text-white text-sm">{Math.round(deviceOrientation)}°</span>
        </div>
      </header>

      {/* Camera View */}
      <div className="flex-1 relative">
        {cameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* AR Overlays */}
            <div className="absolute inset-0 pointer-events-none">
              {nearbyPlaces.map((place) => {
                if (!isInView(place.bearing)) return null;
                const left = getScreenPosition(place.bearing);
                const opacity = Math.max(0.5, 1 - place.distance / 3000);
                const scale = Math.max(0.7, 1 - place.distance / 5000);

                return (
                  <div
                    key={`${place.type}-${place.id}`}
                    className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2"
                    style={{
                      left: `${left}%`,
                      top: `${30 + (place.distance / 100)}%`,
                      opacity,
                      transform: `translateX(-50%) scale(${scale})`
                    }}
                    onClick={() => setSelectedPlace(place)}
                  >
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg min-w-[120px] text-center">
                      <div className="text-2xl mb-1">
                        {place.type === 'hotel' ? '🏨' : place.type === 'restaurant' ? '🍽️' : '📍'}
                      </div>
                      <p className="text-xs font-bold text-gray-800 line-clamp-1">
                        {language === 'bn' ? place.name_bn : place.name_en}
                      </p>
                      <p className="text-[10px] text-gray-600">
                        {formatDistance(place.distance)}
                      </p>
                    </div>
                    {/* Arrow pointing down */}
                    <div className="w-0 h-0 mx-auto border-l-8 border-r-8 border-t-8 border-transparent border-t-white/90" />
                  </div>
                );
              })}
            </div>

            {/* Stop Camera Button */}
            <Button
              onClick={stopCamera}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
            >
              <X className="w-6 h-6" />
            </Button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-6">
            <Camera className="w-20 h-20 text-gray-600 mb-6" />
            <h2 className="text-white text-xl font-bold mb-2 text-center">
              {language === 'bn' ? 'AR ক্যামেরা মোড' : 'AR Camera Mode'}
            </h2>
            <p className="text-gray-400 text-center mb-6 max-w-xs">
              {language === 'bn' 
                ? 'ক্যামেরা দিয়ে আশেপাশের হোটেল, রেস্তোরাঁ এবং দর্শনীয় স্থান দেখুন'
                : 'Point your camera to see nearby hotels, restaurants, and tourist spots'}
            </p>
            
            {cameraError && (
              <div className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg mb-4">
                {cameraError}
              </div>
            )}

            {!userLocation && (
              <div className="flex items-center gap-2 text-yellow-400 mb-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">
                  {language === 'bn' ? 'লোকেশন খুঁজছি...' : 'Getting location...'}
                </span>
              </div>
            )}

            <Button
              onClick={startCamera}
              size="lg"
              className="gap-2"
              disabled={!userLocation}
            >
              <Camera className="w-5 h-5" />
              {language === 'bn' ? 'ক্যামেরা চালু করুন' : 'Start Camera'}
            </Button>

            {/* Nearby places list when camera is off */}
            {nearbyPlaces.length > 0 && (
              <div className="mt-8 w-full max-w-sm">
                <h3 className="text-white text-sm font-medium mb-3">
                  {language === 'bn' ? 'আপনার কাছাকাছি' : 'Near you'}
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {nearbyPlaces.slice(0, 5).map((place) => (
                    <div
                      key={`${place.type}-${place.id}`}
                      className="bg-gray-800 rounded-lg p-3 flex items-center gap-3"
                      onClick={() => setSelectedPlace(place)}
                    >
                      <span className="text-2xl">
                        {place.type === 'hotel' ? '🏨' : place.type === 'restaurant' ? '🍽️' : '📍'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {language === 'bn' ? place.name_bn : place.name_en}
                        </p>
                        <p className="text-gray-400 text-xs">{formatDistance(place.distance)}</p>
                      </div>
                      <MapPin className="w-4 h-4 text-gray-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Place Detail Modal */}
      {selectedPlace && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center"
          onClick={() => setSelectedPlace(null)}
        >
          <div 
            className="bg-card rounded-t-2xl p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <span className="text-4xl">
                {selectedPlace.type === 'hotel' ? '🏨' : selectedPlace.type === 'restaurant' ? '🍽️' : '📍'}
              </span>
              <div className="flex-1">
                <h3 className="text-xl font-bold">
                  {language === 'bn' ? selectedPlace.name_bn : selectedPlace.name_en}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {formatDistance(selectedPlace.distance)} {language === 'bn' ? 'দূরে' : 'away'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedPlace(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {(selectedPlace.description_bn || selectedPlace.description_en) && (
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'bn' ? selectedPlace.description_bn : selectedPlace.description_en}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                className="flex-1 gap-2"
                onClick={() => openNavigation(selectedPlace.latitude, selectedPlace.longitude)}
              >
                <Navigation className="w-4 h-4" />
                {language === 'bn' ? 'নেভিগেট করুন' : 'Navigate'}
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setSelectedPlace(null);
                  if (selectedPlace.type === 'hotel') {
                    navigate(`/hotels/${selectedPlace.id}`);
                  } else if (selectedPlace.type === 'place') {
                    navigate(`/places/${selectedPlace.id}`);
                  }
                }}
              >
                <Info className="w-4 h-4" />
                {language === 'bn' ? 'বিস্তারিত' : 'Details'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARCamera;
