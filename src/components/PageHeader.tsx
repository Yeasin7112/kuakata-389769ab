import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, showBack = true, onBack, rightElement }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="bg-gradient-header text-primary-foreground safe-area-top sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <button 
                onClick={handleBack}
                className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-lg font-bold font-bangla">{title}</h1>
          </div>
          {rightElement && (
            <div>{rightElement}</div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
