import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, X } from 'lucide-react';

interface NotificationBannerProps {
  onDismiss: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ onDismiss }) => {
  const { language } = useLanguage();
  const { isSupported, permission, requestPermission, isEnabled, disableNotifications } = useNotifications();

  if (!isSupported || permission === 'denied') {
    return null;
  }

  if (permission === 'granted' && isEnabled) {
    return null;
  }

  const handleEnable = async () => {
    const granted = await requestPermission();
    if (granted) {
      onDismiss();
    }
  };

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mx-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-primary/20">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold font-bangla text-sm">
            {language === 'bn' ? 'নোটিফিকেশন চালু করুন' : 'Enable Notifications'}
          </h4>
          <p className="text-xs text-muted-foreground font-bangla mt-0.5">
            {language === 'bn' 
              ? 'লাইভ নোটিশ ও বিচ সেফটি অ্যালার্ট পেতে নোটিফিকেশন চালু করুন' 
              : 'Get live notices and beach safety alerts'}
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleEnable} className="gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              {language === 'bn' ? 'চালু করুন' : 'Enable'}
            </Button>
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              {language === 'bn' ? 'পরে' : 'Later'}
            </Button>
          </div>
        </div>
        <button onClick={onDismiss} className="p-1 rounded hover:bg-muted">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default NotificationBanner;
