import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, Globe } from 'lucide-react';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { language, toggleLanguage } = useLanguage();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-foreground font-bangla">
            {language === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-muted rounded-lg hover:bg-muted/80"
          >
            <Globe className="w-4 h-4" />
            {language === 'bn' ? 'EN' : 'বাং'}
          </button>
          
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground">
              {language === 'bn' ? 'অ্যাডমিন' : 'Admin'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
