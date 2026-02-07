import React, { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, TrendingDown, DollarSign, CalendarCheck, Users, BedDouble, BarChart3 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths, parseISO, isWithinInterval } from 'date-fns';

interface Booking {
  id: string;
  room_id: string;
  guest_name: string | null;
  phone: string | null;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  total_price: number;
  status: string;
  created_at: string;
}

interface Room {
  id: string;
  name_en: string;
  name_bn: string;
  price_per_night: number;
  is_available: boolean;
}

interface OwnerReportsProps {
  hotelId: string;
  rooms: Room[];
  bookings: Booking[];
}

const OwnerReports: React.FC<OwnerReportsProps> = ({ hotelId, rooms, bookings }) => {
  const { language } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'this_month' | 'last_month' | 'all'>('this_month');

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
    const avgBookingValue = confirmed.length > 0 ? totalRevenue / confirmed.length : 0;

    // Room performance
    const roomStats = rooms.map(room => {
      const roomBookings = filteredBookings.filter(b => b.room_id === room.id);
      const roomConfirmed = roomBookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
      const roomRevenue = roomConfirmed.reduce((sum, b) => sum + b.total_price, 0);
      return {
        ...room,
        totalBookings: roomBookings.length,
        confirmedBookings: roomConfirmed.length,
        revenue: roomRevenue,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Monthly breakdown (last 6 months)
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
      avgBookingValue,
      roomStats,
      monthlyData,
      occupancyRate: rooms.length > 0 ? Math.round((rooms.filter(r => !r.is_available).length / rooms.length) * 100) : 0,
    };
  }, [filteredBookings, rooms, bookings]);

  const periods = [
    { key: 'today' as const, bn: 'আজ', en: 'Today' },
    { key: 'this_month' as const, bn: 'এই মাস', en: 'This Month' },
    { key: 'last_month' as const, bn: 'গত মাস', en: 'Last Month' },
    { key: 'all' as const, bn: 'সর্বমোট', en: 'All Time' },
  ];

  const maxRevenue = Math.max(...stats.monthlyData.map(d => d.revenue), 1);

  return (
    <div className="space-y-4">
      {/* Period Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {periods.map(p => (
          <button
            key={p.key}
            onClick={() => setSelectedPeriod(p.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedPeriod === p.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {language === 'bn' ? p.bn : p.en}
          </button>
        ))}
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-muted-foreground font-bangla">
                {language === 'bn' ? 'মোট আয়' : 'Total Revenue'}
              </span>
            </div>
            <p className="text-xl font-bold text-emerald-600">৳{stats.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-muted-foreground font-bangla">
                {language === 'bn' ? 'পেন্ডিং আয়' : 'Pending Revenue'}
              </span>
            </div>
            <p className="text-xl font-bold text-amber-600">৳{stats.pendingRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CalendarCheck className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-muted-foreground font-bangla">
                {language === 'bn' ? 'মোট বুকিং' : 'Total Bookings'}
              </span>
            </div>
            <p className="text-xl font-bold text-blue-600">{stats.totalBookings}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-muted-foreground font-bangla">
                {language === 'bn' ? 'মোট অতিথি' : 'Total Guests'}
              </span>
            </div>
            <p className="text-xl font-bold text-purple-600">{stats.totalGuests}</p>
          </CardContent>
        </Card>
      </div>

      {/* Booking Status Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bangla">
            {language === 'bn' ? 'বুকিং স্ট্যাটাস' : 'Booking Status'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
              <div className="flex h-3 rounded-full overflow-hidden bg-muted">
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
                <div className="h-2 rounded-full bg-muted overflow-hidden">
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

      {/* Room Performance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bangla flex items-center gap-2">
            <BedDouble className="w-4 h-4" />
            {language === 'bn' ? 'রুম পারফরম্যান্স' : 'Room Performance'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.roomStats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4 font-bangla">
              {language === 'bn' ? 'কোনো রুম নেই' : 'No rooms yet'}
            </p>
          ) : (
            stats.roomStats.map((room) => (
              <div key={room.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm font-bangla">
                    {language === 'bn' ? room.name_bn : room.name_en}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {room.confirmedBookings} {language === 'bn' ? 'বুকিং' : 'bookings'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-primary">৳{room.revenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">৳{room.price_per_night}/night</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bangla">
            {language === 'bn' ? 'অন্যান্য তথ্য' : 'Other Info'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-bangla">
              {language === 'bn' ? 'মোট রুম' : 'Total Rooms'}
            </span>
            <span className="font-semibold">{rooms.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-bangla">
              {language === 'bn' ? 'অকুপেন্সি রেট' : 'Occupancy Rate'}
            </span>
            <span className="font-semibold">{stats.occupancyRate}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-bangla">
              {language === 'bn' ? 'গড় বুকিং মূল্য' : 'Avg Booking Value'}
            </span>
            <span className="font-semibold">৳{Math.round(stats.avgBookingValue).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerReports;
