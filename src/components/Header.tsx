import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogIn, Shield, Building2, UtensilsCrossed } from 'lucide-react';

const Header: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  const { user, isAdmin, isHotelOwner, isRestaurantOwner } = useAuth();

  return (
    <header className="bg-gradient-header text-primary-foreground safe-area-top">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and App Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-lg">🌊</span>
            </div>
            <div>
              <h1 className="text-lg font-bold font-bangla">
                {language === 'bn' ? 'আমাদের কুয়াকাটা' : 'OurKuakata'}
              </h1>
              <p className="text-[10px] text-white/80 uppercase tracking-wide">
                {language === 'bn' ? 'স্মার্ট ট্যুরিস্ট গাইড' : 'KUAKATA SMART GUIDE'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className="px-3 py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 rounded-full transition-colors flex items-center gap-1"
            >
              <span className={language === 'bn' ? 'font-semibold' : 'opacity-70'}>বাংলা</span>
              <span className="opacity-50">|</span>
              <span className={language === 'en' ? 'font-semibold' : 'opacity-70'}>ENG</span>
            </button>
            
            {/* Admin Link */}
            {isAdmin && (
              <Link 
                to="/admin"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title="Admin Panel"
              >
                <Shield className="w-5 h-5" />
              </Link>
            )}

            {/* Hotel Owner Dashboard */}
            {isHotelOwner && (
              <Link 
                to="/hotel-dashboard"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title={language === 'bn' ? 'হোটেল ড্যাশবোর্ড' : 'Hotel Dashboard'}
              >
                <Building2 className="w-5 h-5" />
              </Link>
            )}

            {/* Restaurant Owner Dashboard */}
            {isRestaurantOwner && (
              <Link 
                to="/restaurant-dashboard"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title={language === 'bn' ? 'রেস্তোরাঁ ড্যাশবোর্ড' : 'Restaurant Dashboard'}
              >
                <UtensilsCrossed className="w-5 h-5" />
              </Link>
            )}
            
            {/* Login/Profile */}
            {user ? (
              <Link 
                to="/profile"
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <Link 
                to="/login"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <LogIn className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
