import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Hotel, 
  Bell, 
  Building2,
  Bus,
  Calendar,
  Plus,
  TrendingUp,
  Utensils,
  AlertTriangle
} from 'lucide-react';

interface Stats {
  places: number;
  hotels: number;
  notices: number;
  banks: number;
  transport: number;
  events: number;
  restaurants: number;
  warnings: number;
}

interface DashboardOverviewProps {
  onNavigate: (section: string) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    places: 0,
    hotels: 0,
    notices: 0,
    banks: 0,
    transport: 0,
    events: 0,
    restaurants: 0,
    warnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [places, hotels, notices, banks, transport, events, restaurants, warnings] = await Promise.all([
          supabase.from('places').select('id', { count: 'exact', head: true }),
          supabase.from('hotels').select('id', { count: 'exact', head: true }),
          supabase.from('notices').select('id', { count: 'exact', head: true }),
          supabase.from('banks').select('id', { count: 'exact', head: true }),
          supabase.from('transport').select('id', { count: 'exact', head: true }),
          supabase.from('events').select('id', { count: 'exact', head: true }),
          supabase.from('restaurants').select('id', { count: 'exact', head: true }),
          supabase.from('warning_zones').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          places: places.count || 0,
          hotels: hotels.count || 0,
          notices: notices.count || 0,
          banks: banks.count || 0,
          transport: transport.count || 0,
          events: events.count || 0,
          restaurants: restaurants.count || 0,
          warnings: warnings.count || 0,
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
      section: 'places'
    },
    { 
      icon: Hotel, 
      labelBn: 'হোটেল', 
      labelEn: 'Hotels', 
      value: stats.hotels,
      color: 'bg-category-hotel/10 text-category-hotel',
      section: 'hotels'
    },
    { 
      icon: Utensils, 
      labelBn: 'রেস্টুরেন্ট', 
      labelEn: 'Restaurants', 
      value: stats.restaurants,
      color: 'bg-category-restaurant/10 text-destructive',
      section: 'restaurants'
    },
    { 
      icon: Building2, 
      labelBn: 'ব্যাংক/এটিএম', 
      labelEn: 'Banks/ATM', 
      value: stats.banks,
      color: 'bg-category-bank/10 text-category-bank',
      section: 'banks'
    },
    { 
      icon: Bus, 
      labelBn: 'যাতায়াত', 
      labelEn: 'Transport', 
      value: stats.transport,
      color: 'bg-category-transport/10 text-category-transport',
      section: 'transport'
    },
    { 
      icon: Calendar, 
      labelBn: 'ইভেন্ট', 
      labelEn: 'Events', 
      value: stats.events,
      color: 'bg-category-event/10 text-category-event',
      section: 'events'
    },
    { 
      icon: Bell, 
      labelBn: 'নোটিশ', 
      labelEn: 'Notices', 
      value: stats.notices,
      color: 'bg-warning/10 text-warning',
      section: 'notices'
    },
    { 
      icon: AlertTriangle, 
      labelBn: 'সতর্কতা', 
      labelEn: 'Warnings', 
      value: stats.warnings,
      color: 'bg-destructive/10 text-destructive',
      section: 'warnings'
    },
  ];

  const quickActions = [
    { 
      icon: MapPin, 
      labelBn: 'স্থান যোগ করুন', 
      labelEn: 'Add Place', 
      color: 'text-primary',
      action: () => onNavigate('places')
    },
    { 
      icon: Hotel, 
      labelBn: 'হোটেল যোগ করুন', 
      labelEn: 'Add Hotel', 
      color: 'text-category-hotel',
      action: () => onNavigate('hotels')
    },
    { 
      icon: Bell, 
      labelBn: 'নোটিশ পাঠান', 
      labelEn: 'Send Notice', 
      color: 'text-warning',
      action: () => onNavigate('notices')
    },
    { 
      icon: TrendingUp, 
      labelBn: 'রিপোর্ট দেখুন', 
      labelEn: 'View Reports', 
      color: 'text-success',
      action: () => navigate('/')
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <button 
              key={index} 
              onClick={() => onNavigate(card.section)}
              className="card-elevated p-4 text-left hover:shadow-lg transition-shadow"
            >
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
            </button>
          );
        })}
      </div>

      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 font-bangla">
          {language === 'bn' ? 'দ্রুত কাজ' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button 
                key={index}
                onClick={action.action}
                className="p-4 border border-border rounded-xl hover:bg-muted transition-colors text-center"
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${action.color}`} />
                <span className="text-sm font-medium font-bangla">
                  {language === 'bn' ? action.labelBn : action.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
