import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Camera, Star, Phone, MessageCircle, Loader2, Clock, MapPin } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ReviewSection from '@/components/ReviewSection';

const PhotographerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [bookingForm, setBookingForm] = useState({
    booking_date: '',
    booking_time: '',
    location: '',
    notes: '',
    guest_name: '',
    guest_phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const { data: photographer, isLoading } = useQuery({
    queryKey: ['photographer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photographers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    }
  });

  const { data: services } = useQuery({
    queryKey: ['photographer-services', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photographer_services')
        .select('*')
        .eq('photographer_id', id)
        .eq('is_active', true)
        .order('price', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const handleBook = (service: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedService(service);
    setBookingOpen(true);
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !photographer || !selectedService) return;
    setSubmitting(true);

    try {
      const commissionAmount = (Number(selectedService.price) * Number(photographer.commission_rate)) / 100;

      const { error } = await supabase.from('photographer_bookings').insert([{
        photographer_id: photographer.id,
        service_id: selectedService.id,
        user_id: user.id,
        booking_date: bookingForm.booking_date,
        booking_time: bookingForm.booking_time,
        location: bookingForm.location,
        notes: bookingForm.notes,
        guest_name: bookingForm.guest_name,
        guest_phone: bookingForm.guest_phone,
        total_price: selectedService.price,
        commission_amount: commissionAmount,
        status: 'pending',
      }]);

      if (error) throw error;

      toast({
        title: language === 'bn' ? 'বুকিং সফল!' : 'Booking Submitted!',
        description: language === 'bn' ? 'ফটোগ্রাফার আপনার অনুরোধ নিশ্চিত করবে' : 'The photographer will confirm your request',
      });
      setBookingOpen(false);
      setBookingForm({ booking_date: '', booking_time: '', location: '', notes: '', guest_name: '', guest_phone: '' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!photographer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>{language === 'bn' ? 'ফটোগ্রাফার পাওয়া যায়নি' : 'Photographer not found'}</p>
      </div>
    );
  }

  const serviceTypeLabels: Record<string, { bn: string; en: string }> = {
    couple_shoot: { bn: 'কাপল শুট', en: 'Couple Shoot' },
    drone_shot: { bn: 'ড্রোন শট', en: 'Drone Shot' },
    reels: { bn: 'রিলস/ভিডিও', en: 'Reels/Video' },
    photo_shoot: { bn: 'ফটো শুট', en: 'Photo Shoot' },
    event: { bn: 'ইভেন্ট কভারেজ', en: 'Event Coverage' },
    portrait: { bn: 'পোর্ট্রেট', en: 'Portrait' },
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-header text-white p-4 safe-area-top">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-bangla truncate">
            {language === 'bn' ? photographer.name_bn : photographer.name_en}
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <div className="card-elevated p-4">
          <div className="flex gap-4">
            {photographer.profile_image_url ? (
              <img src={photographer.profile_image_url} alt="" className="w-28 h-28 rounded-xl object-cover" />
            ) : (
              <div className="w-28 h-28 rounded-xl bg-muted flex items-center justify-center">
                <Camera className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-lg font-bold font-bangla">
                {language === 'bn' ? photographer.name_bn : photographer.name_en}
              </h2>
              {photographer.rating > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{Number(photographer.rating).toFixed(1)}</span>
                </div>
              )}
              {photographer.experience_years > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {photographer.experience_years} {language === 'bn' ? 'বছরের অভিজ্ঞতা' : 'years experience'}
                </p>
              )}
              <div className="flex gap-2 mt-3">
                {photographer.phone && (
                  <a href={`tel:${photographer.phone}`} className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Phone className="w-5 h-5" />
                  </a>
                )}
                {photographer.whatsapp && (
                  <a href={`https://wa.me/${photographer.whatsapp}`} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-green-500/10 text-green-600">
                    <MessageCircle className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {(photographer.bio_bn || photographer.bio_en) && (
            <p className="mt-4 text-sm text-muted-foreground font-bangla">
              {language === 'bn' ? photographer.bio_bn : photographer.bio_en}
            </p>
          )}

          {photographer.specializations && (photographer.specializations as string[]).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(photographer.specializations as string[]).map((spec, i) => (
                <Badge key={i} variant="secondary">{spec}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Portfolio */}
        {photographer.portfolio_images && (photographer.portfolio_images as string[]).length > 0 && (
          <div className="card-elevated p-4">
            <h3 className="font-bold font-bangla mb-3">
              {language === 'bn' ? '📷 পোর্টফোলিও' : '📷 Portfolio'}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {(photographer.portfolio_images as string[]).map((img, i) => (
                <img key={i} src={img} alt="" className="w-full aspect-square rounded-lg object-cover" />
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        {services && services.length > 0 && (
          <div className="card-elevated p-4">
            <h3 className="font-bold font-bangla mb-3">
              {language === 'bn' ? '📦 সার্ভিস প্যাকেজ' : '📦 Service Packages'}
            </h3>
            <div className="space-y-3">
              {services.map((service) => {
                const label = serviceTypeLabels[service.service_type] || { bn: service.service_type, en: service.service_type };
                return (
                  <div key={service.id} className="border border-border rounded-xl p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className="mb-1 text-[10px]">
                          {language === 'bn' ? label.bn : label.en}
                        </Badge>
                        <h4 className="font-semibold font-bangla">
                          {language === 'bn' ? service.name_bn : service.name_en}
                        </h4>
                        {(service.description_bn || service.description_en) && (
                          <p className="text-xs text-muted-foreground mt-1 font-bangla">
                            {language === 'bn' ? service.description_bn : service.description_en}
                          </p>
                        )}
                        {service.duration_minutes > 0 && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {service.duration_minutes} min
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">৳{Number(service.price).toLocaleString()}</p>
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-3" onClick={() => handleBook(service)}>
                      {language === 'bn' ? 'বুক করুন' : 'Book Now'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="card-elevated p-4">
          <ReviewSection entityType="photographer" entityId={photographer.id} />
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bangla">
              {language === 'bn' ? 'বুকিং করুন' : 'Book Session'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitBooking} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{language === 'bn' ? 'তারিখ' : 'Date'}</Label>
                <Input type="date" required value={bookingForm.booking_date}
                  onChange={e => setBookingForm({ ...bookingForm, booking_date: e.target.value })} />
              </div>
              <div>
                <Label>{language === 'bn' ? 'সময়' : 'Time'}</Label>
                <Input type="time" value={bookingForm.booking_time}
                  onChange={e => setBookingForm({ ...bookingForm, booking_time: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>{language === 'bn' ? 'নাম' : 'Your Name'}</Label>
              <Input required value={bookingForm.guest_name}
                onChange={e => setBookingForm({ ...bookingForm, guest_name: e.target.value })} />
            </div>
            <div>
              <Label>{language === 'bn' ? 'ফোন' : 'Phone'}</Label>
              <Input required value={bookingForm.guest_phone}
                onChange={e => setBookingForm({ ...bookingForm, guest_phone: e.target.value })} />
            </div>
            <div>
              <Label>{language === 'bn' ? 'লোকেশন' : 'Location'}</Label>
              <Input value={bookingForm.location}
                onChange={e => setBookingForm({ ...bookingForm, location: e.target.value })}
                placeholder={language === 'bn' ? 'শুটিং লোকেশন' : 'Shooting location'} />
            </div>
            <div>
              <Label>{language === 'bn' ? 'নোট' : 'Notes'}</Label>
              <Textarea value={bookingForm.notes}
                onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                placeholder={language === 'bn' ? 'বিশেষ কোনো নির্দেশনা...' : 'Any special instructions...'} />
            </div>
            {selectedService && (
              <div className="bg-muted p-3 rounded-lg text-sm">
                <p className="font-semibold">{language === 'bn' ? selectedService.name_bn : selectedService.name_en}</p>
                <p className="text-primary font-bold">৳{Number(selectedService.price).toLocaleString()}</p>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting
                ? (language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...')
                : (language === 'bn' ? 'বুকিং নিশ্চিত করুন' : 'Confirm Booking')
              }
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default PhotographerDetail;
