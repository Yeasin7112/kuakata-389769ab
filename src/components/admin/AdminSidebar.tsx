import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  LayoutDashboard,
  MapPin,
  Hotel,
  Image,
  Bell,
  Languages,
  Settings,
  LogOut,
  Building2,
  Bus,
  Phone,
  Calendar,
  Clock,
  Sun,
  X,
  Utensils,
  History,
  MessageSquare,
  Star,
  Users,
  Landmark,
  Award,
  Camera,
  MessageCircle,
  BarChart3,
  MessagesSquare,
} from 'lucide-react';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  onSectionChange,
  isOpen,
  onClose,
}) => {
  const { signOut } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, labelBn: 'ড্যাশবোর্ড', labelEn: 'Dashboard' },
    { id: 'reports', icon: BarChart3, labelBn: 'রিপোর্ট', labelEn: 'Reports' },
    { id: 'banners', icon: Image, labelBn: 'ব্যানার', labelEn: 'Banners' },
    { id: 'places', icon: MapPin, labelBn: 'দর্শনীয় স্থান', labelEn: 'Places' },
    { id: 'hotels', icon: Hotel, labelBn: 'হোটেল', labelEn: 'Hotels' },
    { id: 'restaurants', icon: Utensils, labelBn: 'রেস্টুরেন্ট', labelEn: 'Restaurants' },
    { id: 'banks', icon: Building2, labelBn: 'ব্যাংক/এটিএম', labelEn: 'Banks/ATM' },
    { id: 'transport', icon: Bus, labelBn: 'যাতায়াত', labelEn: 'Transport' },
    { id: 'emergency', icon: Phone, labelBn: 'জরুরি সেবা', labelEn: 'Emergency' },
    { id: 'warning-zones', icon: MapPin, labelBn: 'সতর্কতা এলাকা', labelEn: 'Warning Zones' },
    { id: 'beach-safety', icon: Sun, labelBn: 'বিচ সেফটি', labelEn: 'Beach Safety' },
    { id: 'tide-alerts', icon: Clock, labelBn: 'জোয়ার-ভাটা', labelEn: 'Tide Alerts' },
    { id: 'events', icon: Calendar, labelBn: 'ইভেন্ট', labelEn: 'Events' },
    { id: 'prayer-times', icon: Clock, labelBn: 'নামাজের সময়', labelEn: 'Prayer Times' },
    { id: 'sun-times', icon: Sun, labelBn: 'সূর্যোদয়/সূর্যাস্ত', labelEn: 'Sun Times' },
    { id: 'notices', icon: Bell, labelBn: 'নোটিশ', labelEn: 'Notices' },
    { id: 'about-kuakata', icon: History, labelBn: 'কুয়াকাটা সম্পর্কে', labelEn: 'About Kuakata' },
    { id: 'bus-counters', icon: Bus, labelBn: 'বাস কাউন্টার', labelEn: 'Bus Counters' },
    { id: 'dc-initiatives', icon: Landmark, labelBn: 'ডিসি উদ্যোগ', labelEn: 'DC Initiatives' },
    { id: 'beach-chairs', icon: Sun, labelBn: 'কিটকট চেয়ার', labelEn: 'Beach Chairs' },
    { id: 'tour-services', icon: Bus, labelBn: 'ট্যুর সার্ভিস', labelEn: 'Tour Services' },
    { id: 'local-guides', icon: Users, labelBn: 'ট্যুর গাইড', labelEn: 'Tour Guides' },
    { id: 'popular-foods', icon: Utensils, labelBn: 'জনপ্রিয় খাবার', labelEn: 'Popular Foods' },
    { id: 'children-rides', icon: MapPin, labelBn: 'শিশুদের রাইড', labelEn: 'Children Rides' },
    { id: 'shopping-markets', icon: Building2, labelBn: 'কেনাকাটা', labelEn: 'Shopping Markets' },
    { id: 'badges', icon: Award, labelBn: 'ব্যাজ', labelEn: 'Badges' },
    { id: 'photo-contests', icon: Camera, labelBn: 'ফটো প্রতিযোগিতা', labelEn: 'Photo Contests' },
    { id: 'community-qa', icon: MessageCircle, labelBn: 'প্রশ্নোত্তর', labelEn: 'Community Q&A' },
    { id: 'community-chat', icon: MessagesSquare, labelBn: 'কমিউনিটি চ্যাট', labelEn: 'Community Chat' },
    { id: 'complaints', icon: MessageSquare, labelBn: 'অভিযোগ', labelEn: 'Complaints' },
    { id: 'reviews', icon: Star, labelBn: 'রিভিউ', labelEn: 'Reviews' },
    { id: 'admins', icon: Users, labelBn: 'অ্যাডমিন', labelEn: 'Admins' },
    { id: 'translations', icon: Languages, labelBn: 'অনুবাদ', labelEn: 'Translations' },
    { id: 'settings', icon: Settings, labelBn: 'সেটিংস', labelEn: 'Settings' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border
        transform transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-foreground font-bangla">
                {language === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}
              </h1>
              <p className="text-xs text-muted-foreground">OurKuakata</p>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    onClose();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-colors
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-bangla">
                    {language === 'bn' ? item.labelBn : item.labelEn}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-bangla">
                {language === 'bn' ? 'লগ আউট' : 'Logout'}
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
