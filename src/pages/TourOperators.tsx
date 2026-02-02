import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Phone, Loader2, Ship, Bike, Anchor, User, MapPin, Star, ChevronDown, ChevronUp } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EntityImageGallery from '@/components/EntityImageGallery';
import ReviewSection from '@/components/ReviewSection';
import { Button } from '@/components/ui/button';

const TourOperators: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  const { data: tourServices, isLoading: loadingServices } = useQuery({
    queryKey: ['tour-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tour_services')
        .select('*')
        .eq('is_active', true)
        .order('service_type', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: localGuides, isLoading: loadingGuides } = useQuery({
    queryKey: ['local-guides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('local_guides')
        .select('*')
        .eq('is_active', true)
        .order('name_en', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'speed_boat': return <Ship className="w-5 h-5" />;
      case 'beach_bike': return <Bike className="w-5 h-5" />;
      case 'boat':
      case 'houseboat': return <Anchor className="w-5 h-5" />;
      default: return <Ship className="w-5 h-5" />;
    }
  };

  const getServiceLabel = (type: string) => {
    const labels: Record<string, { bn: string; en: string }> = {
      'speed_boat': { bn: 'স্পিড বোট', en: 'Speed Boat' },
      'beach_bike': { bn: 'বিচ বাইক', en: 'Beach Bike' },
      'sundarbans': { bn: 'সুন্দরবন ভ্রমণ', en: 'Sundarbans Tour' },
      'boat': { bn: 'নৌকা', en: 'Boat' },
      'houseboat': { bn: 'হাউজবোট', en: 'Houseboat' },
    };
    return labels[type] || { bn: type, en: type };
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-header text-white p-4 safe-area-top">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-bangla">
            {language === 'bn' ? '🚤 ট্যুর অপারেটর ও গাইড' : '🚤 Tour Operators & Guides'}
          </h1>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services" className="font-bangla">
              {language === 'bn' ? 'ট্যুর সার্ভিস' : 'Tour Services'}
            </TabsTrigger>
            <TabsTrigger value="guides" className="font-bangla">
              {language === 'bn' ? 'ট্যুর গাইড' : 'Tour Guides'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-4 space-y-4">
            {loadingServices ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : tourServices && tourServices.length > 0 ? (
              tourServices.map((service) => (
                <div key={service.id} className="card-elevated overflow-hidden">
                  <EntityImageGallery 
                    entityId={service.id} 
                    entityType="tour_service" 
                    mainImage={service.image_url} 
                  />
                  <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full mb-2">
                        {getServiceIcon(service.service_type)}
                        <span className="font-bangla">
                          {language === 'bn' 
                            ? getServiceLabel(service.service_type).bn 
                            : getServiceLabel(service.service_type).en}
                        </span>
                      </span>
                      <h4 className="font-bold font-bangla">
                        {language === 'bn' ? service.name_bn : service.name_en}
                      </h4>
                    </div>
                  </div>

                  {(service.description_bn || service.description_en) && (
                    <p className="text-sm text-muted-foreground mb-3 font-bangla">
                      {language === 'bn' ? service.description_bn : service.description_en}
                    </p>
                  )}

                  {(service.price_bn || service.price_en) && (
                    <p className="text-sm font-medium text-green-600 mb-2 font-bangla">
                      💰 {language === 'bn' ? service.price_bn : service.price_en}
                    </p>
                  )}

                  {service.phone && (
                    <a
                      href={`tel:${service.phone}`}
                      className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-center text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" /> {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact'}
                    </a>
                  )}

                  {/* Reviews Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedService(expandedService === service.id ? null : service.id)}
                    className="w-full mt-3 gap-2"
                  >
                    <Star className="w-4 h-4" />
                    {language === 'bn' ? 'রিভিউ দেখুন' : 'View Reviews'}
                    {expandedService === service.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>

                  {expandedService === service.id && (
                    <ReviewSection entityType="tour_service" entityId={service.id} />
                  )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Ship className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-bangla">{language === 'bn' ? 'কোনো সার্ভিস পাওয়া যায়নি' : 'No services available'}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="guides" className="mt-4 space-y-4">
            {loadingGuides ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : localGuides && localGuides.length > 0 ? (
              localGuides.map((guide) => (
                <div key={guide.id} className="card-elevated p-4">
                  <div className="flex items-start gap-4">
                    {guide.image_url ? (
                      <img 
                        src={guide.image_url} 
                        alt={language === 'bn' ? guide.name_bn : guide.name_en}
                        className="w-20 h-20 object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold font-bangla">
                          {language === 'bn' ? guide.name_bn : guide.name_en}
                        </h4>
                        {guide.is_verified && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            ✓ {language === 'bn' ? 'যাচাইকৃত' : 'Verified'}
                          </span>
                        )}
                      </div>

                      {(guide.specialization_bn || guide.specialization_en) && (
                        <p className="text-sm text-muted-foreground mb-1 font-bangla">
                          {language === 'bn' ? guide.specialization_bn : guide.specialization_en}
                        </p>
                      )}

                      {guide.price_per_day && (
                        <p className="text-sm font-medium text-green-600 mb-2">
                          💰 {guide.price_per_day}
                        </p>
                      )}

                      {guide.languages && guide.languages.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {guide.languages.map((lang: string, idx: number) => (
                            <span key={idx} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                              {lang}
                            </span>
                          ))}
                        </div>
                      )}

                      {guide.rating && guide.rating > 0 && (
                        <p className="text-sm text-yellow-600">
                          ⭐ {guide.rating.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>

                  {guide.phone && (
                    <a
                      href={`tel:${guide.phone}`}
                      className="mt-3 w-full bg-primary text-primary-foreground py-2 rounded-lg text-center text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" /> {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact'}
                    </a>
                  )}

                  {/* Reviews Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedGuide(expandedGuide === guide.id ? null : guide.id)}
                    className="w-full mt-3 gap-2"
                  >
                    <Star className="w-4 h-4" />
                    {language === 'bn' ? 'রিভিউ দেখুন' : 'View Reviews'}
                    {expandedGuide === guide.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>

                  {expandedGuide === guide.id && (
                    <ReviewSection entityType="local_guide" entityId={guide.id} />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-bangla">{language === 'bn' ? 'কোনো গাইড পাওয়া যায়নি' : 'No guides available'}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default TourOperators;
