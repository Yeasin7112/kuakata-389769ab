import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DashboardOverview from '@/components/admin/DashboardOverview';
import PlacesManager from '@/components/admin/PlacesManager';
import HotelsManager from '@/components/admin/HotelsManager';
import BannersManager from '@/components/admin/BannersManager';
import NoticesManager from '@/components/admin/NoticesManager';
import TranslationsManager from '@/components/admin/TranslationsManager';
import SettingsManager from '@/components/admin/SettingsManager';
import BanksManager from '@/components/admin/BanksManager';
import TransportManager from '@/components/admin/TransportManager';
import EmergencyManager from '@/components/admin/EmergencyManager';
import EventsManager from '@/components/admin/EventsManager';
import PrayerTimesManager from '@/components/admin/PrayerTimesManager';
import SunTimesManager from '@/components/admin/SunTimesManager';
import WarningZonesManager from '@/components/admin/WarningZonesManager';
import BeachSafetyManager from '@/components/admin/BeachSafetyManager';
import TideAlertsManager from '@/components/admin/TideAlertsManager';
import RestaurantsManager from '@/components/admin/RestaurantsManager';
import AboutKuakataManager from '@/components/admin/AboutKuakataManager';
import ComplaintsManager from '@/components/admin/ComplaintsManager';
import ReviewsManager from '@/components/admin/ReviewsManager';
import AdminsManager from '@/components/admin/AdminsManager';
import BusCountersManager from '@/components/admin/BusCountersManager';
import DcInitiativesManager from '@/components/admin/DcInitiativesManager';
import BeachChairsManager from '@/components/admin/BeachChairsManager';
import TourServicesManager from '@/components/admin/TourServicesManager';
import LocalGuidesManager from '@/components/admin/LocalGuidesManager';
import PopularFoodsManager from '@/components/admin/PopularFoodsManager';
import ChildrenRidesManager from '@/components/admin/ChildrenRidesManager';
import ShoppingMarketsManager from '@/components/admin/ShoppingMarketsManager';
import BadgesManager from '@/components/admin/BadgesManager';
import PhotoContestsManager from '@/components/admin/PhotoContestsManager';
import CommunityQAManager from '@/components/admin/CommunityQAManager';
import ReportsManager from '@/components/admin/ReportsManager';
import { Loader2 } from 'lucide-react';

type AdminSection = 
  | 'dashboard' 
  | 'places' 
  | 'hotels' 
  | 'restaurants'
  | 'banners' 
  | 'notices' 
  | 'translations' 
  | 'settings'
  | 'banks'
  | 'transport'
  | 'emergency'
  | 'events'
  | 'prayer-times'
  | 'sun-times'
  | 'warning-zones'
  | 'beach-safety'
  | 'tide-alerts'
  | 'about-kuakata'
  | 'complaints'
  | 'reviews'
  | 'admins'
  | 'bus-counters'
  | 'dc-initiatives'
  | 'beach-chairs'
  | 'tour-services'
  | 'local-guides'
  | 'popular-foods'
  | 'children-rides'
  | 'shopping-markets'
  | 'badges'
  | 'photo-contests'
  | 'community-qa'
  | 'reports';

const AdminDashboard: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card-elevated p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            {language === 'bn' ? 'অ্যাক্সেস নিষিদ্ধ' : 'Access Denied'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === 'bn' 
              ? 'এই পৃষ্ঠায় প্রবেশ করতে অ্যাডমিন অনুমতি প্রয়োজন।' 
              : 'You need admin permissions to access this page.'}
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            {language === 'bn' ? 'হোমে ফিরে যান' : 'Go to Home'}
          </button>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview onNavigate={(section) => setActiveSection(section as AdminSection)} />;
      case 'places':
        return <PlacesManager />;
      case 'hotels':
        return <HotelsManager />;
      case 'banners':
        return <BannersManager />;
      case 'notices':
        return <NoticesManager />;
      case 'translations':
        return <TranslationsManager />;
      case 'settings':
        return <SettingsManager />;
      case 'banks':
        return <BanksManager />;
      case 'transport':
        return <TransportManager />;
      case 'emergency':
        return <EmergencyManager />;
      case 'events':
        return <EventsManager />;
      case 'prayer-times':
        return <PrayerTimesManager />;
      case 'sun-times':
        return <SunTimesManager />;
      case 'warning-zones':
        return <WarningZonesManager />;
      case 'beach-safety':
        return <BeachSafetyManager />;
      case 'tide-alerts':
        return <TideAlertsManager />;
      case 'restaurants':
        return <RestaurantsManager />;
      case 'about-kuakata':
        return <AboutKuakataManager />;
      case 'complaints':
        return <ComplaintsManager />;
      case 'reviews':
        return <ReviewsManager />;
      case 'admins':
        return <AdminsManager />;
      case 'bus-counters':
        return <BusCountersManager />;
      case 'dc-initiatives':
        return <DcInitiativesManager />;
      case 'beach-chairs':
        return <BeachChairsManager />;
      case 'tour-services':
        return <TourServicesManager />;
      case 'local-guides':
        return <LocalGuidesManager />;
      case 'popular-foods':
        return <PopularFoodsManager />;
      case 'children-rides':
        return <ChildrenRidesManager />;
      case 'shopping-markets':
        return <ShoppingMarketsManager />;
      case 'badges':
        return <BadgesManager />;
      case 'photo-contests':
        return <PhotoContestsManager />;
      case 'community-qa':
        return <CommunityQAManager />;
      case 'reports':
        return <ReportsManager />;
      default:
        return <DashboardOverview onNavigate={(section) => setActiveSection(section as AdminSection)} />;
    }
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <AdminSidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <AdminHeader 
          onMenuClick={() => setSidebarOpen(true)} 
          onSelectSection={(section) => setActiveSection(section as AdminSection)}
        />
        <main className="flex-1 p-4 lg:p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
