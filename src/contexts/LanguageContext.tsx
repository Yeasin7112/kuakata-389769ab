import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'bn' | 'en';

interface Translations {
  [key: string]: {
    bn: string;
    en: string;
  };
}

const translations: Translations = {
  appName: { bn: 'আওয়ার কুয়াকাটা', en: 'OurKuakata' },
  tagline: { bn: 'স্মার্ট ট্যুরিস্ট গাইড', en: 'Smart Tourist Guide' },
  welcomeMessage: { bn: 'কুয়াকাটায় স্বাগতম!', en: 'Welcome to Kuakata!' },
  sunrise: { bn: 'সূর্যোদয়', en: 'Sunrise' },
  sunset: { bn: 'সূর্যাস্ত', en: 'Sunset' },
  online: { bn: 'অনলাইন', en: 'Online' },
  offline: { bn: 'অফলাইন', en: 'Offline' },
  
  // Menu items
  touristSpots: { bn: 'দর্শনীয় স্থান', en: 'Tourist Spots' },
  weather: { bn: 'আবহাওয়া', en: 'Weather' },
  bankAtm: { bn: 'ব্যাংক/এটিএম', en: 'Bank/ATM' },
  warningZones: { bn: 'সতর্কতা এলাকা', en: 'Warning Zones' },
  beachChairs: { bn: 'কিটকট চেয়ার', en: 'Beach Chairs' },
  localTransport: { bn: 'স্থানীয় যাতায়াত', en: 'Local Transport' },
  complaints: { bn: 'অভিযোগ ও উপদেশ', en: 'Complaints & Advice' },
  aiPlanner: { bn: 'এআই ট্যুর প্ল্যানার', en: 'AI Tour Planner' },
  emergency: { bn: 'জরুরি সেবা', en: 'Emergency' },
  hotels: { bn: 'হোটেল ও রেস্টুরেন্ট', en: 'Hotels & Restaurants' },
  events: { bn: 'ইভেন্ট ও উৎসব', en: 'Events & Festivals' },
  notices: { bn: 'লাইভ নোটিশ', en: 'Live Notices' },
  prayerTime: { bn: 'নামাজের সময়', en: 'Prayer Times' },
  tideAlert: { bn: 'জোয়ার-ভাটা', en: 'Tide Alert' },
  lostFound: { bn: 'হারানো-পাওয়া', en: 'Lost & Found' },
  localGuide: { bn: 'লোকাল গাইড', en: 'Local Guide' },
  photoSpots: { bn: 'ফটো স্পট', en: 'Photo Spots' },
  beachSafety: { bn: 'বিচ সেফটি', en: 'Beach Safety' },
  
  // Bottom nav
  home: { bn: 'হোম', en: 'Home' },
  explore: { bn: 'এক্সপ্লোর', en: 'Explore' },
  saved: { bn: 'সংরক্ষিত', en: 'Saved' },
  profile: { bn: 'প্রোফাইল', en: 'Profile' },
  
  // Common
  seeAll: { bn: 'সব দেখুন', en: 'See All' },
  loading: { bn: 'লোড হচ্ছে...', en: 'Loading...' },
  search: { bn: 'খুঁজুন...', en: 'Search...' },
  nearYou: { bn: 'আপনার কাছে', en: 'Near You' },
  popular: { bn: 'জনপ্রিয়', en: 'Popular' },
  featured: { bn: 'ফিচার্ড', en: 'Featured' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('bn');

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language];
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'bn' ? 'en' : 'bn');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
