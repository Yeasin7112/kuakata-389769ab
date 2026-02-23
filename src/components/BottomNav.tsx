import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, Compass, Heart, User, Mic } from 'lucide-react';
import GlobalSearch from '@/components/GlobalSearch';
import VoiceAssistant from '@/components/VoiceAssistant';

type Tab = 'home' | 'explore' | 'voice' | 'saved' | 'profile';

interface TabConfig {
  id: Tab;
  icon: React.ElementType;
  labelKey: string;
  path?: string;
  isAction?: boolean;
}

const BottomNav: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [showVoice, setShowVoice] = useState(false);

  const tabs: TabConfig[] = [
    { id: 'home', icon: Home, labelKey: 'home', path: '/' },
    { id: 'explore', icon: Compass, labelKey: 'explore', path: '/explore' },
    { id: 'voice', icon: Mic, labelKey: language === 'bn' ? 'ভয়েস' : 'Voice', isAction: true },
    { id: 'saved', icon: Heart, labelKey: 'saved', path: '/saved' },
    { id: 'profile', icon: User, labelKey: 'profile', path: '/profile' },
  ];

  const getActiveTab = (): Tab => {
    const currentPath = location.pathname;
    if (currentPath === '/') return 'home';
    if (currentPath.startsWith('/explore')) return 'explore';
    if (currentPath.startsWith('/saved')) return 'saved';
    if (currentPath.startsWith('/profile')) return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tab: TabConfig) => {
    if (tab.isAction) {
      setShowVoice(true);
    } else if (tab.path) {
      navigate(tab.path);
    }
  };

  return (
    <>
      <nav className="bottom-nav safe-area-bottom lg:hidden">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = !tab.isAction && activeTab === tab.id;
            const isSearchButton = tab.isAction;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                  isSearchButton
                    ? 'text-primary-foreground bg-primary hover:bg-primary/90 -mt-4 shadow-lg'
                    : isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                  <Icon 
                    className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`}
                    fill={isActive && !isSearchButton ? 'currentColor' : 'none'}
                  />
                </div>
                <span className={`text-[11px] font-bangla ${isActive || isSearchButton ? 'font-semibold' : 'font-medium'}`}>
                  {tab.isAction ? tab.labelKey : t(tab.labelKey)}
                </span>
                {isActive && !isSearchButton && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
      <VoiceAssistant isOpen={showVoice} onClose={() => setShowVoice(false)} />
    </>
  );
};

export default BottomNav;
