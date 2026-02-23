import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import FeatureCard from './FeatureCard';
import VoiceAssistant from './VoiceAssistant';

const FeatureGrid: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);

  // Feature items with emojis matching the reference design
  const features = [
    { icon: '🏝️', titleBn: 'কুয়াকাটা সম্পর্কে', titleEn: 'About Kuakata', bgColor: '#E8F5E9', route: '/about-kuakata' },
    { icon: '💭', titleBn: 'লাইভ চ্যাট', titleEn: 'Live Chat', bgColor: '#E1F5FE', badge: 'LIVE', route: '/live-chat' },
    { icon: '☀️', titleBn: 'আবহাওয়া', titleEn: 'Weather', bgColor: '#FFF8E1', route: '/weather' },
    { icon: '🌊', titleBn: 'দর্শনীয় স্থান', titleEn: 'Tourist Spots', bgColor: '#E3F2FD', route: '/places' },
    { icon: '🏨', titleBn: 'হোটেল ও রিসোর্ট', titleEn: 'Hotels & Resorts', bgColor: '#E3F2FD', route: '/hotels' },
    { icon: '🍽️', titleBn: 'রেস্টুরেন্ট', titleEn: 'Restaurants', bgColor: '#FCE4EC', route: '/restaurants' },
    { icon: '🏥', titleBn: 'জরুরি সেবা', titleEn: 'Emergency', bgColor: '#E8F5E9', route: '/emergency' },
    { icon: '⚠️', titleBn: 'সতর্কতা এলাকা', titleEn: 'Warning Zones', bgColor: '#FFF8E1', route: '/warnings' },
    { icon: '🏄', titleBn: 'বিচ সেফটি', titleEn: 'Beach Safety', bgColor: '#FCE4EC', route: '/beach-safety' },
    { icon: '🕌', titleBn: 'নামাজের সময়', titleEn: 'Prayer Times', bgColor: '#E8F5E9', route: '/prayer-times' },
    { icon: '🗺️', titleBn: 'ট্যুরিস্ট ম্যাপ', titleEn: 'Tourist Map', bgColor: '#E8F5E9', badge: 'GPS', route: '/tourist-map' },
    { icon: '🛵', titleBn: 'স্থানীয় যাতায়াত', titleEn: 'Local Transport', bgColor: '#FFF8E1', route: '/transport' },
    { icon: '🚌', titleBn: 'বাস কাউন্টার', titleEn: 'Bus Counter', bgColor: '#E3F2FD', route: '/bus-counters' },
    { icon: '🚤', titleBn: 'ট্যুর অপারেটর', titleEn: 'Tour Operators', bgColor: '#E0F7FA', route: '/tour-operators' },
    { icon: '🏧', titleBn: 'ব্যাংক', titleEn: 'Bank', bgColor: '#E0F2F1', route: '/banks' },
    { icon: '🔔', titleBn: 'লাইভ নোটিশ', titleEn: 'Live Notice', bgColor: '#FFF3E0', route: '/notices' },
    { icon: '🍽️', titleBn: 'জনপ্রিয় খাবার', titleEn: 'Popular Foods', bgColor: '#FFF3E0', route: '/popular-foods' },
    { icon: '🏖️', titleBn: 'কিটকট চেয়ার', titleEn: 'Beach Chairs', bgColor: '#FCE4EC', route: '/beach-chairs' },
    { icon: '🛍️', titleBn: 'কেনাকাটা', titleEn: 'Shopping', bgColor: '#E8F5E9', route: '/shopping-markets' },
    { icon: '🤖', titleBn: 'এআই ট্যুর প্ল্যানার', titleEn: 'AI Tour Planner', bgColor: '#FCE4EC', badge: 'AI', route: '/ai-planner' },
    { icon: '🎤', titleBn: 'ভয়েস অ্যাসিস্ট্যান্ট', titleEn: 'Voice Assistant', bgColor: '#E1F5FE', badge: 'NEW', route: 'voice' },
    { icon: '📷', titleBn: 'AR ক্যামেরা', titleEn: 'AR Camera', bgColor: '#F3E5F5', badge: 'AR', route: '/ar-camera' },
    { icon: '🏛️', titleBn: 'ডিসি উদ্যোগ', titleEn: 'DC Initiatives', bgColor: '#F3E5F5', route: '/dc-initiatives' },
    { icon: '💬', titleBn: 'প্রশ্নোত্তর', titleEn: 'Community Q&A', bgColor: '#E8F5E9', route: '/community-qa' },
    { icon: '🎡', titleBn: 'শিশুদের রাইড', titleEn: 'Children Rides', bgColor: '#FCE4EC', route: '/children-rides' },
    { icon: '📝', titleBn: 'অভিযোগ ও পরামর্শ', titleEn: 'Complaints', bgColor: '#FFEBEE', route: '/complaints' },
    { icon: '📸', titleBn: 'ফটো প্রতিযোগিতা', titleEn: 'Photo Contest', bgColor: '#E1F5FE', badge: 'WIN', route: '/photo-contest' },
    { icon: '📔', titleBn: 'ভ্রমণ ডায়েরি', titleEn: 'Travel Diary', bgColor: '#F3E5F5', route: '/travel-diary' },
    { icon: '🏆', titleBn: 'ব্যাজ সংগ্রহ', titleEn: 'Badges', bgColor: '#FFF8E1', badge: 'NEW', route: '/badges' },
    { icon: '📸', titleBn: 'ফটোগ্রাফার', titleEn: 'Photographers', bgColor: '#E1F5FE', badge: 'NEW', route: '/photographers' },
    { icon: '🤝', titleBn: 'সাপোর্ট করুন', titleEn: 'Support Kuakata', bgColor: '#FFEBEE', badge: '❤️', route: '/donate' },
  ];

  const handleFeatureClick = (route: string) => {
    if (route === 'voice') {
      setShowVoiceAssistant(true);
    } else {
      navigate(route);
    }
  };

  return (
    <>
      <div className="px-4 py-4">
        <div className="card-elevated p-4">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 lg:gap-4">
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
      <VoiceAssistant isOpen={showVoiceAssistant} onClose={() => setShowVoiceAssistant(false)} />
    </>
  );
};

export default FeatureGrid;
