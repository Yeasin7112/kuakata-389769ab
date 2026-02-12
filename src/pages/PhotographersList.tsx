import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Camera, Star, Loader2, Phone, MessageCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PhotographersList: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: photographers, isLoading } = useQuery({
    queryKey: ['photographers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photographers')
        .select('*')
        .eq('is_approved', true)
        .eq('is_active', true)
        .order('rating', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-header text-white p-4 safe-area-top">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-bangla">
            {language === 'bn' ? '📸 ফটোগ্রাফার মার্কেটপ্লেস' : '📸 Photographer Marketplace'}
          </h1>
        </div>
      </div>

      <div className="p-4">
        {/* Register CTA */}
        <div className="card-elevated p-4 mb-4 bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold font-bangla text-sm">
                {language === 'bn' ? 'আপনি কি ফটোগ্রাফার?' : 'Are you a photographer?'}
              </h3>
              <p className="text-xs text-muted-foreground font-bangla">
                {language === 'bn' ? 'রেজিস্টার করুন এবং বুকিং পান' : 'Register and get bookings'}
              </p>
            </div>
            <Button size="sm" onClick={() => navigate('/photographer-register')}>
              <Camera className="w-4 h-4 mr-1" />
              {language === 'bn' ? 'রেজিস্টার' : 'Register'}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : photographers && photographers.length > 0 ? (
          <div className="space-y-4">
            {photographers.map((photographer) => (
              <div
                key={photographer.id}
                className="card-elevated overflow-hidden cursor-pointer"
                onClick={() => navigate(`/photographers/${photographer.id}`)}
              >
                <div className="flex gap-4 p-4">
                  {photographer.profile_image_url ? (
                    <img
                      src={photographer.profile_image_url}
                      alt={language === 'bn' ? photographer.name_bn : photographer.name_en}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center">
                      <Camera className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold font-bangla truncate">
                      {language === 'bn' ? photographer.name_bn : photographer.name_en}
                    </h3>
                    {photographer.specializations && photographer.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(photographer.specializations as string[]).slice(0, 3).map((spec, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {photographer.experience_years > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {photographer.experience_years} {language === 'bn' ? 'বছরের অভিজ্ঞতা' : 'years experience'}
                      </p>
                    )}
                    {photographer.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{Number(photographer.rating).toFixed(1)}</span>
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      {photographer.phone && (
                        <a
                          href={`tel:${photographer.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-primary/10 text-primary"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {photographer.whatsapp && (
                        <a
                          href={`https://wa.me/${photographer.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-green-500/10 text-green-600"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Camera className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="font-bangla">{language === 'bn' ? 'কোনো ফটোগ্রাফার পাওয়া যায়নি' : 'No photographers available yet'}</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default PhotographersList;
