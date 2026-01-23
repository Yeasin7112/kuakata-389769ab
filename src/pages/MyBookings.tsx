import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Loader2, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Booking {
  id: string;
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  total_price: number;
  status: string;
  created_at: string;
  guest_name: string | null;
  phone: string | null;
  room: {
    name_bn: string;
    name_en: string;
    hotel: {
      name_bn: string;
      name_en: string;
      image_url: string | null;
    };
  } | null;
}

const MyBookings: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('room_bookings')
        .select(`
          *,
          room:hotel_rooms(
            name_bn,
            name_en,
            hotel:hotels(name_bn, name_en, image_url)
          )
        `)
        .eq('user_id', user.id)
        .order('check_in_date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertCircle className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success/10 text-success';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-warning/10 text-warning';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { bn: string; en: string }> = {
      pending: { bn: 'অপেক্ষমাণ', en: 'Pending' },
      confirmed: { bn: 'নিশ্চিত', en: 'Confirmed' },
      cancelled: { bn: 'বাতিল', en: 'Cancelled' },
      completed: { bn: 'সম্পন্ন', en: 'Completed' },
    };
    return language === 'bn' ? labels[status]?.bn || status : labels[status]?.en || status;
  };

  const isUpcoming = (checkInDate: string) => {
    return new Date(checkInDate) >= new Date();
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'upcoming') return isUpcoming(booking.check_in_date);
    if (filter === 'past') return !isUpcoming(booking.check_in_date);
    return true;
  });

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
          <h1 className="text-lg font-bold font-bangla">
            {language === 'bn' ? 'আমার বুকিং' : 'My Bookings'}
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto px-4 py-4 w-full">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {(['all', 'upcoming', 'past'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium font-bangla transition-colors ${
                filter === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {tab === 'all' && (language === 'bn' ? 'সব' : 'All')}
              {tab === 'upcoming' && (language === 'bn' ? 'আসন্ন' : 'Upcoming')}
              {tab === 'past' && (language === 'bn' ? 'পূর্ববর্তী' : 'Past')}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-semibold font-bangla mb-1">
              {language === 'bn' ? 'কোনো বুকিং নেই' : 'No Bookings'}
            </h3>
            <p className="text-sm text-muted-foreground font-bangla">
              {language === 'bn' 
                ? 'আপনার বুকিং এখানে দেখা যাবে'
                : 'Your bookings will appear here'}
            </p>
            <Button onClick={() => navigate('/hotels')} className="mt-4">
              {language === 'bn' ? 'হোটেল দেখুন' : 'Browse Hotels'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="card-elevated overflow-hidden">
                <div className="flex gap-3 p-4">
                  {/* Hotel Image */}
                  <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                    {booking.room?.hotel?.image_url ? (
                      <img 
                        src={booking.room.hotel.image_url} 
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold font-bangla truncate">
                          {booking.room?.hotel 
                            ? (language === 'bn' ? booking.room.hotel.name_bn : booking.room.hotel.name_en)
                            : 'Hotel'}
                        </h3>
                        <p className="text-sm text-muted-foreground font-bangla">
                          {booking.room 
                            ? (language === 'bn' ? booking.room.name_bn : booking.room.name_en)
                            : 'Room'}
                        </p>
                      </div>
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {booking.check_in_date}
                      </span>
                      <span>→</span>
                      <span>{booking.check_out_date}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">
                        {booking.guests} {language === 'bn' ? 'অতিথি' : 'guests'}
                      </span>
                      <span className="font-bold text-primary">৳{booking.total_price}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Time */}
                <div className="px-4 py-2 bg-muted/50 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {language === 'bn' ? 'বুক করা হয়েছে:' : 'Booked on:'} {new Date(booking.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default MyBookings;
