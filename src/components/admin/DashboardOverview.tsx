import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Hotel, 
  Bell, 
  Users,
  TrendingUp,
  Building2,
  Bus,
  Calendar
} from 'lucide-react';

interface Stats {
  places: number;
  hotels: number;
  notices: number;
  banks: number;
  transport: number;
  events: number;
}

const DashboardOverview: React.FC = () => {
  const { language } = useLanguage();
  const [stats, setStats] = useState<Stats>({
    places: 0,
    hotels: 0,
    notices: 0,
    banks: 0,
    transport: 0,
    events: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [places, hotels, notices, banks, transport, events] = await Promise.all([
          supabase.from('places').select('id', { count: 'exact', head: true }),
          supabase.from('hotels').select('id', { count: 'exact', head: true }),
          supabase.from('notices').select('id', { count: 'exact', head: true }),
          supabase.from('banks').select('id', { count: 'exact', head: true }),
          supabase.from('transport').select('id', { count: 'exact', head: true }),
          supabase.from('events').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          places: places.count || 0,
          hotels: hotels.count || 0,
          notices: notices.count || 0,
          banks: banks.count || 0,
          transport: transport.count || 0,
          events: events.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { 
      icon: MapPin, 
      labelBn: 'দর্শনীয় স্থান', 
      labelEn: 'Tourist Spots', 
      value: stats.places,
      color: 'bg-primary/10 text-primary',
    },
    { 
      icon: Hotel, 
      labelBn: 'হোটেল', 
      labelEn: 'Hotels', 
      value: stats.hotels,
      color: 'bg-category-hotel/10 text-category-hotel',
    },
    { 
      icon: Building2, 
      labelBn: 'ব্যাংক/এটিএম', 
      labelEn: 'Banks/ATM', 
      value: stats.banks,
      color: 'bg-category-bank/10 text-category-bank',
    },
    { 
      icon: Bus, 
      labelBn: 'যাতায়াত', 
      labelEn: 'Transport', 
      value: stats.transport,
      color: 'bg-category-transport/10 text-category-transport',
    },
    { 
      icon: Calendar, 
      labelBn: 'ইভেন্ট', 
      labelEn: 'Events', 
      value: stats.events,
      color: 'bg-category-event/10 text-category-event',
    },
    { 
      icon: Bell, 
      labelBn: 'নোটিশ', 
      labelEn: 'Notices', 
      value: stats.notices,
      color: 'bg-warning/10 text-warning',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-bangla">
          {language === 'bn' ? 'ড্যাশবোর্ড ওভারভিউ' : 'Dashboard Overview'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {language === 'bn' 
            ? 'আপনার অ্যাপের সমস্ত কন্টেন্ট পরিচালনা করুন' 
            : 'Manage all content of your app'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card-elevated p-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? '-' : card.value}
                  </p>
                  <p className="text-sm text-muted-foreground font-bangla">
                    {language === 'bn' ? card.labelBn : card.labelEn}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 font-bangla">
          {language === 'bn' ? 'দ্রুত কাজ' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-border rounded-xl hover:bg-muted transition-colors text-center">
            <MapPin className="w-6 h-6 mx-auto mb-2 text-primary" />
            <span className="text-sm font-medium font-bangla">
              {language === 'bn' ? 'স্থান যোগ করুন' : 'Add Place'}
            </span>
          </button>
          <button className="p-4 border border-border rounded-xl hover:bg-muted transition-colors text-center">
            <Hotel className="w-6 h-6 mx-auto mb-2 text-category-hotel" />
            <span className="text-sm font-medium font-bangla">
              {language === 'bn' ? 'হোটেল যোগ করুন' : 'Add Hotel'}
            </span>
          </button>
          <button className="p-4 border border-border rounded-xl hover:bg-muted transition-colors text-center">
            <Bell className="w-6 h-6 mx-auto mb-2 text-warning" />
            <span className="text-sm font-medium font-bangla">
              {language === 'bn' ? 'নোটিশ পাঠান' : 'Send Notice'}
            </span>
          </button>
          <button className="p-4 border border-border rounded-xl hover:bg-muted transition-colors text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-success" />
            <span className="text-sm font-medium font-bangla">
              {language === 'bn' ? 'রিপোর্ট দেখুন' : 'View Reports'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
