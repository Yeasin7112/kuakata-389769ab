import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, Compass, Heart, User } from 'lucide-react';

type Tab = 'home' | 'explore' | 'saved' | 'profile';

const BottomNav: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const tabs = [
    { id: 'home' as Tab, icon: Home, labelKey: 'home' },
    { id: 'explore' as Tab, icon: Compass, labelKey: 'explore' },
    { id: 'saved' as Tab, icon: Heart, labelKey: 'saved' },
    { id: 'profile' as Tab, icon: User, labelKey: 'profile' },
  ];

  return (
    <nav className="bottom-nav safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                <Icon 
                  className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} 
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-medium font-bangla ${isActive ? 'font-semibold' : ''}`}>
                {t(tab.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
