import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Heart } from 'lucide-react';

interface SupportKuakataBannerProps {
  variant?: 'soft' | 'prominent';
  className?: string;
}

const SupportKuakataBanner: React.FC<SupportKuakataBannerProps> = ({ variant = 'soft', className = '' }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  if (variant === 'prominent') {
    return (
      <button
        onClick={() => navigate('/donate')}
        className={`w-full p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-200 dark:border-rose-800 text-left transition-all hover:shadow-md ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground font-bangla text-sm">
              {language === 'bn' ? 'কুয়াকাটাকে সাহায্য করুন' : 'Help Keep Kuakata Safe & Smart'}
            </p>
            <p className="text-xs text-muted-foreground font-bangla mt-0.5">
              {language === 'bn'
                ? 'আপনার সাপোর্টে এই ফ্রি সার্ভিস চালু থাকবে'
                : 'Your support keeps this free service running'}
            </p>
          </div>
          <span className="text-xs font-medium text-rose-600 bg-rose-100 dark:bg-rose-900/30 px-2 py-1 rounded-full shrink-0">
            {language === 'bn' ? 'সাপোর্ট' : 'Support'}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate('/donate')}
      className={`w-full py-2.5 px-4 rounded-xl bg-muted/50 border border-border text-left flex items-center gap-2 hover:bg-muted transition-colors ${className}`}
    >
      <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
      <span className="text-xs text-muted-foreground font-bangla flex-1">
        {language === 'bn' ? 'কুয়াকাটাকে সাপোর্ট করুন' : 'Support Kuakata'}
      </span>
      <span className="text-xs text-rose-500">→</span>
    </button>
  );
};

export default SupportKuakataBanner;
