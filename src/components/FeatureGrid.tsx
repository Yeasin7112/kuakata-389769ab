import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import FeatureCard from './FeatureCard';
import {
  MapPin,
  Cloud,
  Building2,
  AlertTriangle,
  Umbrella,
  Bus,
  MessageSquare,
  Sparkles,
  Phone,
  Hotel,
  PartyPopper,
  Bell,
  Clock,
  Waves,
  Search,
  UserCheck,
  Camera,
  Shield,
} from 'lucide-react';

const FeatureGrid: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    { icon: MapPin, titleKey: 'touristSpots', color: '#0ea5e9' },
    { icon: Cloud, titleKey: 'weather', color: '#3b82f6' },
    { icon: Building2, titleKey: 'bankAtm', color: '#22c55e' },
    { icon: AlertTriangle, titleKey: 'warningZones', color: '#ef4444', badge: '!' },
    { icon: Umbrella, titleKey: 'beachChairs', color: '#f59e0b' },
    { icon: Bus, titleKey: 'localTransport', color: '#8b5cf6' },
    { icon: MessageSquare, titleKey: 'complaints', color: '#06b6d4' },
    { icon: Sparkles, titleKey: 'aiPlanner', color: '#ec4899', badge: 'AI' },
    { icon: Phone, titleKey: 'emergency', color: '#dc2626' },
    { icon: Hotel, titleKey: 'hotels', color: '#f43f5e' },
    { icon: PartyPopper, titleKey: 'events', color: '#eab308' },
    { icon: Bell, titleKey: 'notices', color: '#64748b' },
    { icon: Clock, titleKey: 'prayerTime', color: '#059669' },
    { icon: Waves, titleKey: 'tideAlert', color: '#0284c7' },
    { icon: Search, titleKey: 'lostFound', color: '#7c3aed' },
    { icon: UserCheck, titleKey: 'localGuide', color: '#0891b2' },
    { icon: Camera, titleKey: 'photoSpots', color: '#d946ef' },
    { icon: Shield, titleKey: 'beachSafety', color: '#16a34a' },
  ];

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground font-bangla">
          {t('featured')}
        </h3>
        <button className="text-sm text-primary font-medium">
          {t('seeAll')}
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {features.map((feature) => (
          <FeatureCard
            key={feature.titleKey}
            icon={feature.icon}
            title={t(feature.titleKey)}
            color={feature.color}
            badge={feature.badge}
          />
        ))}
      </div>
    </div>
  );
};

export default FeatureGrid;
