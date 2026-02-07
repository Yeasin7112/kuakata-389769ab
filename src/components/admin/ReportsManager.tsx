import React, { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Loader2, DollarSign, CalendarCheck, Users, Hotel, 
  BedDouble, BarChart3, TrendingUp, Utensils, MapPin, Star, MessageSquare 
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

interface BookingData {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  guests: number | null;
  check_in_date: string;
  check_out_date: string;
}

const ReportsManager: React.FC = () => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'this_month' | 'last_month' | 'all'>('this_month');
  const [counts, setCounts] = useState({
    hotels: 0,
    rooms: 0,
    restaurants: 0,
    places: 0,
    users: 0,
    reviews: 0,
    complaints: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, hotelsRes, roomsRes, restaurantsRes, placesRes, reviewsRes, complaintsRes, profilesRes] = await Promise.all([
        supabase.from('room_bookings').select('id, total_price, status, created_at, guests, check_in_date, check_out_date').order('created_at', { ascending: false }),
        supabase.from('hotels').select('id', { count: 'exact', head: true }),
        supabase.from('hotel_rooms').select('id', { count: 'exact', head: true }),
        supabase.from('restaurants').select('id', { count: 'exact', head: true }),
        supabase.from('places').select('id', { count: 'exact', head: true }),
        supabase.from('reviews').select('id', { count: 'exact', head: true }),
        supabase.from('complaints').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      setBookings(bookingsRes.data || []);
      setCounts({
        hotels: hotelsRes.count || 0,
        rooms: roomsRes.count || 0,
        restaurants: restaurantsRes.count || 0,
        places: placesRes.count || 0,
        users: profilesRes.count || 0,
        reviews: reviewsRes.count || 0,
        complaints: complaintsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (selectedPeriod === 'all') return true;
      const created = parseISO(b.created_at);
      if (selectedPeriod === 'today') {
        return isWithinInterval(created, { start: startOfDay(now), end: endOfDay(now) });
      }
      if (selectedPeriod === 'this_month') {
        return isWithinInterval(created, { start: startOfMonth(now), end: endOfMonth(now) });
      }
      if (selectedPeriod === 'last_month') {
        const lastMonth = subMonths(now, 1);
        return isWithinInterval(created, { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) });
      }
      return true;
    });
  }, [bookings, selectedPeriod]);

  const stats = useMemo(() => {
    const confirmed = filteredBookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
    const pending = filteredBookings.filter(b => b.status === 'pending');
    const cancelled = filteredBookings.filter(b => b.status === 'cancelled');
    const totalRevenue = confirmed.reduce((sum, b) => sum + b.total_price, 0);
    const pendingRevenue = pending.reduce((sum, b) => sum + b.total_price, 0);
    const totalGuests = confirmed.reduce((sum, b) => sum + (b.guests || 1), 0);

    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const month = subMonths(now, i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthBookings = bookings.filter(b => {
        const created = parseISO(b.created_at);
        return isWithinInterval(created, { start: monthStart, end: monthEnd }) &&
          (b.status === 'confirmed' || b.status === 'completed');
      });
      return {
        month: format(month, 'MMM yyyy'),
        revenue: monthBookings.reduce((sum, b) => sum + b.total_price, 0),
        bookings: monthBookings.length,
      };
    }).reverse();

    return {
      totalBookings: filteredBookings.length,
      confirmedCount: confirmed.length,
      pendingCount: pending.length,
      cancelledCount: cancelled.length,
      totalRevenue,
      pendingRevenue,
      totalGuests,
      monthlyData,
    };
  }, [filteredBookings, bookings]);

  const periods = [
    { key: 'today' as const, bn: 'আজ', en: 'Today' },
    { key: 'this_month' as const, bn: 'এই মাস', en: 'This Month' },
    { key: 'last_month' as const, bn: 'গত মাস', en: 'Last Month' },
    { key: 'all' as const, bn: 'সর্বমোট', en: 'All Time' },
  ];

  const maxRevenue = Math.max(...stats.monthlyData.map(d => d.revenue), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-bangla">
          {language === 'bn' ? 'রিপোর্ট ও বিশ্লেষণ' : 'Reports & Analytics'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1 font-bangla">
          {language === 'bn' ? 'সম্পূর্ণ অ্যাপের পরিসংখ্যান ও আয়ের রিপোর্ট' : 'Complete app statistics and revenue reports'}
        </p>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {periods.map(p => (
          <button
            key={p.key}
            onClick={() => setSelectedPeriod(p.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedPeriod === p.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {language === 'bn' ? p.bn : p.en}
          </button>
        ))}
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bangla">
                  {language === 'bn' ? 'মোট আয়' : 'Total Revenue'}
                </p>
                <p className="text-2xl font-bold text-emerald-600">৳{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/20">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bangla">
                  {language === 'bn' ? 'পেন্ডিং আয়' : 'Pending Revenue'}
                </p>
                <p className="text-2xl font-bold text-amber-600">৳{stats.pendingRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <CalendarCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bangla">
                  {language === 'bn' ? 'মোট বুকিং' : 'Total Bookings'}
                </p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bangla">
                  {language === 'bn' ? 'মোট অতিথি' : 'Total Guests'}
                </p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalGuests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Hotel, label: { bn: 'হোটেল', en: 'Hotels' }, value: counts.hotels, color: 'text-blue-600' },
          { icon: BedDouble, label: { bn: 'রুম', en: 'Rooms' }, value: counts.rooms, color: 'text-indigo-600' },
          { icon: Utensils, label: { bn: 'রেস্টুরেন্ট', en: 'Restaurants' }, value: counts.restaurants, color: 'text-orange-600' },
          { icon: MapPin, label: { bn: 'দর্শনীয় স্থান', en: 'Places' }, value: counts.places, color: 'text-emerald-600' },
          { icon: Users, label: { bn: 'ব্যবহারকারী', en: 'Users' }, value: counts.users, color: 'text-purple-600' },
          { icon: Star, label: { bn: 'রিভিউ', en: 'Reviews' }, value: counts.reviews, color: 'text-amber-600' },
          { icon: MessageSquare, label: { bn: 'অভিযোগ', en: 'Complaints' }, value: counts.complaints, color: 'text-red-600' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <Card key={i} className="border shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`w-5 h-5 ${item.color}`} />
                <div>
                  <p className="text-lg font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground font-bangla">
                    {language === 'bn' ? item.label.bn : item.label.en}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Booking Status + Monthly Revenue side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Booking Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bangla">
              {language === 'bn' ? 'বুকিং স্ট্যাটাস' : 'Booking Status Breakdown'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bangla flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                {language === 'bn' ? 'নিশ্চিত' : 'Confirmed'}
              </span>
              <span className="font-semibold text-emerald-600">{stats.confirmedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bangla flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                {language === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}
              </span>
              <span className="font-semibold text-amber-600">{stats.pendingCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bangla flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                {language === 'bn' ? 'বাতিল' : 'Cancelled'}
              </span>
              <span className="font-semibold text-red-600">{stats.cancelledCount}</span>
            </div>
            {stats.totalBookings > 0 && (
              <div className="pt-2 border-t">
                <div className="flex h-4 rounded-full overflow-hidden bg-muted">
                  {stats.confirmedCount > 0 && (
                    <div className="bg-emerald-500 h-full" style={{ width: `${(stats.confirmedCount / stats.totalBookings) * 100}%` }} />
                  )}
                  {stats.pendingCount > 0 && (
                    <div className="bg-amber-500 h-full" style={{ width: `${(stats.pendingCount / stats.totalBookings) * 100}%` }} />
                  )}
                  {stats.cancelledCount > 0 && (
                    <div className="bg-red-500 h-full" style={{ width: `${(stats.cancelledCount / stats.totalBookings) * 100}%` }} />
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bangla flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              {language === 'bn' ? 'মাসিক আয়' : 'Monthly Revenue'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.monthlyData.map((month, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{month.month}</span>
                    <span className="font-medium">৳{month.revenue.toLocaleString()} ({month.bookings})</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bangla">
            {language === 'bn' ? 'সাম্প্রতিক বুকিং' : 'Recent Bookings'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground font-bangla">
                    {language === 'bn' ? 'তারিখ' : 'Date'}
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground font-bangla">
                    {language === 'bn' ? 'চেক-ইন' : 'Check-in'}
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground font-bangla">
                    {language === 'bn' ? 'চেক-আউট' : 'Check-out'}
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground font-bangla">
                    {language === 'bn' ? 'মূল্য' : 'Price'}
                  </th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground font-bangla">
                    {language === 'bn' ? 'স্ট্যাটাস' : 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.slice(0, 10).map((booking) => (
                  <tr key={booking.id} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {format(parseISO(booking.created_at), 'dd MMM')}
                    </td>
                    <td className="py-2.5 px-3">{booking.check_in_date}</td>
                    <td className="py-2.5 px-3">{booking.check_out_date}</td>
                    <td className="py-2.5 px-3 text-right font-medium">৳{booking.total_price.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-600' :
                        booking.status === 'cancelled' ? 'bg-red-500/10 text-red-600' :
                        'bg-amber-500/10 text-amber-600'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground font-bangla">
                      {language === 'bn' ? 'কোনো বুকিং নেই' : 'No bookings found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsManager;
