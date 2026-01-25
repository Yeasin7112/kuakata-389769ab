import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import FeatureCard from './FeatureCard';

const FeatureGrid: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Feature items with emojis matching the reference design
  const features = [
    { 
      icon: '🏛️', 
      titleBn: 'দর্শনীয় স্থান', 
      titleEn: 'Tourist Spots', 
      bgColor: '#E3F2FD',
      route: '/places'
    },
    { 
      icon: '☀️', 
      titleBn: 'আবহাওয়া', 
      titleEn: 'Weather', 
      bgColor: '#FFF8E1',
      route: '/weather'
    },
    { 
      icon: '🏧', 
      titleBn: 'ব্যাংক', 
      titleEn: 'Bank', 
      bgColor: '#E0F2F1',
      route: '/banks'
    },
    { 
      icon: '⚠️', 
      titleBn: 'সতর্কতা এলাকা', 
      titleEn: 'Warning Zones', 
      bgColor: '#FFF8E1',
      route: '/warnings'
    },
    { 
      icon: '🏖️', 
      titleBn: 'কিটকট চেয়ার', 
      titleEn: 'Beach Chairs', 
      bgColor: '#FCE4EC',
      route: '/beach-chairs'
    },
    { 
      icon: '🛵', 
      titleBn: 'স্থানীয় যাতায়াত', 
      titleEn: 'Local Transport', 
      bgColor: '#FFF8E1',
      route: '/transport'
    },
    { 
      icon: '🤖', 
      titleBn: 'এআই ট্যুর প্ল্যানার', 
      titleEn: 'AI Tour Planner', 
      bgColor: '#FCE4EC',
      badge: 'AI',
      route: '/ai-planner'
    },
    { 
      icon: '🏥', 
      titleBn: 'জরুরি সেবা', 
      titleEn: 'Emergency', 
      bgColor: '#E8F5E9',
      route: '/emergency'
    },
    { 
      icon: '🏨', 
      titleBn: 'হোটেল ও রিসোর্ট', 
      titleEn: 'Hotels & Resorts', 
      bgColor: '#E3F2FD',
      route: '/hotels'
    },
    { 
      icon: '🍽️', 
      titleBn: 'রেস্টুরেন্ট', 
      titleEn: 'Restaurants', 
      bgColor: '#FCE4EC',
      route: '/restaurants'
    },
    { 
      icon: '🏄', 
      titleBn: 'বিচ সেফটি', 
      titleEn: 'Beach Safety', 
      bgColor: '#FCE4EC',
      route: '/beach-safety'
    },
    { 
      icon: '🔔', 
      titleBn: 'লাইভ নোটিশ', 
      titleEn: 'Live Notice', 
      bgColor: '#FFF3E0',
      route: '/notices'
    },
    { 
      icon: '🏝️', 
      titleBn: 'কুয়াকাটা সম্পর্কে', 
      titleEn: 'About Kuakata', 
      bgColor: '#E8F5E9',
      route: '/about-kuakata'
    },
    { 
      icon: '🚌', 
      titleBn: 'বাস কাউন্টার', 
      titleEn: 'Bus Counter', 
      bgColor: '#E3F2FD',
      route: '/bus-counters'
    },
    { 
      icon: '🏛️', 
      titleBn: 'ডিসি উদ্যোগ', 
      titleEn: 'DC Initiatives', 
      bgColor: '#F3E5F5',
      route: '/dc-initiatives'
    },
    { 
      icon: '🚤', 
      titleBn: 'ট্যুর অপারেটর', 
      titleEn: 'Tour Operators', 
      bgColor: '#E0F7FA',
      route: '/tour-operators'
    },
    { 
      icon: '🍽️', 
      titleBn: 'জনপ্রিয় খাবার', 
      titleEn: 'Popular Foods', 
      bgColor: '#FFF3E0',
      route: '/popular-foods'
    },
    { 
      icon: '🎡', 
      titleBn: 'শিশুদের রাইড', 
      titleEn: 'Children Rides', 
      bgColor: '#FCE4EC',
      route: '/children-rides'
    },
    { 
      icon: '🛍️', 
      titleBn: 'কেনাকাটা', 
      titleEn: 'Shopping', 
      bgColor: '#E8F5E9',
      route: '/shopping-markets'
    },
    { 
      icon: '📝', 
      titleBn: 'অভিযোগ ও পরামর্শ', 
      titleEn: 'Complaints', 
      bgColor: '#FFEBEE',
      route: '/complaints'
    },
  ];

  const handleFeatureClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="px-4 py-4">
      <div className="card-elevated p-4">
        <div className="grid grid-cols-4 gap-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={language === 'bn' ? feature.titleBn : feature.titleEn}
              bgColor={feature.bgColor}
              badge={feature.badge}
              onClick={() => handleFeatureClick(feature.route)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureGrid;
