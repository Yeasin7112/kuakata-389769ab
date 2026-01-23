import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface Booking {
  check_in_date: string;
  check_out_date: string;
  status: string;
}

interface AvailabilityCalendarProps {
  roomId: string;
  onDateSelect?: (checkIn: Date, checkOut: Date) => void;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ roomId, onDateSelect }) => {
  const { language } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  useEffect(() => {
    fetchBookings();
  }, [roomId]);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('room_bookings')
      .select('check_in_date, check_out_date, status')
      .eq('room_id', roomId)
      .in('status', ['pending', 'confirmed']);

    if (data) setBookings(data);
    setLoading(false);
  };

  const isDateBooked = (date: Date) => {
    return bookings.some((booking) => {
      const checkIn = parseISO(booking.check_in_date);
      const checkOut = parseISO(booking.check_out_date);
      return isWithinInterval(date, { start: checkIn, end: checkOut });
    });
  };

  const isDatePast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = (date: Date) => {
    if (isDateBooked(date) || isDatePast(date)) return;

    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: date, end: null });
    } else {
      if (date > selectedRange.start) {
        // Check if any date in range is booked
        const days = eachDayOfInterval({ start: selectedRange.start, end: date });
        const hasBookedDay = days.some(d => isDateBooked(d));
        
        if (!hasBookedDay) {
          setSelectedRange({ start: selectedRange.start, end: date });
          onDateSelect?.(selectedRange.start, date);
        }
      } else {
        setSelectedRange({ start: date, end: null });
      }
    }
  };

  const isInSelectedRange = (date: Date) => {
    if (!selectedRange.start) return false;
    if (!selectedRange.end) return isSameDay(date, selectedRange.start);
    return isWithinInterval(date, { start: selectedRange.start, end: selectedRange.end });
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad days to start from correct day of week
  const startDay = monthStart.getDay();
  const paddedDays = [...Array(startDay).fill(null), ...days];

  const weekDays = language === 'bn' 
    ? ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold font-bangla">
          {format(currentMonth, language === 'bn' ? 'MMMM yyyy' : 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {paddedDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const isPast = isDatePast(day);
          const isBooked = isDateBooked(day);
          const isSelected = isInSelectedRange(day);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              disabled={isPast || isBooked}
              className={`
                aspect-square flex items-center justify-center text-sm rounded-lg transition-all
                ${isPast ? 'text-muted-foreground/40 cursor-not-allowed' : ''}
                ${isBooked ? 'bg-destructive/20 text-destructive cursor-not-allowed' : ''}
                ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                ${!isPast && !isBooked && !isSelected ? 'hover:bg-muted cursor-pointer' : ''}
                ${isToday && !isSelected ? 'ring-2 ring-primary ring-inset' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary" />
          <span className="font-bangla">{language === 'bn' ? 'নির্বাচিত' : 'Selected'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-destructive/20" />
          <span className="font-bangla">{language === 'bn' ? 'বুক করা' : 'Booked'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-primary" />
          <span className="font-bangla">{language === 'bn' ? 'আজ' : 'Today'}</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
