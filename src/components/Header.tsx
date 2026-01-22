import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bell, Search, Menu } from 'lucide-react';

const Header: React.FC = () => {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <header className="bg-gradient-header text-primary-foreground safe-area-top">
      <div className="px-4 py-3">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold font-bangla">{t('appName')}</h1>
              <p className="text-xs text-white/80">{t('tagline')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className="px-3 py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              {language === 'bn' ? 'EN' : 'বাং'}
            </button>
            
            {/* Notifications */}
            <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
            </button>
          </div>
        </div>
        
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('search')}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
