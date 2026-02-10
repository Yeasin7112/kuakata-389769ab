import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import RoomGallery from '@/components/RoomGallery';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Star,
  Bed,
  Users,
  Loader2,
  Check,
  Calendar,
  Images,
  Ticket
} from 'lucide-react';
import SupportKuakataBanner from '@/components/SupportKuakataBanner';

interface Room {
  id: string;
  hotel_id: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  image_url: string | null;
  price_per_night: number;
  max_guests: number;
  room_type: string;
  amenities: string[] | null;
  is_available: boolean;
}

interface RoomImage {
  id: string;
  image_url: string;
}

interface Hotel {
  id: string;
  name_bn: string;
  name_en: string;
  image_url: string | null;
  rating: number | null;
}

const RoomBooking: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomImages, setRoomImages] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showCalendar, setShowCalendar] = useState<string | null>(null);

  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponId, setCouponId] = useState<string | null>(null);

  useEffect(() => {
    fetchHotelAndRooms();
  }, [hotelId]);

  const fetchHotelAndRooms = async () => {
    if (!hotelId) return;

    try {
      const [hotelRes, roomsRes] = await Promise.all([
        supabase.from('hotels').select('id, name_bn, name_en, image_url, rating').eq('id', hotelId).single(),
        supabase.from('hotel_rooms').select('*').eq('hotel_id', hotelId).eq('is_active', true).eq('is_available', true)
      ]);

      if (hotelRes.data) setHotel(hotelRes.data);
      if (roomsRes.data) {
        setRooms(roomsRes.data);
        
        // Fetch room images for all rooms
        const roomIds = roomsRes.data.map(r => r.id);
        if (roomIds.length > 0) {
          const { data: imagesData } = await supabase
            .from('room_images')
            .select('room_id, image_url')
            .in('room_id', roomIds)
            .order('display_order');
          
          if (imagesData) {
            const imagesMap: Record<string, string[]> = {};
            imagesData.forEach((img: any) => {
              if (!imagesMap[img.room_id]) imagesMap[img.room_id] = [];
              imagesMap[img.room_id].push(img.image_url);
            });
            setRoomImages(imagesMap);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoomImages = (room: Room) => {
    const galleryImages = roomImages[room.id] || [];
    if (room.image_url) {
      return [room.image_url, ...galleryImages];
    }
    return galleryImages;
  };

  const calculateTotal = () => {
    if (!selectedRoom || !checkIn || !checkOut) return 0;
    const nights = differenceInDays(checkOut, checkIn);
    const base = nights > 0 ? nights * selectedRoom.price_per_night : 0;
    return Math.max(0, base - couponDiscount);
  };

  const calculateOriginalTotal = () => {
    if (!selectedRoom || !checkIn || !checkOut) return 0;
    const nights = differenceInDays(checkOut, checkIn);
    return nights > 0 ? nights * selectedRoom.price_per_night : 0;
  };

  const applyCoupon = async () => {
    if (!couponCode || !selectedRoom) return;
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      toast({ title: language === 'bn' ? 'অবৈধ কুপন' : 'Invalid Coupon', variant: 'destructive' });
      return;
    }

    // Check hotel-specific coupon
    if (data.hotel_id && data.hotel_id !== hotelId) {
      toast({ title: language === 'bn' ? 'এই হোটেলের জন্য নয়' : 'Not valid for this hotel', variant: 'destructive' });
      return;
    }

    // Check usage limit
    if (data.usage_limit && data.used_count >= data.usage_limit) {
      toast({ title: language === 'bn' ? 'কুপন সীমা শেষ' : 'Coupon limit reached', variant: 'destructive' });
      return;
    }

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast({ title: language === 'bn' ? 'কুপন মেয়াদোত্তীর্ণ' : 'Coupon expired', variant: 'destructive' });
      return;
    }

    const originalTotal = calculateOriginalTotal();
    if (data.min_booking_amount && originalTotal < data.min_booking_amount) {
      toast({ title: language === 'bn' ? `ন্যূনতম ৳${data.min_booking_amount} প্রয়োজন` : `Min ৳${data.min_booking_amount} required`, variant: 'destructive' });
      return;
    }

    let discount = 0;
    if (data.discount_type === 'flat') {
      discount = data.discount_value;
    } else {
      discount = (originalTotal * data.discount_value) / 100;
      if (data.max_discount && discount > data.max_discount) discount = data.max_discount;
    }

    setCouponDiscount(discount);
    setCouponApplied(true);
    setCouponId(data.id);
    toast({ title: language === 'bn' ? `৳${discount} ছাড় পেয়েছেন!` : `৳${discount} discount applied!` });
  };

  const handleDateSelect = (start: Date, end: Date) => {
    setCheckIn(start);
    setCheckOut(end);
  };

  const handleBooking = async () => {
    if (!selectedRoom || !checkIn || !checkOut || !user) {
      if (!user) {
        toast({
          title: language === 'bn' ? 'লগইন করুন' : 'Please Login',
          description: language === 'bn' ? 'বুকিং করতে লগইন করুন' : 'Login to make a booking',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }
      return;
    }

    try {
      const totalPrice = calculateTotal();
      const originalPrice = calculateOriginalTotal();
      
      const { error } = await supabase.from('room_bookings').insert([{
        room_id: selectedRoom.id,
        user_id: user.id,
        check_in_date: format(checkIn, 'yyyy-MM-dd'),
        check_out_date: format(checkOut, 'yyyy-MM-dd'),
        guests,
        total_price: totalPrice,
        original_price: originalPrice,
        discount_amount: couponDiscount,
        coupon_id: couponId,
        guest_name: guestName || user.email,
        phone,
        notes,
        status: 'pending'
      }]);

      if (error) throw error;

      // Update coupon usage
      if (couponId) {
        const { data: couponData } = await supabase.from('coupons').select('used_count').eq('id', couponId).single();
        if (couponData) {
          await supabase.from('coupons').update({ used_count: (couponData.used_count || 0) + 1 }).eq('id', couponId);
        }
      }

      // Track commission
      if (hotelId) {
        const { data: hotelData } = await supabase.from('hotels').select('commission_rate').eq('id', hotelId).single();
        if (hotelData?.commission_rate && hotelData.commission_rate > 0) {
          await supabase.from('commission_earnings').insert({
            booking_id: undefined, // will be linked later if needed
            hotel_id: hotelId,
            booking_amount: totalPrice,
            commission_rate: hotelData.commission_rate,
            commission_amount: (totalPrice * hotelData.commission_rate) / 100,
          });
        }
      }

      if (error) throw error;

      setBookingSuccess(true);
      toast({
        title: language === 'bn' ? 'বুকিং সফল!' : 'Booking Successful!',
        description: language === 'bn' ? 'হোটেল মালিক আপনার বুকিং নিশ্চিত করবেন' : 'Hotel owner will confirm your booking',
      });
    } catch (error: any) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openBookingDialog = (room: Room) => {
    setSelectedRoom(room);
    setCheckIn(undefined);
    setCheckOut(undefined);
    setIsBookingOpen(true);
    setBookingSuccess(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-header text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold font-bangla">
              {hotel ? (language === 'bn' ? hotel.name_bn : hotel.name_en) : (language === 'bn' ? 'রুম বুকিং' : 'Room Booking')}
            </h1>
            {hotel?.rating && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{hotel.rating}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto px-4 py-4 w-full">
        {rooms.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <Bed className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground font-bangla">
              {language === 'bn' ? 'কোনো রুম উপলব্ধ নেই' : 'No rooms available'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {rooms.map((room) => {
              const images = getRoomImages(room);
              
              return (
                <div key={room.id} className="card-elevated overflow-hidden">
                  {/* Room Gallery */}
                  <div className="p-3 pb-0">
                    <RoomGallery images={images} roomName={room.name_en} />
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold font-bangla text-lg">
                          {language === 'bn' ? room.name_bn : room.name_en}
                        </h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {room.room_type.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">৳{room.price_per_night}</p>
                        <p className="text-xs text-muted-foreground">/night</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground font-bangla mb-3">
                      {language === 'bn' ? room.description_bn : room.description_en}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {room.max_guests} {language === 'bn' ? 'অতিথি' : 'Guests'}
                      </span>
                      {images.length > 1 && (
                        <span className="flex items-center gap-1">
                          <Images className="w-4 h-4" />
                          {images.length} {language === 'bn' ? 'ছবি' : 'Photos'}
                        </span>
                      )}
                    </div>

                    {/* Availability Calendar Toggle */}
                    <button
                      onClick={() => setShowCalendar(showCalendar === room.id ? null : room.id)}
                      className="w-full mb-3 py-2 px-3 rounded-lg border border-border text-sm font-medium flex items-center justify-center gap-2 hover:bg-muted transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      {language === 'bn' ? 'উপলব্ধতা দেখুন' : 'View Availability'}
                    </button>

                    {showCalendar === room.id && (
                      <div className="mb-3">
                        <AvailabilityCalendar roomId={room.id} />
                      </div>
                    )}

                    <Button onClick={() => openBookingDialog(room)} className="w-full">
                      {language === 'bn' ? 'এখনই বুক করুন' : 'Book Now'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {bookingSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-bold font-bangla mb-2">
                {language === 'bn' ? 'বুকিং সম্পন্ন!' : 'Booking Complete!'}
              </h3>
              <p className="text-muted-foreground font-bangla mb-4">
                {language === 'bn'
                  ? 'আপনার বুকিং অনুরোধ পাঠানো হয়েছে। হোটেল মালিক শীঘ্রই নিশ্চিত করবেন।'
                  : 'Your booking request has been sent. The hotel will confirm soon.'}
              </p>
              <SupportKuakataBanner variant="prominent" />
              <Button onClick={() => setIsBookingOpen(false)}>
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-bangla">
                  {language === 'bn' ? 'রুম বুকিং' : 'Book Room'}
                </DialogTitle>
              </DialogHeader>

              {selectedRoom && (
                <div className="space-y-4">
                  <div className="flex gap-3 p-3 bg-muted rounded-xl">
                    {selectedRoom.image_url && (
                      <img src={selectedRoom.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    )}
                    <div>
                      <h4 className="font-semibold font-bangla">
                        {language === 'bn' ? selectedRoom.name_bn : selectedRoom.name_en}
                      </h4>
                      <p className="text-sm text-primary font-bold">৳{selectedRoom.price_per_night}/night</p>
                    </div>
                  </div>

                  {/* Availability Calendar */}
                  <div>
                    <Label className="font-bangla mb-2 block">
                      {language === 'bn' ? 'তারিখ নির্বাচন করুন' : 'Select Dates'}
                    </Label>
                    <AvailabilityCalendar 
                      roomId={selectedRoom.id} 
                      onDateSelect={handleDateSelect}
                    />
                    {checkIn && checkOut && (
                      <p className="text-sm text-center mt-2 text-muted-foreground">
                        {format(checkIn, 'PP')} → {format(checkOut, 'PP')} ({differenceInDays(checkOut, checkIn)} nights)
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bangla">{language === 'bn' ? 'অতিথি সংখ্যা' : 'Number of Guests'}</Label>
                    <Input
                      type="number"
                      min={1}
                      max={selectedRoom.max_guests}
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bangla">{language === 'bn' ? 'আপনার নাম' : 'Your Name'}</Label>
                    <Input
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder={language === 'bn' ? 'পূর্ণ নাম' : 'Full name'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bangla">{language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bangla">{language === 'bn' ? 'বিশেষ অনুরোধ' : 'Special Requests'}</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>

                  {/* Coupon Code */}
                  <div className="space-y-2">
                    <Label className="font-bangla flex items-center gap-1">
                      <Ticket className="w-3.5 h-3.5" />
                      {language === 'bn' ? 'কুপন কোড' : 'Coupon Code'}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. KUA20OFF"
                        className="font-mono"
                        disabled={couponApplied}
                      />
                      <Button
                        type="button"
                        variant={couponApplied ? 'default' : 'outline'}
                        size="sm"
                        onClick={applyCoupon}
                        disabled={couponApplied || !couponCode}
                      >
                        {couponApplied ? (language === 'bn' ? '✓ প্রয়োগ হয়েছে' : '✓ Applied') : (language === 'bn' ? 'প্রয়োগ' : 'Apply')}
                      </Button>
                    </div>
                  </div>

                  {calculateOriginalTotal() > 0 && (
                    <div className="p-4 bg-primary/10 rounded-xl">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bangla">{language === 'bn' ? 'মোট রাত' : 'Total Nights'}</span>
                        <span>{differenceInDays(checkOut!, checkIn!)}</span>
                      </div>
                      {couponDiscount > 0 && (
                        <>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-bangla">{language === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</span>
                            <span>৳{calculateOriginalTotal()}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-1 text-green-600">
                            <span className="font-bangla">{language === 'bn' ? 'কুপন ছাড়' : 'Coupon Discount'}</span>
                            <span>-৳{couponDiscount}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between font-bold text-lg">
                        <span className="font-bangla">{language === 'bn' ? 'মোট মূল্য' : 'Total Price'}</span>
                        <span className="text-primary">৳{calculateTotal()}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleBooking}
                    className="w-full"
                    disabled={!checkIn || !checkOut || calculateTotal() === 0}
                  >
                    {language === 'bn' ? 'বুকিং নিশ্চিত করুন' : 'Confirm Booking'}
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default RoomBooking;
