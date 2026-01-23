import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/hooks/useNotifications';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, AlertTriangle, Info, CheckCircle, Waves } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Notice {
  id: string;
  title_bn: string;
  title_en: string;
  content_bn: string | null;
  content_en: string | null;
  type: string;
  created_at: string;
}

interface BeachSafety {
  id: string;
  date: string;
  status: string;
  flag_color: string;
  notes_bn: string | null;
  notes_en: string | null;
  created_at: string;
}

const Notifications: React.FC = () => {
  const { language } = useLanguage();
  const { isSupported, permission, isEnabled, requestPermission, disableNotifications } = useNotifications();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [beachAlerts, setBeachAlerts] = useState<BeachSafety[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [noticesRes, beachRes] = await Promise.all([
        supabase
          .from('notices')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('beach_safety')
          .select('*')
          .order('date', { ascending: false })
          .limit(10)
      ]);

      if (noticesRes.data) setNotices(noticesRes.data);
      if (beachRes.data) setBeachAlerts(beachRes.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    setLoading(false);
  };

  const handleToggleNotifications = async () => {
    if (isEnabled) {
      await disableNotifications();
    } else {
      await requestPermission();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      default:
        return <Info className="w-5 h-5 text-info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-success/10 text-success';
      case 'caution':
        return 'bg-warning/10 text-warning';
      case 'dangerous':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto px-4 py-4 w-full">
        <h1 className="text-xl font-bold font-bangla mb-4">
          {language === 'bn' ? 'নোটিফিকেশন' : 'Notifications'}
        </h1>

        {/* Notification Settings Card */}
        <div className="card-elevated p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
                {isEnabled ? (
                  <Bell className="w-5 h-5 text-primary" />
                ) : (
                  <BellOff className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-semibold font-bangla">
                  {language === 'bn' ? 'পুশ নোটিফিকেশন' : 'Push Notifications'}
                </h3>
                <p className="text-xs text-muted-foreground font-bangla">
                  {isEnabled 
                    ? (language === 'bn' ? 'চালু আছে' : 'Enabled')
                    : (language === 'bn' ? 'বন্ধ আছে' : 'Disabled')}
                </p>
              </div>
            </div>
            {isSupported && permission !== 'denied' && (
              <Button
                size="sm"
                variant={isEnabled ? 'outline' : 'default'}
                onClick={handleToggleNotifications}
              >
                {isEnabled 
                  ? (language === 'bn' ? 'বন্ধ করুন' : 'Disable')
                  : (language === 'bn' ? 'চালু করুন' : 'Enable')}
              </Button>
            )}
          </div>
          {!isSupported && (
            <p className="text-xs text-destructive mt-2 font-bangla">
              {language === 'bn' 
                ? 'আপনার ব্রাউজার নোটিফিকেশন সাপোর্ট করে না'
                : 'Your browser does not support notifications'}
            </p>
          )}
          {permission === 'denied' && (
            <p className="text-xs text-destructive mt-2 font-bangla">
              {language === 'bn' 
                ? 'নোটিফিকেশন ব্লক করা আছে। ব্রাউজার সেটিংস থেকে অনুমতি দিন'
                : 'Notifications are blocked. Please enable in browser settings'}
            </p>
          )}
        </div>

        {/* Beach Safety Alerts */}
        {beachAlerts.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold font-bangla mb-3 flex items-center gap-2">
              <Waves className="w-5 h-5 text-primary" />
              {language === 'bn' ? 'বিচ সেফটি অ্যালার্ট' : 'Beach Safety Alerts'}
            </h2>
            <div className="space-y-2">
              {beachAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="card-elevated p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                      {alert.status === 'safe' 
                        ? (language === 'bn' ? 'নিরাপদ' : 'Safe')
                        : alert.status === 'caution'
                          ? (language === 'bn' ? 'সতর্কতা' : 'Caution')
                          : (language === 'bn' ? 'বিপদজনক' : 'Dangerous')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(alert.date), 'dd MMM yyyy')}
                    </span>
                  </div>
                  {(alert.notes_bn || alert.notes_en) && (
                    <p className="text-sm text-muted-foreground font-bangla">
                      {language === 'bn' ? alert.notes_bn : alert.notes_en}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Notices */}
        <div>
          <h2 className="text-lg font-semibold font-bangla mb-3 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            {language === 'bn' ? 'লাইভ নোটিশ' : 'Live Notices'}
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : notices.length === 0 ? (
            <div className="card-elevated p-6 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground font-bangla">
                {language === 'bn' ? 'কোনো নোটিশ নেই' : 'No notices available'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notices.map((notice) => (
                <div key={notice.id} className="card-elevated p-4">
                  <div className="flex items-start gap-3">
                    {getTypeIcon(notice.type)}
                    <div className="flex-1">
                      <h3 className="font-semibold font-bangla text-sm">
                        {language === 'bn' ? notice.title_bn : notice.title_en}
                      </h3>
                      {(notice.content_bn || notice.content_en) && (
                        <p className="text-sm text-muted-foreground font-bangla mt-1">
                          {language === 'bn' ? notice.content_bn : notice.content_en}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(notice.created_at), 'dd MMM yyyy, hh:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Notifications;
